const express = require("express");
const router = express.Router();
const { adicionarItem } = require("../controllers/itemController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.post("/", autenticar, validar(schemas.item), adicionarItem);

module.exports = router;