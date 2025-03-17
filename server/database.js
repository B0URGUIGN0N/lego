const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://sosolal111:<49PgVSa55p9yeRV5>@clusterlego.m4qlb.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLego';
const MONGODB_DB_NAME = 'lego';

const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
const db =  client.db(MONGODB_DB_NAME)
