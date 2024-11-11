const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true }, // Propriétaire du livre
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { type: Number, required: true, min: 0, max: 5 }
        }
    ],
    averageRating: { type: Number, default: 0 } // Calcul de la moyenne des notes
});

module.exports = mongoose.model('Book', bookSchema);