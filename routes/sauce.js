const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config'); 

const sauceCtrl = require('../controllers/sauce');

router.post('/', multer, sauceCtrl.createSauce);
router.get('/', sauceCtrl.getAllSauces);
router.get('/:id', sauceCtrl.getOneSauce);
router.put('/:id', sauceCtrl.modifySauce);
router.delete('/:id', sauceCtrl.deleteSauce);

module.exports = router;
