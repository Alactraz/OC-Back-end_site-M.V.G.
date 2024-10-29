const express = require('express');
const mongoose = require('mongoose');
const router = express();
const Thing = require('./models/book.js');  // Importation du modèle
const bookRoutes = require('./Routes/book');

const app = express();

app.use(express.json());

app.use('/api/books', bookRoutes); // définir le préfixe des routes



router.use(express.json());  // Middleware pour gérer le JSON

// Connexion mongodb 
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();  // Connectez-vous au client MongoDB
    await client.db("admin").command({ ping: 1 });
    console.log("Connexion à MongoDB réussie !");
  } catch (error) {
    console.error("Connexion à MongoDB échouée :", error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);


// Export de app.js 
module.exports = app; 