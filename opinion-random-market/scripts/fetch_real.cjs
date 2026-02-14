const axios = require('axios');

async function fetchTopMarkets() {
  try {
    const response = await axios.get('https://gamma-api.polymarket.com/events', {
      params: {
        closed: false,
        active: true,
        limit: 15, // Get top 15
        order: 'volume',
        ascending: false,
      },
      timeout: 10000
    });

    console.log('--- FETCHED MARKETS ---');
    response.data.forEach(event => {
      // Find the binary market or just first market
      const m = event.markets[0];
      if (!m) return;
      
      console.log(`SLUG: ${event.slug}`);
      console.log(`TITLE: ${event.title}`);
      console.log(`QUESTION: ${m.question}`);
      console.log(`OUTCOME: ${JSON.stringify(m.outcomePrices)}`);
      console.log(`VOLUME: ${event.volume}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching markets:', error.message);
  }
}

fetchTopMarkets();