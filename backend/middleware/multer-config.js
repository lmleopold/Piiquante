const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png"
};

// La méthode diskStorage()  configure le chemin et le nom de fichier pour les fichiers entrants
const storage = multer.diskStorage({
  // la fonction destination indique à multer d'enregistrer les fichiers dans le dossier images
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  // La fonction filename crée un nom unique de fichier image
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  }
});

/**
 * Le middleware multer complète le corps de la demande en y renvoyant les données soumises avec le fichier.
 * La méthode associée single() crée  un middleware qui capture les fichiers de type "image" (défini dans la nomenclature html du bouton input)
 * et les enregistre dans le dossier "images"
 */
module.exports = multer({ storage }).single("image");
