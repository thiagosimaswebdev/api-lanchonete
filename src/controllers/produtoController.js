const pool = require("../config/db");

async function listarProdutos(req, res) {
  try {
    const { nome } = req.query;

    let query = `SELECT id, nome, preco FROM produtos`;
    const params = [];

    if (nome) {
      query += ` WHERE nome ILIKE $1`;
      params.push(`%${nome}%`);
    }

    query += ` ORDER BY id DESC`;

    const resultado = await pool.query(query, params);

    res.json(resultado.rows);
  } catch (erro) {
    console.error("[GET /produtos]", erro);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
}

async function buscarProduto(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do produto inválido" });
    }

    const resultado = await pool.query(
      `SELECT id, nome, preco FROM produtos WHERE id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("[GET /produtos/:id]", erro);
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
}

async function criarProduto(req, res) {
  try {
    const { nome, preco } = req.body;

    const resultado = await pool.query(
      `INSERT INTO produtos (nome, preco)
       VALUES ($1, $2)
       RETURNING id, nome, preco`,
      [nome, preco]
    );

    res.status(201).json({
      mensagem: "Produto criado com sucesso",
      produto: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /produtos]", erro);
    res.status(500).json({ erro: "Erro ao criar produto" });
  }
}

async function atualizarProduto(req, res) {
  try {
    const { id } = req.params;
    const { nome, preco } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do produto inválido" });
    }

    const produtoExiste = await pool.query(
      `SELECT id FROM produtos WHERE id = $1`,
      [id]
    );

    if (produtoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const resultado = await pool.query(
      `UPDATE produtos
       SET nome = $1, preco = $2
       WHERE id = $3
       RETURNING id, nome, preco`,
      [nome, preco, id]
    );

    res.json({
      mensagem: "Produto atualizado com sucesso",
      produto: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[PUT /produtos/:id]", erro);
    res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
}

async function deletarProduto(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do produto inválido" });
    }

    const produtoExiste = await pool.query(
      `SELECT id FROM produtos WHERE id = $1`,
      [id]
    );

    if (produtoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    // Verifica se o produto tem pedidos vinculados
    const pedidosVinculados = await pool.query(
      `SELECT id FROM itens_pedido WHERE produto_id = $1 LIMIT 1`,
      [id]
    );

    if (pedidosVinculados.rows.length > 0) {
      return res.status(400).json({
        erro: "Produto não pode ser deletado pois está vinculado a pedidos",
      });
    }

    await pool.query(`DELETE FROM produtos WHERE id = $1`, [id]);

    res.json({ mensagem: "Produto deletado com sucesso" });
  } catch (erro) {
    console.error("[DELETE /produtos/:id]", erro);
    res.status(500).json({ erro: "Erro ao deletar produto" });
  }
}

module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
};