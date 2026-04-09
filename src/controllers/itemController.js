const pool = require("../config/db");

async function adicionarItem(req, res) {
  try {
    const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;

    const pedidoExiste = await pool.query(
      `SELECT id FROM pedidos WHERE id = $1`,
      [pedido_id]
    );

    if (pedidoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    const produtoExiste = await pool.query(
      `SELECT id FROM produtos WHERE id = $1`,
      [produto_id]
    );

    if (produtoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const resultado = await pool.query(
      `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [pedido_id, produto_id, quantidade, preco_unitario]
    );

    res.status(201).json({
      mensagem: "Item adicionado ao pedido",
      item: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /itens]", erro);
    res.status(500).json({ erro: "Erro ao adicionar item" });
  }
}

module.exports = { adicionarItem };