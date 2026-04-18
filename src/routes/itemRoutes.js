const express = require("express");
const router = express.Router();
const { adicionarItem } = require("../controllers/itemController");
const autenticar = require("../middlewares/autenticar");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

/**
 * @swagger
 * /itens:
 *   post:
 *     summary: Adicionar item avulso a um pedido
 *     description: Adiciona um item a um pedido já existente.
 *     tags: [Itens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pedido_id
 *               - produto_id
 *               - quantidade
 *               - preco_unitario
 *             properties:
 *               pedido_id:
 *                 type: integer
 *                 example: 1
 *               produto_id:
 *                 type: integer
 *                 example: 2
 *               quantidade:
 *                 type: integer
 *                 example: 1
 *               preco_unitario:
 *                 type: number
 *                 example: 15.00
 *     responses:
 *       201:
 *         description: Item adicionado ao pedido
 *       404:
 *         description: Pedido ou produto não encontrado
 *       401:
 *         description: Token não informado ou inválido
 */

router.post("/", autenticar, validar(schemas.item), adicionarItem);

module.exports = router;