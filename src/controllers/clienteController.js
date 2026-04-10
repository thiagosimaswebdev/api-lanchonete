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

async function buscarCliente(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do cliente inválido" });
    }

    const resultado = await pool.query(
      `SELECT id, nome, telefone FROM clientes WHERE id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("[GET /clientes/:id]", erro);
    res.status(500).json({ erro: "Erro ao buscar cliente" });
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

async function atualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do cliente inválido" });
    }

    const clienteExiste = await pool.query(
      `SELECT id FROM clientes WHERE id = $1`,
      [id]
    );

    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    const resultado = await pool.query(
      `UPDATE clientes
       SET nome = $1, telefone = $2
       WHERE id = $3
       RETURNING id, nome, telefone`,
      [nome, telefone, id]
    );

    res.json({
      mensagem: "Cliente atualizado com sucesso",
      cliente: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[PUT /clientes/:id]", erro);
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
}

async function deletarCliente(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do cliente inválido" });
    }

    const clienteExiste = await pool.query(
      `SELECT id FROM clientes WHERE id = $1`,
      [id]
    );

    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    // Verifica se o cliente tem pedidos vinculados
    const pedidosVinculados = await pool.query(
      `SELECT id FROM pedidos WHERE cliente_id = $1 LIMIT 1`,
      [id]
    );

    if (pedidosVinculados.rows.length > 0) {
      return res.status(400).json({
        erro: "Cliente não pode ser deletado pois possui pedidos vinculados",
      });
    }

    await pool.query(`DELETE FROM clientes WHERE id = $1`, [id]);

    res.json({ mensagem: "Cliente deletado com sucesso" });
  } catch (erro) {
    console.error("[DELETE /clientes/:id]", erro);
    res.status(500).json({ erro: "Erro ao deletar cliente" });
  }
}

module.exports = {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  deletarCliente,
};