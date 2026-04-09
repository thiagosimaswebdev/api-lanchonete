const express = require("express");
const router = express.Router();
const { listarProdutos, criarProduto } = require("../controllers/produtoController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.get("/", autenticar, listarProdutos);
router.post("/", autenticar, validar(schemas.produto), criarProduto);

module.exports = router;