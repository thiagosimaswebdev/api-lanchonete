const express = require("express");
const router = express.Router();
const {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatus,
  totalPedido,
  criarPedidoCompleto,
} = require("../controllers/pedidoController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.get("/", autenticar, listarPedidos);
router.post("/", autenticar, validar(schemas.pedido), criarPedido);
router.post("/completo", autenticar, validar(schemas.pedidoCompleto), criarPedidoCompleto);
router.get("/:id", autenticar, buscarPedido);
router.get("/:id/total", autenticar, totalPedido);
router.patch("/:id/status", autenticar, validar(schemas.atualizarStatus), atualizarStatus);

module.exports = router;