const mongoose = require("mongoose");

/**
 * Un modèle de schéma Mongoose représentant une sauce
 * @typedef {Object} Sauce
 * @property {string} userId - L'identifiant de l'utilisateur ayant créé la sauce
 * @property {string} name - Le nom de la sauce
 * @property {string} manufacturer - Le fabricant de la sauce
 * @property {string} description - La description de la sauce
 * @property {string} mainPepper - Le type de piment principal de la sauce
 * @property {string} imageUrl - L'URL de l'image de la sauce
 * @property {number} heat - L'intensité de la sauce sur une échelle de 1 à 10
 * @property {number} likes - Le nombre total d'utilisateurs ayant aimé la sauce
 * @property {number} dislikes - Le nombre total d'utilisateurs ayant détesté la sauce
 * @property {usersLiked} usersLiked - Un tableau de chaînes de caractères représentant les identifiants des utilisateurs ayant aimé la sauce
 * @property {usersDisliked} usersDisliked - Un tableau de chaînes de caractères représentant les identifiants des utilisateurs ayant détesté la sauce
 */
const sauceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: false },
  dislikes: { type: Number, required: false },
  usersLiked: { type: ["String<userId>"], required: false },
  usersDisliked: { type: ["String<userId>"], required: false }
});

module.exports = mongoose.model("sauce", sauceSchema);
