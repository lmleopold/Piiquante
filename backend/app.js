// Import des modules requis
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Import des routes
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

// Connexion à la BDD MongoDB
mongoose.connect(`mongodb+srv://${process.env.IDENTIFIANT}:${process.env.PASSWORD}@piiquantedb.aulqrpo.mongodb.net/test?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

/**
 * By default, Helmet sets the following headers:
 * Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
 * Cross-Origin-Embedder-Policy: require-corp
 * Cross-Origin-Opener-Policy: same-origin
 * Cross-Origin-Resource-Policy: same-origin
 * Origin-Agent-Cluster: ?1
 * Referrer-Policy: no-referrer
 * Strict-Transport-Security: max-age=15552000; includeSubDomains
 * X-Content-Type-Options: nosniff
 * X-DNS-Prefetch-Control: off
 * X-Download-Options: noopen
 * X-Frame-Options: SAMEORIGIN
 * X-Permitted-Cross-Domain-Policies: none
 * X-XSS-Protection: 0
 */
app.use(helmet({
  crossOriginResourcePolicy: false
}));

/**
 * CORS configuration: Ajouts de headers à l'objet Response pour permettre
 * le transfert de ressources entre 2 serveurs distincts
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

/**
 *  Express prend en charge toutes les requêtes qui ont comme Content-Type 'application/json'
 *  et met à disposition leur body directement sur l'objet req
 */
app.use(express.json());

// Appel des routes sauces et utilisateur
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

/**
 * indique à Express qu'il faut gérer la ressource images de manière statique
 * (un sous-répertoire de notre répertoire de base, __dirname) à chaque fois qu'elle reçoit une requête vers la route /images
 * __dirname est une variable d'environnement de node.js qui indique le chemin absolu du répertoire contenant le fichier en cours d'exécution.
 */
app.use("/images", express.static(path.join(__dirname, "images")));

// Export de l'app
module.exports = app;
