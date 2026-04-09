const express = require("express");
const router = express.Router();
const { listarClientes, criarCliente } = require("../controllers/clienteController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.get("/", autenticar, listarClientes);
router.post("/", autenticar, validar(schemas.cliente), criarCliente);

module.exports = router;