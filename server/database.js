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
    return db; // Return just the db instance
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function main() {
  // Call the function to get the database instance.
  const db = await connectToDatabase();

  // Insert the deals.json file into a "deals" collection.
  try {
    const dealsRaw = await readFile('./deals.json', 'utf8');
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
    const files = await readdir('.');

    const vintedFiles = files.filter(
      (file) => file.startsWith('vinted_') && file.endsWith('.json')
    );

    const vintedCollection = db.collection('vintedDeals');

    for (const file of vintedFiles) {
      try {
        const filePath = path.resolve('.', file);
        const fileContents = await readFile(filePath, 'utf8');
        const fileData = JSON.parse(fileContents);

        if (Array.isArray(fileData)) {
          const result = await vintedCollection.insertMany(fileData);
          console.log(
            `Inserted ${result.insertedCount} deal(s) from file ${file}`
          );
        } else {
          const result = await vintedCollection.insertOne(fileData);
          console.log(`Inserted 1 deal from file ${file}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading directory for vinted_ files:', error);
  }
}

main();
