const pool = require("../config/db");

async function listarPedidos(req, res) {
  try {
    const { status, page, limit } = req.query;

    // Paginação
    const pagina = Math.max(1, parseInt(page) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const offset = (pagina - 1) * limite;

    // Monta a query base com filtro opcional por status
    let filtro = "";
    const params = [];

    if (status) {
      const statusValidos = ["pendente", "em_preparo", "pronto", "entregue", "cancelado"];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          erro: "Status inválido. Use: pendente, em_preparo, pronto, entregue ou cancelado",
        });
      }
      filtro = `WHERE p.status = $1`;
      params.push(status);
    }

    // Busca o total de pedidos para montar a paginação
    const totalResult = await pool.query(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM pedidos p
       JOIN clientes c ON p.cliente_id = c.id
       ${filtro}`,
      params
    );

    const total = parseInt(totalResult.rows[0].total);
    const totalPaginas = Math.ceil(total / limite);

    // Busca os pedidos com limite e offset
    const resultado = await pool.query(
      `SELECT
        p.id         AS pedido_id,
        c.nome       AS cliente,
        p.status,
        pr.nome      AS produto,
        ip.quantidade,
        ip.preco_unitario
       FROM pedidos p
       JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
       LEFT JOIN produtos pr ON pr.id = ip.produto_id
       ${filtro}
       ORDER BY p.id DESC
       LIMIT ${limite} OFFSET ${offset}`,
      params
    );

    const pedidos = {};

    resultado.rows.forEach((row) => {
      if (!pedidos[row.pedido_id]) {
        pedidos[row.pedido_id] = {
          pedido_id: row.pedido_id,
          cliente: row.cliente,
          status: row.status,
          itens: [],
          total: 0,
        };
      }

      if (row.produto) {
        const subtotal = row.quantidade * row.preco_unitario;

        pedidos[row.pedido_id].itens.push({
          produto: row.produto,
          quantidade: row.quantidade,
          preco_unitario: row.preco_unitario,
          subtotal,
        });

        pedidos[row.pedido_id].total += subtotal;
      }
    });

    res.json({
      pagina: pagina,
      limite: limite,
      total: total,
      total_paginas: totalPaginas,
      pedidos: Object.values(pedidos),
    });
  } catch (erro) {
    console.error("[GET /pedidos]", erro);
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
}

async function buscarPedido(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    const resultado = await pool.query(`
      SELECT
        p.id         AS pedido_id,
        c.nome       AS cliente,
        p.status,
        pr.nome      AS produto,
        ip.quantidade,
        ip.preco_unitario
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
      LEFT JOIN produtos pr ON pr.id = ip.produto_id
      WHERE p.id = $1
    `, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    const row = resultado.rows[0];
    const pedido = {
      pedido_id: row.pedido_id,
      cliente: row.cliente,
      status: row.status,
      itens: [],
      total: 0,
    };

    resultado.rows.forEach((r) => {
      if (r.produto) {
        const subtotal = r.quantidade * r.preco_unitario;
        pedido.itens.push({
          produto: r.produto,
          quantidade: r.quantidade,
          preco_unitario: r.preco_unitario,
          subtotal,
        });
        pedido.total += subtotal;
      }
    });

    res.json(pedido);
  } catch (erro) {
    console.error("[GET /pedidos/:id]", erro);
    res.status(500).json({ erro: "Erro ao buscar pedido" });
  }
}

async function criarPedido(req, res) {
  try {
    const { cliente_id, status } = req.body;

    const clienteExiste = await pool.query(
      `SELECT id FROM clientes WHERE id = $1`,
      [cliente_id]
    );

    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    const resultado = await pool.query(
      `INSERT INTO pedidos (cliente_id, status)
       VALUES ($1, $2)
       RETURNING *`,
      [cliente_id, status]
    );

    res.status(201).json({
      mensagem: "Pedido criado com sucesso",
      pedido: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /pedidos]", erro);
    res.status(500).json({ erro: "Erro ao criar pedido" });
  }
}

async function atualizarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    const pedidoExiste = await pool.query(
      `SELECT id, status FROM pedidos WHERE id = $1`,
      [id]
    );

    if (pedidoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    const statusAtual = pedidoExiste.rows[0].status;

    if (statusAtual === "entregue" || statusAtual === "cancelado") {
      return res.status(400).json({
        erro: `Pedido já está ${statusAtual} e não pode ser alterado`,
      });
    }

    const resultado = await pool.query(
      `UPDATE pedidos
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      mensagem: "Status atualizado com sucesso",
      pedido: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[PATCH /pedidos/:id/status]", erro);
    res.status(500).json({ erro: "Erro ao atualizar status" });
  }
}

async function totalPedido(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    const pedidoExiste = await pool.query(
      `SELECT id FROM pedidos WHERE id = $1`,
      [id]
    );

    if (pedidoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    const resultado = await pool.query(
      `SELECT SUM(quantidade * preco_unitario) AS total
       FROM itens_pedido
       WHERE pedido_id = $1`,
      [id]
    );

    res.json({
      pedido_id: Number(id),
      total: resultado.rows[0].total ?? 0,
    });
  } catch (erro) {
    console.error("[GET /pedidos/:id/total]", erro);
    res.status(500).json({ erro: "Erro ao calcular total" });
  }
}

async function criarPedidoCompleto(req, res) {
  const { cliente_id, itens } = req.body;

  try {
    const clienteExiste = await pool.query(
      `SELECT id FROM clientes WHERE id = $1`,
      [cliente_id]
    );

    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    const ids = itens.map((i) => i.produto_id);

    const produtosResult = await pool.query(
      `SELECT id, preco FROM produtos WHERE id = ANY($1::int[])`,
      [ids]
    );

    const precoMap = {};
    produtosResult.rows.forEach((p) => {
      precoMap[p.id] = p.preco;
    });

    const idsNaoEncontrados = ids.filter((id) => !precoMap[id]);

    if (idsNaoEncontrados.length > 0) {
      return res.status(404).json({
        erro: "Produtos não encontrados",
        ids: idsNaoEncontrados,
      });
    }

    await pool.query("BEGIN");

    const pedidoResult = await pool.query(
      `INSERT INTO pedidos (cliente_id)
       VALUES ($1)
       RETURNING *`,
      [cliente_id]
    );

    const pedido = pedidoResult.rows[0];

    for (const item of itens) {
      const preco = precoMap[item.produto_id];

      await pool.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.produto_id, item.quantidade, preco]
      );
    }

    await pool.query("COMMIT");

    res.status(201).json({
      mensagem: "Pedido completo criado com sucesso",
      pedido_id: pedido.id,
    });
  } catch (erro) {
    await pool.query("ROLLBACK");
    console.error("[POST /pedidos/completo]", erro);
    res.status(500).json({ erro: "Erro ao criar pedido completo" });
  }
}

module.exports = {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatus,
  totalPedido,
  criarPedidoCompleto,
};