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

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Listar todos os pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, em_preparo, pronto, entregue, cancelado]
 *         description: Filtrar por status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Quantidade por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de pedidos com paginação
 *       401:
 *         description: Token não informado ou inválido
 *   post:
 *     summary: Criar pedido simples
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *             properties:
 *               cliente_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: pendente
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       401:
 *         description: Token não informado ou inválido
 *
 * /pedidos/completo:
 *   post:
 *     summary: Criar pedido completo com itens
 *     description: Cria um pedido com todos os itens em uma única requisição usando transação com rollback.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - itens
 *             properties:
 *               cliente_id:
 *                 type: integer
 *                 example: 1
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produto_id:
 *                       type: integer
 *                       example: 1
 *                     quantidade:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Pedido completo criado com sucesso
 *       404:
 *         description: Cliente ou produto não encontrado
 *       401:
 *         description: Token não informado ou inválido
 *
 * /pedidos/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Pedido encontrado com itens e total
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Token não informado ou inválido
 *
 * /pedidos/{id}/total:
 *   get:
 *     summary: Calcular total do pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Total calculado
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Token não informado ou inválido
 *
 * /pedidos/{id}/status:
 *   patch:
 *     summary: Atualizar status do pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, em_preparo, pronto, entregue, cancelado]
 *                 example: em_preparo
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Pedido já finalizado ou status inválido
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Token não informado ou inválido
 */

router.get("/", autenticar, listarPedidos);
router.post("/", autenticar, validar(schemas.pedido), criarPedido);
router.post("/completo", autenticar, validar(schemas.pedidoCompleto), criarPedidoCompleto);
router.get("/:id", autenticar, buscarPedido);
router.get("/:id/total", autenticar, totalPedido);
router.patch("/:id/status", autenticar, validar(schemas.atualizarStatus), atualizarStatus);

module.exports = router;