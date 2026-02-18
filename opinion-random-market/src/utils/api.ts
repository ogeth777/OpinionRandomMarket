import type { OpinionEvent, FetchParams } from '../types';

const OPINION_API_URL = "https://proxy.opinion.trade:8443/openapi";
// Read API key from Vite env (browser) or Node env (scripts)
const OPINION_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPINION_API_KEY) ||
  process.env?.OPINION_API_KEY ||
  ""; 

interface OpinionMarket {
  marketId: number;
  topicId?: number;
  marketTitle: string;
  status: number;
  statusEnum: string;
  yesTokenId: string;
  noTokenId: string;
  volume: string;
  volume24h: string;
}

interface OpinionResponse {
  code: number;
  msg: string;
  result: {
    total: number;
    list: OpinionMarket[];
  };
}

const fetchTokenLatestPrice = async (tokenId: string): Promise<number | null> => {
  if (!tokenId || !OPINION_API_KEY) return null;

  try {
    const url = new URL(`${OPINION_API_URL}/token/latest-price`);
    url.searchParams.append('token_id', tokenId);

    const response = await fetch(url.toString(), {
      headers: {
        apikey: OPINION_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Opinion latest-price error: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json();
    const data: any = raw;
    let priceStr =
      data?.result?.price ??
      data?.result?.p ??
      data?.price ??
      null;

    if (typeof priceStr === 'string') {
      priceStr = priceStr.replace('%', '').trim();
    }

    let price = priceStr != null ? parseFloat(String(priceStr)) : NaN;
    if (Number.isNaN(price) || price <= 0) {
      return null;
    }

    // API может вернуть 56 вместо 0.56 — нормализуем
    if (price > 1 && price <= 100) {
      price = price / 100;
    }

    if (price >= 1) {
      return null;
    }

    return price;
  } catch (err) {
    console.warn('Failed to fetch latest price for token', tokenId, err);
    return null;
  }
};

const inferMarketImage = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('bitcoin') || t.includes('btc')) {
    return 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
  }
  if (t.includes('ethereum') || t.includes('eth')) {
    return 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
  }
  if (t.includes('solana') || t.includes('sol ')) {
    return 'https://cryptologos.cc/logos/solana-sol-logo.png';
  }
  if (t.includes('bnb') || t.includes('binance')) {
    return 'https://cryptologos.cc/logos/bnb-bnb-logo.png';
  }
  if (t.includes('apple')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';
  }
   if (t.includes('hyperliquid')) {
    return 'https://hyperliquid.xyz/logo512.png';
  }
  if (t.includes('lpl') || t.includes('lol pro league')) {
    return 'https://upload.wikimedia.org/wikipedia/en/3/3f/League_of_Legends_Pro_League_logo.png';
  }
  if (t.includes('inflation') || t.includes('cpi') || t.includes('fed') || t.includes('interest rate')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/e/e0/US_Dollar_Sign_font_awesome.svg';
  }
  if (t.includes('election') || t.includes('president') || t.includes('prime minister')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/5/5c/United_Nations_emblem_blue.svg';
  }
  if (t.includes('moon') || t.includes('mars') || t.includes('space')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg';
  }
  if (t.includes('quake') || t.includes('earthquake')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Earthquake_icon.svg';
  }
  if (t.includes('epstein')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/9/99/Question_book-new.svg';
  }
  return '';
};

// Try to find an official icon/image for a topic directly from Opinion
const fetchTopicImageFlexible = async (topicId: number | string, fallbackTitle?: string): Promise<string> => {
  try {
    // Helper to safely extract a URL from arbitrary response shapes
    const pickImage = (obj: any): string | null => {
      if (!obj || typeof obj !== 'object') return null;
      const candidates = [
        obj?.result?.iconUrl, obj?.result?.icon, obj?.result?.logo, obj?.result?.cover, obj?.result?.imgUrl, obj?.result?.image, obj?.result?.topicIcon,
        obj?.data?.iconUrl,   obj?.data?.icon,   obj?.data?.logo,   obj?.data?.cover,   obj?.data?.imgUrl,   obj?.data?.image,   obj?.data?.topicIcon,
        obj?.iconUrl, obj?.icon, obj?.logo, obj?.cover, obj?.imgUrl, obj?.image, obj?.topicIcon
      ];
      const url = candidates.find((u: any) => typeof u === 'string' && /^https?:\/\//i.test(u));
      return url || null;
    };

    // Attempt several API endpoints (with key if available)
    const tryEndpoint = async (path: string) => {
      const url = new URL(`${OPINION_API_URL}${path}`);
      if (path.includes('?')) {
        // path already has query
      } else {
        // noop
      }
      // Add query if needed
      if (path.includes('topic') && path.includes('?') && !path.includes('topic_id=')) {
        url.searchParams.append('topic_id', String(topicId));
      }
      if (!path.includes('?')) {
        // default ?topic_id=
        url.searchParams.append('topic_id', String(topicId));
      }
      const resp = await fetch(url.toString(), {
        headers: OPINION_API_KEY ? { apikey: OPINION_API_KEY, 'Content-Type': 'application/json' } : {}
      });
      if (!resp.ok) return null;
      const json = await resp.json().catch(() => null);
      return json;
    };

    const endpoints = [
      `/topic/detail`,
      `/topic`,
      `/topic/get`,
    ];

    for (const ep of endpoints) {
      try {
        const json = await tryEndpoint(ep);
        const img = pickImage(json);
        if (img) return img;
      } catch {}
    }

    // Fallback: parse og:image from the public detail page via CORS-friendly proxy
    // r.jina.ai fetches remote content with permissive CORS
    const ogProxy = `https://r.jina.ai/http://app.opinion.trade/detail?topicId=${encodeURIComponent(String(topicId))}`;
    const text = await fetch(ogProxy).then(r => r.ok ? r.text() : '').catch(() => '');
    if (text) {
      const m = text.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (m && m[1]) {
        let url = m[1].trim();
        if (url.startsWith('//')) url = 'https:' + url;
        if (url.startsWith('/')) url = 'https://app.opinion.trade' + url;
        if (/^https?:\/\//i.test(url)) {
          return url;
        }
      }
    }
  } catch {
    // ignore
  }
  // Last resort: heuristic by title
  return inferMarketImage(String(fallbackTitle || ''));
};

export const getOpinionMarketUrl = (event: OpinionEvent): string => {
  const topicFromEvent = (event as any).topicId;
  const topicFromMarket = event?.markets?.[0] && (event.markets[0] as any).topicId;
  const numericId = /^\d+$/.test(event.id) ? event.id : null;
  const topicId = topicFromEvent || topicFromMarket || numericId;

  if (topicId) {
    return `https://app.opinion.trade/detail?topicId=${encodeURIComponent(String(topicId))}&ref=RandomMarket`;
  }

  const slug = event?.slug || event?.markets?.[0]?.slug || '';
  if (slug) {
    return `https://opinion.trade/?ref=RandomMarket&market=${encodeURIComponent(slug)}`;
  }
  return `https://opinion.trade/?ref=RandomMarket`;
};

// Mock Data representing Opinion Labs markets
// Opinion focuses on: Macro, Crypto, Tech, AI
const OPINION_MARKETS: PolymarketEvent[] = [
  {
    id: "op-1",
    title: "Will BTC reach $100k by end of Q1 2026?",
    slug: "btc-100k-q1-2026",
    image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    markets: [{
      id: "m-op-1",
      question: "Will Bitcoin trade above $100,000 on March 31, 2026?",
      slug: "btc-100k-q1-2026",
      outcomePrices: ["0.65", "0.35"],
      volume: 12500000,
      liquidity: 500000,
      active: true,
      closed: false
    }],
    volume: 12500000,
    liquidity: 500000,
    active: true,
    closed: false
  },
  {
    id: "op-2",
    title: "Fed Interest Rate Decision (March 2026)",
    slug: "fed-rates-march-2026",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Seal_of_the_United_States_Federal_Reserve_System.svg/1200px-Seal_of_the_United_States_Federal_Reserve_System.svg.png",
    markets: [{
      id: "m-op-2",
      question: "Will the Fed cut rates in March 2026?",
      slug: "fed-rates-march-2026",
      outcomePrices: ["0.45", "0.55"],
      volume: 8900000,
      liquidity: 1200000,
      active: true,
      closed: false
    }],
    volume: 8900000,
    liquidity: 1200000,
    active: true,
    closed: false
  },
  {
    id: "op-3",
    title: "GPT-5 Release Date",
    slug: "gpt-5-release-date",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
    markets: [{
      id: "m-op-3",
      question: "Will OpenAI release GPT-5 before July 2026?",
      slug: "gpt-5-release-date",
      outcomePrices: ["0.72", "0.28"],
      volume: 5600000,
      liquidity: 300000,
      active: true,
      closed: false
    }],
    volume: 5600000,
    liquidity: 300000,
    active: true,
    closed: false
  },
  {
    id: "op-4",
    title: "ETH/BTC Flippening in 2026",
    slug: "eth-btc-flippening-2026",
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    markets: [{
      id: "m-op-4",
      question: "Will Ethereum market cap surpass Bitcoin in 2026?",
      slug: "eth-btc-flippening-2026",
      outcomePrices: ["0.12", "0.88"],
      volume: 3400000,
      liquidity: 150000,
      active: true,
      closed: false
    }],
    volume: 3400000,
    liquidity: 150000,
    active: true,
    closed: false
  },
  {
    id: "op-5",
    title: "US CPI Inflation > 3% in Feb 2026",
    slug: "us-cpi-feb-2026",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/US_Dollar_Sign_font_awesome.svg/1024px-US_Dollar_Sign_font_awesome.svg.png",
    markets: [{
      id: "m-op-5",
      question: "Will US CPI YoY be above 3.0% for February 2026?",
      slug: "us-cpi-feb-2026",
      outcomePrices: ["0.30", "0.70"],
      volume: 2100000,
      liquidity: 800000,
      active: true,
      closed: false
    }],
    volume: 2100000,
    liquidity: 800000,
    active: true,
    closed: false
  },
  {
    id: "op-6",
    title: "Solana to hit $500 in Q2 2026",
    slug: "solana-500-q2-2026",
    image: "https://cryptologos.cc/logos/solana-sol-logo.png",
    markets: [{
      id: "m-op-6",
      question: "Will Solana trade above $500 before June 30, 2026?",
      slug: "solana-500-q2-2026",
      outcomePrices: ["0.40", "0.60"],
      volume: 4500000,
      liquidity: 200000,
      active: true,
      closed: false
    }],
    volume: 4500000,
    liquidity: 200000,
    active: true,
    closed: false
  },
  {
    id: "op-7",
    title: "Apple Vision Pro 2 Announcement",
    slug: "apple-vision-pro-2",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png",
    markets: [{
      id: "m-op-7",
      question: "Will Apple announce Vision Pro 2 in 2026?",
      slug: "apple-vision-pro-2",
      outcomePrices: ["0.85", "0.15"],
      volume: 1800000,
      liquidity: 100000,
      active: true,
      closed: false
    }],
    volume: 1800000,
    liquidity: 100000,
    active: true,
    closed: false
  }
];

export const fetchEvents = async (params: FetchParams = {}): Promise<OpinionEvent[]> => {
  console.log('Fetching Opinion Labs markets...');

  if (!OPINION_API_KEY) {
    console.warn("No Opinion API Key found. Using Mock Data.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return OPINION_MARKETS;
  }

  try {
    const url = new URL(`${OPINION_API_URL}/market`);
    url.searchParams.append('status', 'activated');
    url.searchParams.append('sortBy', '5'); // 24h volume
    url.searchParams.append('limit', '20');

    const response = await fetch(url.toString(), {
      headers: {
        'apikey': OPINION_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Opinion API Error: ${response.status} ${response.statusText}`);
    }
    const raw = await response.json();
    const data: any = raw;
    const list =
      data?.result?.list ||
      data?.data?.list ||
      (Array.isArray(data) ? data : null);

    if (!list || !Array.isArray(list) || list.length === 0) {
      console.warn("Opinion API returned no markets or unexpected shape, using mock data.");
      return OPINION_MARKETS;
    }

    const enriched = await Promise.all(list.map(async (market: any) => {
      const title = market.marketTitle || '';
      // Try to retrieve official topic image/icon; fallback to heuristic
      let image = '';
      const topicId = market.topicId ?? market.marketId;
      try {
        image = await fetchTopicImageFlexible(topicId, title);
      } catch {
        image = inferMarketImage(title);
      }
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      let yesProb = 0.5;
      try {
        const latestYes = await fetchTokenLatestPrice(market.yesTokenId);
        if (latestYes != null) {
          yesProb = latestYes;
        }
      } catch {
      }

      const noProb = 1 - yesProb;

      return {
        id: String(topicId ?? title),
        title,
        slug,
        topicId,
        image,
        markets: [{
          id: `m-${topicId ?? title}`,
          question: title,
          slug,
          topicId,
          yesTokenId: market.yesTokenId,
          noTokenId: market.noTokenId,
          outcomePrices: [String(yesProb), String(noProb)],
          volume: parseFloat(market.volume ?? '0'),
          liquidity: 0,
          active: market.status === 2,
          closed: market.status !== 2
        }],
        volume: parseFloat(market.volume ?? '0'),
        liquidity: 0,
        active: market.status === 2,
        closed: market.status !== 2
      };
    }));

    return enriched;

  } catch (error) {
    console.error("Failed to fetch from Opinion API:", error);
    console.log("Falling back to Mock Data...");
    return OPINION_MARKETS;
  }
};
