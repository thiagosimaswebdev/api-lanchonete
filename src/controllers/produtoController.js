const pool = require("../config/db");

async function listarProdutos(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT id, nome, preco
      FROM produtos
      ORDER BY id DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error("[GET /produtos]", erro);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
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

module.exports = { listarProdutos, criarProduto };