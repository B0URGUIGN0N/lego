const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`Running on port ${PORT}`);

const { connectToDatabase } = require('./database');

connectToDatabase().then(async ({ db, client }) => {
  console.log("API connected to MongoDB!");

  app.get('/deals', async (req, res) => {
    try {
      const deals = await db.collection('deals').find().toArray();
      res.json(deals);
    } catch (error) {
      console.error("Error while retrieving deals:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get('/deals/search', async (req, res) => {
    console.log('Query parameters:', req.query);
    try {
      const limit = parseInt(req.query.limit) || 12; 
      const maxPrice = req.query.price ? parseFloat(req.query.price) : null; 
      const filterBy = req.query.filterBy || null; 
      const setId = req.query.setId || null; 
  
      let query = {};
  
      if (setId) {
        query.setId = setId; 
      }
      if (maxPrice) {
        query.price = { $lte: maxPrice }; 
      }
  
      let sort = { price: 1 }; // default to sorting by price in ascending order
      if (filterBy === "best-discount") {
        sort = { discount: -1 }; 
      } else if (filterBy === "hottest") {
        sort = { temperature: -1 }; 
      } else if (req.query.sortPrice === 'asc') {
        sort = { price: 1 };
      } else if (req.query.sortPrice === 'desc') {
        sort = { price: -1 };
      }
  
      const deals = await db.collection('deals')
          .find(query)
          .sort(sort)
          .limit(limit)
          .toArray();
  
      res.json(deals);
    } catch (error) {
      console.error("Error while searching deals:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  

  app.get('/sales', async (req, res) => {
    try {
      const sales = await db.collection('vintedDeals').find().toArray();
      res.json(sales);
    } catch (error) {
      console.error("Error while retrieving sales:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get('/sales/search', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 12; 
      const saleId = req.query.setId || null; 
      const sortPrice = req.query.sortPrice || 'asc'; 
  
      let query = {};
  
      if (saleId) {
        query.setId = saleId; 
      }
  
      let sort = {};
  
      if (sortPrice === 'asc') {
        sort = { price: 1 }; 
      } else if (sortPrice === 'desc') {
        sort = { price: -1 }; 
      } else {
        sort = { price: 1 }; // default to ascending order
      }
  
      const sales = await db.collection('sales')
          .find(query)
          .sort(sort)
          .limit(limit)
          .toArray();
  
      res.json(sales);
    } catch (error) {
      console.error("Error while searching sales:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Close the MongoDB connection when server is stopped
  process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
}).catch(err => {
  console.error("Error while connecting API to MongoDB:", err);
});
