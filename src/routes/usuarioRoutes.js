const express = require("express");
const router = express.Router();
const { cadastrar } = require("../controllers/authController");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.post("/", validar(schemas.cadastro), cadastrar);

module.exports = router;