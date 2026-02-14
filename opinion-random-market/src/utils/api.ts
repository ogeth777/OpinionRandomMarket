import type { OpinionEvent, FetchParams } from '../types';

const OPINION_API_URL = "https://proxy.opinion.trade:8443/openapi";
// Read API key from Vite env (browser) or Node env (scripts)
const OPINION_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPINION_API_KEY) ||
  process.env?.OPINION_API_KEY ||
  ""; 

interface OpinionMarket {
  marketId: number;
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

export const getOpinionMarketUrl = (event: OpinionEvent): string => {
  // Do NOT synthesize numeric IDs from strings — that causes 404.
  // Use slug if present, otherwise pass context via homepage params.
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
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800));
    return OPINION_MARKETS;
  }

  try {
    const url = new URL(`${OPINION_API_URL}/market`);
    url.searchParams.append('status', 'activated');
    url.searchParams.append('sortBy', '5'); // 24h volume
    url.searchParams.append('limit', '50');

    const response = await fetch(url.toString(), {
      headers: {
        'apikey': OPINION_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Opinion API Error: ${response.status} ${response.statusText}`);
    }

    const data: OpinionResponse = await response.json();
    
    if (data.code !== 0 || !data.result?.list) {
      throw new Error(`Opinion API Response Error: ${data.msg}`);
    }

    // Map Opinion API response to our internal format
    return data.result.list.map(market => ({
      id: market.marketId.toString(),
      title: market.marketTitle,
      slug: market.marketTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      image: "", // We might need to map categories to images or fetch metadata
      markets: [{
        id: `m-${market.marketId}`,
        question: market.marketTitle,
        slug: market.marketTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        outcomePrices: ["0.5", "0.5"], // Default as we don't have prices in list
        volume: parseFloat(market.volume),
        liquidity: 0, // Not provided in list
        active: market.status === 2,
        closed: market.status !== 2
      }],
      volume: parseFloat(market.volume),
      liquidity: 0,
      active: market.status === 2,
      closed: market.status !== 2
    }));

  } catch (error) {
    console.error("Failed to fetch from Opinion API:", error);
    console.log("Falling back to Mock Data...");
    return OPINION_MARKETS;
  }
};
