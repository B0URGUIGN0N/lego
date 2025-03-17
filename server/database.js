import { MongoClient } from 'mongodb';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

export async function connectToDatabase() {
  try {
    const MONGODB_URI =
      'mongodb+srv://sosolal111:NecoArcNya@clusterlego.m4qlb.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLego';
    const MONGODB_DB_NAME = 'Lego';

    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB client');
    const db = client.db(MONGODB_DB_NAME);
    console.log('Connected to database');
    return { db, client }; // Return both the db instance and client so we can close it later if needed.
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function main() {
  // Connect to the database.
  const { db, client } = await connectToDatabase();

  // Insert the deals.json file into a "deals" collection.
  try {
    const dealsRaw = await readFile('./files/deals.json', 'utf8');
    const dealsData = JSON.parse(dealsRaw);

    const dealsCollection = db.collection('deals');

    if (Array.isArray(dealsData)) {
      const result = await dealsCollection.insertMany(dealsData);
      console.log(`Inserted ${result.insertedCount} deal(s) from deals.json`);
    } else {
      const result = await dealsCollection.insertOne(dealsData);
      console.log('Inserted 1 deal from deals.json');
    }
  } catch (error) {
    console.error('Error processing deals.json:', error);
  }

  // Scan for files starting with "vinted_" and insert their data.
  try {
    // Define the "files" directory.
    const filesDir = path.resolve('.', 'files');
    
    // Read the files from the "files" folder.
    const files = await readdir(filesDir);
  
    // Filter only the JSON files that start with "vinted_".
    const vintedFiles = files.filter(
      (file) => file.startsWith('vinted_') && file.endsWith('.json')
    );
  
    const vintedCollection = db.collection('vintedDeals');
  
    // Process each file.
    for (const file of vintedFiles) {
      try {
        const filePath = path.join(filesDir, file);
        const fileContents = await readFile(filePath, 'utf8');
        const fileData = JSON.parse(fileContents);
  
        if (Array.isArray(fileData)) {
          const result = await vintedCollection.insertMany(fileData);
          console.log(
            `Inserted ${result.insertedCount} deal(s) from file ${file}`
          );
        } else {
          const result = await vintedCollection.insertOne(fileData);
          console.log(`Inserted the deal from file ${file}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading directory for vinted_ files:', error);
  }
  

  // Query for a specific deal with id 10369 and print its link.
  try {
    const dealsCollection = db.collection('deals');

    // Update this query object according to the field you want to match.
    // In this example, we assume the identifier is stored in the "setId" field.
    const query = { setId: "10369" };

    const deal = await dealsCollection.findOne(query);

    if (deal) {
      // Print the link if found.
      console.log(`Deal with setId "${query.setId}" has link: ${deal.link}`);
    } else {
      console.log(`No deal found with setId "${query.setId}".`);
    }
  } catch (error) {
    console.error('Error querying deal with setId "10369":', error);
  }

  // Close the MongoDB connection when finished.
  try {
    await client.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

main();


