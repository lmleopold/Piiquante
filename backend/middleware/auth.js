const jwt = require("jsonwebtoken");
require("dotenv").config();
/**
 * Extrait le token du header
 * Décode le token et renvoit une erreur si non valide
 * Récupère le userId du token et l'ajoute comme nouvelle propriété à l'objet request
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decodedToken.userId;
    req.auth = {
      userId
    };
    next();
  } catch (error) {
    res.status(401).json({ error }); // token non valide
  }
};
