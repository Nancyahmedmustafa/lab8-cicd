const express = require('express');
const os = require('os');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const DB_NAME = process.env.DB_NAME || 'lab8db';

let tasksCollection;

async function connectToMongo() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();

  const db = client.db(DB_NAME);
  tasksCollection = db.collection('tasks');

  console.log('Connected to MongoDB');
}

app.get('/', (req, res) => {
  res.json({
    app: 'CISC 886 Lab 8',
    mode: process.env.MODE || 'local',
    node: process.version,
    host: os.hostname()
  });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await tasksCollection.find({}, { projection: { _id: 0 } }).toArray();

    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

connectToMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log('--------------------------------------------');
      console.log(`CISC 886 Lab 8 App started`);
      console.log(`Port: ${PORT}`);
      console.log(`Mode: ${process.env.MODE || 'local'}`);
      console.log(`Node: ${process.version}`);
      console.log(`Host: ${os.hostname()}`);
      console.log('--------------------------------------------');
    });
  })
  .catch(err => {
    console.error('Mongo connection failed:', err);
    process.exit(1);
  });