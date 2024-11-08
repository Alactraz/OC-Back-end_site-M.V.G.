const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupérer le token de l'en-tête Authorization
        const token = req.headers.authorization.split(' ')[1];
        // Vérifier et décoder le token avec la clé secrète
        const decodedToken = jwt.verify(token, process.env.JWTSKEY);
        req.user = { id: decodedToken.userId }; // Stocke l'ID utilisateur dans req.user
        next();
    } catch (error) {
        res.status(401).json({ message: 'Requête non authentifiée !' });
    }
};
