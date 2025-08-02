const express = require('express');
const axios = require('axios'); // Import axios for HTTP requests
const router = express.Router();
const POLYGON_API_KEY = 'ItwcpMW3BQaI8IdWfiTtz8sRSv8A_51l';
const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`, {
      params: {
        apiKey: POLYGON_API_KEY,
      },
    });
    const result = response.data;
    console.log(`Successfully fetched data for ${symbol}:`, result);
    obj = {
      symbol: symbol,
      price: result.results[0].c, // Close price of the previous trading day
      high: result.results[0].h,   // High of the previous trading day
      low: result.results[0].l,    // Low of the previous trading day
      change: ((result.results[0].c - result.results[0].o) / result.results[0].o) * 100, // Percent change
      error: false
    };
    return obj;
  } catch (error) {
      console.error('Error message:', error.message);
    return {
      symbol: symbol,
      price: 'N/A',
      high: 'N/A',
      low: 'N/A',
      change: 'N/A',
      error: true
    };
  }
};

router.get('/', async (req, res) => {
  
   const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'SPY', 'BRK-B']; // Top 10 companies
  try {
    const stocksData = await Promise.all(symbols.map(symbol => fetchStockData(symbol)));
    res.json(stocksData);  // Send the stock data as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock data', error: error.message });
  }
});
module.exports = router;
