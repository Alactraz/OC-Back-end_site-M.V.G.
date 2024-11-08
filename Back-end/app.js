const mongoose = require('mongoose');
const express = require('express');
const app = express();
const userRoutes = require('./Routes/user');
const bookRoutes = require('./Routes/book');

app.use(express.json());

// Définir les routes
app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);

// Connexion à MongoDB avec mongoose
mongoose.connect(process.env.MONGODB)
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch(error => console.error("Connexion à MongoDB échouée :", error));

module.exports = app;
