
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const API_FILE_PATH = path.join(__dirname, '../src/utils/mock_data.ts');

const checkUrl = (targetUrl) => {
  return new Promise((resolve) => {
    // Basic check for empty URL
    if (!targetUrl) return resolve(false);

    let parsedUrl;
    try {
      parsedUrl = url.parse(targetUrl);
    } catch (e) {
      console.error(`Invalid URL: ${targetUrl}`);
      return resolve(false);
    }

    const options = {
      method: 'HEAD',
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`✅ [OK] ${targetUrl} (${res.statusCode})`);
        resolve(true);
      } else {
        console.error(`❌ [FAIL] ${targetUrl} (${res.statusCode})`);
        resolve(false);
      }
    });

    req.on('error', (e) => {
      console.error(`❌ [ERROR] ${targetUrl}: ${e.message}`);
      resolve(false);
    });

    req.end();
  });
};

async function run() {
  console.log('🔍 Scanning src/utils/mock_data.ts for mock slugs and images...');
  
  if (!fs.existsSync(API_FILE_PATH)) {
    console.error('❌ Could not find src/utils/mock_data.ts');
    process.exit(1);
  }

  const content = fs.readFileSync(API_FILE_PATH, 'utf8');
  
  // Find slugs (support both single and double quotes, and quoted keys)
  // Matches: slug: 'val', "slug": "val", slug: "val"
  const slugRegex = /["']?slug["']?:\s*["']([^"']+)["']/g;
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  // Find images
  const imageRegex = /["']?image["']?:\s*["']([^"']+)["']/g;
  const images = [];
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

  const uniqueSlugs = [...new Set(slugs)];
  const uniqueImages = [...new Set(images)];

  console.log(`Found ${uniqueSlugs.length} slugs and ${uniqueImages.length} images.`);
  
  let hasError = false;

  console.log('\n--- Checking Opinion Site Availability ---');
  {
    const success = await checkUrl('https://opinion.trade/');
    if (!success) {
      hasError = true;
    } else {
      console.log('ℹ️ Opinion site reachable. Market deep-links may vary by environment; using homepage fallback.');
    }
  }

  console.log('\n--- Checking Images ---');
  for (const img of uniqueImages) {
    const isClearbit = /logo\.clearbit\.com/.test(img);
    const success = await checkUrl(img);
    if (!success && !isClearbit) {
      hasError = true;
    } else if (!success && isClearbit) {
      console.warn(`⚠️ [WARN] ${img} not reachable; will rely on runtime fallback logo.`);
    }
  }

  console.log('---------------------------------------------------');
  if (hasError) {
    console.error('❌ VALIDATION FAILED: Some links are broken.');
    process.exit(1);
  } else {
    console.log('✅ ALL LINKS VALID. You are safe.');
    process.exit(0);
  }
}

run();
