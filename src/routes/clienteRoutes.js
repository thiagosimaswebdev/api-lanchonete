const express = require("express");
const router = express.Router();
const {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  deletarCliente,
} = require("../controllers/clienteController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.get("/", autenticar, listarClientes);
router.get("/:id", autenticar, buscarCliente);
router.post("/", autenticar, validar(schemas.cliente), criarCliente);
router.put("/:id", autenticar, validar(schemas.cliente), atualizarCliente);
router.delete("/:id", autenticar, deletarCliente);

module.exports = router;