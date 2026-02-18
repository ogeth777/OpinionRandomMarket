const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Helper to fetch data
function fetchUrl(url) {
    console.log('Fetching:', url);
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            console.log('Response status:', res.statusCode);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });
        req.on('error', (err) => {
            console.error('Request error:', err);
            reject(err);
        });
    });
}

// Download binary file from url to filepath
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                file.close(() => fs.unlink(destPath, () => resolve(false)));
                return resolve(false);
            }
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve(true)));
        }).on('error', (err) => {
            file.close(() => fs.unlink(destPath, () => resolve(false)));
        });
    });
}

// Helper to check if image exists
function checkImage(url) {
    return new Promise((resolve) => {
        if (!url) return resolve(false);
        const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function fetchTopicImageFlexible(topicId, fallbackTitle) {
    // Try Opinion openapi endpoints if key present
    const apiKey = process.env.OPINION_API_KEY || process.env.VITE_OPINION_API_KEY || '';
    const pickImage = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        const candidates = [
            obj?.result?.iconUrl, obj?.result?.icon, obj?.result?.logo, obj?.result?.cover, obj?.result?.imgUrl, obj?.result?.image, obj?.result?.topicIcon,
            obj?.data?.iconUrl,   obj?.data?.icon,   obj?.data?.logo,   obj?.data?.cover,   obj?.data?.imgUrl,   obj?.data?.image,   obj?.data?.topicIcon,
            obj?.iconUrl, obj?.icon, obj?.logo, obj?.cover, obj?.imgUrl, obj?.image, obj?.topicIcon
        ];
        const url = candidates.find(u => typeof u === 'string' && /^https?:\/\//i.test(u));
        return url || null;
    };
    const tryEndpoint = (path) => new Promise((resolve) => {
        const base = `https://proxy.opinion.trade:8443/openapi${path}`;
        const u = new URL(base);
        if (!u.searchParams.has('topic_id')) u.searchParams.append('topic_id', String(topicId));
        const headers = { 'User-Agent': 'Mozilla/5.0' };
        if (apiKey) headers['apikey'] = apiKey;
        https.get(u.toString(), { headers }, (res) => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(buf);
                    resolve(json);
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
    const endpoints = ['/topic/detail', '/topic', '/topic/get'];
    for (const ep of endpoints) {
        const json = await tryEndpoint(ep);
        const img = pickImage(json);
        if (img) return img;
    }
    // Fallback: parse og:image from public page via r.jina.ai
    const ogProxy = `https://r.jina.ai/http://app.opinion.trade/detail?topicId=${encodeURIComponent(String(topicId))}`;
    const html = await new Promise((resolve) => {
        https.get(ogProxy, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => resolve(buf));
        }).on('error', () => resolve(''));
    });
    const m = html && html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (m && m[1]) {
        let url = m[1].trim();
        if (url.startsWith('//')) url = 'https:' + url;
        if (url.startsWith('/')) url = 'https://app.opinion.trade' + url;
        if (/^https?:\/\//i.test(url)) return url;
    }
    return null;
}

async function main() {
    const apiKey = process.env.OPINION_API_KEY || process.env.VITE_OPINION_API_KEY || '';
    if (apiKey) {
        console.log('Fetching markets from Opinion OpenAPI...');
        const url = 'https://proxy.opinion.trade:8443/openapi/market?status=activated&sortBy=5&limit=20';
        const eventsResp = await new Promise((resolve, reject) => {
            const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'apikey': apiKey } }, (res) => {
                let buf = '';
                res.on('data', (c) => buf += c);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(buf));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', (err) => reject(err));
        });
        if (!eventsResp || eventsResp.code !== 0) throw new Error('Opinion API error');
        const list = eventsResp.result?.list || [];
        console.log(`Fetched ${list.length} markets from Opinion`);
        const validEvents = [];
        // Ensure local icons directory
        const iconsDir = path.join(__dirname, '../public/opinion-icons');
        if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
        let count = 0;
        for (const m of list) {
            if (count >= 20) break;
            const topicId = m.topicId || m.marketId;
            // Try to fetch and download official icon for this topic
            let localIconPath = `/opinion-icons/${topicId}.png`;
            const absIconPath = path.join(iconsDir, `${topicId}.png`);
            try {
                const imgUrl = await fetchTopicImageFlexible(topicId, m.marketTitle);
                if (imgUrl) {
                    const ok = await downloadFile(imgUrl, absIconPath);
                    if (!ok) {
                        localIconPath = "https://opinion.trade/static/opinion-logo.svg";
                    }
                } else {
                    localIconPath = "https://opinion.trade/static/opinion-logo.svg";
                }
            } catch {
                localIconPath = "https://opinion.trade/static/opinion-logo.svg";
            }
            const eventData = {
                id: `op-${m.marketId}`,
                title: m.marketTitle,
                slug: String(m.marketId),
                topicId,
                image: localIconPath,
                markets: [{
                    id: m.marketId,
                    question: m.marketTitle,
                    slug: String(m.marketId),
                    topicId,
                    outcomePrices: ["0.50","0.50"],
                    volume: m.volume || '0',
                    liquidity: '0',
                    active: m.statusEnum === 'Activated',
                    closed: false
                }],
                volume: m.volume || '0',
                liquidity: '0',
                active: m.statusEnum === 'Activated',
                closed: false
            };
            validEvents.push(eventData);
            count++;
        }
        // Generate TS
        const fileContent = `import type { OpinionEvent } from '../types';

// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated by scripts/update_markets.cjs (Opinion mode)
// Last updated: ${new Date().toISOString()}

export const MOCK_EVENTS: OpinionEvent[] = ${JSON.stringify(validEvents, null, 2)};
`;
        const outputPath = path.join(__dirname, '../src/utils/mock_data.ts');
        fs.writeFileSync(outputPath, fileContent);
        console.log(`Successfully updated mock_data.ts with ${validEvents.length} Opinion markets.`);
        return;
    }
    console.log('Fetching top events from Polymarket...');
    try {
        // Fetch top 50 to have buffer for validation
        // Using params from api.ts: closed=false, active=true, limit=50, order=volume, ascending=false
        const events = await fetchUrl('https://gamma-api.polymarket.com/events?limit=50&active=true&closed=false&order=volume&ascending=false');
        console.log(`Fetched ${events ? events.length : 0} events from API`);

        if (!Array.isArray(events)) {
            console.error('API returned non-array:', events);
            process.exit(1);
        }
        
        const validEvents = [];
        let count = 0;

        for (const e of events) {
            if (count >= 20) break;

            // Basic validation
            if (!e.markets || e.markets.length === 0) continue;

            // Find valid market (with outcome prices)
            const validMarket = e.markets.find(m => 
                m.outcomePrices && 
                (Array.isArray(m.outcomePrices) ? m.outcomePrices.length >= 2 : JSON.parse(m.outcomePrices).length >= 2)
            );

            if (!validMarket) continue;

            // Image validation
            let imageUrl = e.image || e.icon || validMarket.image || validMarket.icon;
            if (!imageUrl) {
                // Fallback images based on tags/title could go here, but for now skip or use generic
                imageUrl = "https://polymarket.com/static/logo-icon.svg"; // Generic fallback
            }

            // Verify image URL works
            const isImageValid = await checkImage(imageUrl);
            if (!isImageValid) {
                console.warn(`Skipping event ${e.slug} due to invalid image: ${imageUrl}`);
                // Try to use a fallback if it's a known category, otherwise skip
                continue; 
            }

            // Format data
            let outcomePrices = validMarket.outcomePrices;
            if (typeof outcomePrices === 'string') outcomePrices = JSON.parse(outcomePrices);
            
            const eventData = {
                id: `mock-${count + 1}`, // Keep consistent IDs for the roulette
                title: e.title,
                slug: e.slug,
                image: imageUrl,
                markets: [{
                    id: `m${count + 1}`,
                    question: validMarket.question,
                    slug: e.slug, // Use event slug for link consistency
                    outcomePrices: outcomePrices.map(String),
                    volume: e.volume || '0',
                    liquidity: e.liquidity || '0',
                    active: true,
                    closed: false
                }],
                volume: e.volume || '0',
                liquidity: e.liquidity || '0',
                active: true,
                closed: false
            };

            validEvents.push(eventData);
            count++;
            console.log(`Added: ${e.title}`);
        }

        if (validEvents.length < 10) {
            console.error('Too few valid events found! Aborting update to avoid breaking UI.');
            process.exit(1);
        }

        // Generate TS file content
        const fileContent = `import type { PolymarketEvent } from '../types';

// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated by scripts/update_markets.cjs
// Last updated: ${new Date().toISOString()}

export const MOCK_EVENTS: PolymarketEvent[] = ${JSON.stringify(validEvents, null, 2)};
`;

        const outputPath = path.join(__dirname, '../src/utils/mock_data.ts');
        fs.writeFileSync(outputPath, fileContent);
        console.log(`Successfully updated mock_data.ts with ${validEvents.length} events.`);

    } catch (err) {
        console.error('Error updating markets:', err);
        process.exit(1);
    }
}

main();
