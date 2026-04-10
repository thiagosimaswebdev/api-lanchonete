const express = require("express");
const router = express.Router();
const {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} = require("../controllers/produtoController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.get("/", autenticar, listarProdutos);
router.get("/:id", autenticar, buscarProduto);
router.post("/", autenticar, validar(schemas.produto), criarProduto);
router.put("/:id", autenticar, validar(schemas.produto), atualizarProduto);
router.delete("/:id", autenticar, deletarProduto);

module.exports = router;