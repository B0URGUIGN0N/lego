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
    try {
      const limit = parseInt(req.query.limit) || 12; 
      const maxPrice = req.query.price ? parseFloat(req.query.price) : null; 
      const dateFilter = req.query.date ? parseInt(req.query.date) : null; 
      const filterBy = req.query.filterBy || null; 
  
      let query = {};

      if (maxPrice) {
        query.price = { $lte: maxPrice }; 
      }
      if (dateFilter) {
        query.timestamp = { $gte: dateFilter }; 
      }

      let sort = { price: 1 }; 
      if (filterBy === "best-discount") {
        sort = { discount: -1 }; 
      } else if (filterBy === "most-commented") {
        sort = { comments: -1 }; 
      } else if (filterBy === "hottest") {
        sort = { temperature: -1 }; 
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

  app.get('/vintedDeals', async (req, res) => {
    try {
      const vintedDeals = await db.collection('vintedDeals').find().toArray();
      res.json(vintedDeals);
    } catch (error) {
      console.error("Error while retrieving vintedDeals:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get('/sales/search', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 12; 
      const saleId = req.query.legoSetId || null; 
  
      let query = {};

      if (saleId) {
        query.legoSetId = saleId; 
      }

      let sort = { price: 1 }; 

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

  app.get('/deals/:id', async (req, res) => {
    try {
      const dealId = req.params.id;
      console.log(`Searching for deal with ID: ${dealId}`);

      const deal = await db.collection('deals').findOne({ id: dealId });

      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }

      res.json(deal);
    } catch (error) {
      console.error("Error while retrieving the deal:", error);
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
