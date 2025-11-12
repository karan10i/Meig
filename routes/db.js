const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'blogDB';

let client;
let db;

async function connectDB() {
  if (db) return db;
  
  try {
    client = new MongoClient(url);
    await client.connect();
    console.log('✓ Connected successfully to MongoDB');
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = { connectDB, getDB, closeDB };