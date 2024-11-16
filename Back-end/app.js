const mongoose = require('mongoose');
const express = require('express');
const app = express();
const userRoutes = require('./Routes/user');
const bookRoutes = require('./Routes/book');
const path = require('path');

app.use(express.json());

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Définir les routes
app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);

// Connexion à MongoDB avec mongoose
mongoose.connect(process.env.MONGODB)
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch(error => console.error("Connexion à MongoDB échouée :", error));

// Middleware pour servir les images
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
