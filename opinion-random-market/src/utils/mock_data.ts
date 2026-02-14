import type { OpinionEvent } from '../types';

// Mock Data representing Opinion Labs markets
// Opinion focuses on: Macro, Crypto, Tech, AI
export const MOCK_EVENTS: OpinionEvent[] = [
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
    image: "https://logo.clearbit.com/federalreserve.gov",
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
    image: "https://logo.clearbit.com/openai.com",
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
    image: "https://logo.clearbit.com/bls.gov",
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
    title: "Solana ATH in 2026",
    slug: "solana-ath-2026",
    image: "https://cryptologos.cc/logos/solana-sol-logo.png",
    markets: [{
      id: "m-op-6",
      question: "Will SOL reach a new All-Time High in 2026?",
      slug: "solana-ath-2026",
      outcomePrices: ["0.55", "0.45"],
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
    title: "Binance IPO in 2026",
    slug: "binance-ipo-2026",
    image: "https://logo.clearbit.com/binance.com",
    markets: [{
      id: "m-op-7",
      question: "Will Binance go public (IPO) in 2026?",
      slug: "binance-ipo-2026",
      outcomePrices: ["0.08", "0.92"],
      volume: 1200000,
      liquidity: 50000,
      active: true,
      closed: false
    }],
    volume: 1200000,
    liquidity: 50000,
    active: true,
    closed: false
  },
  {
    id: "op-8",
    title: "SpaceX Starship Mars Landing 2026",
    slug: "spacex-mars-2026",
    image: "https://logo.clearbit.com/spacex.com",
    markets: [{
      id: "m-op-8",
      question: "Will Starship land on Mars in 2026?",
      slug: "spacex-mars-2026",
      outcomePrices: ["0.15", "0.85"],
      volume: 6700000,
      liquidity: 250000,
      active: true,
      closed: false
    }],
    volume: 6700000,
    liquidity: 250000,
    active: true,
    closed: false
  }
];
