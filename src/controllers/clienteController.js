const pool = require("../config/db");

async function listarClientes(req, res) {
  try {
    const resultado = await pool.query(`
      SELECT id, nome, telefone
      FROM clientes
      ORDER BY id DESC
    `);

    res.json(resultado.rows);
  } catch (erro) {
    console.error("[GET /clientes]", erro);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
}

async function criarCliente(req, res) {
  try {
    const { nome, telefone } = req.body;

    const resultado = await pool.query(
      `INSERT INTO clientes (nome, telefone)
       VALUES ($1, $2)
       RETURNING id, nome, telefone`,
      [nome, telefone]
    );

    res.status(201).json({
      mensagem: "Cliente criado com sucesso",
      cliente: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /clientes]", erro);
    res.status(500).json({ erro: "Erro ao criar cliente" });
  }
}

module.exports = { listarClientes, criarCliente };