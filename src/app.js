const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const pool = require("./config/db");

const app = express();
app.use(express.json());

// =========================
// CONFIGURAÇÃO JWT
// =========================

const JWT_SECRET = process.env.JWT_SECRET || "troque_em_producao";
const JWT_EXPIRES_IN = "8h";

// =========================
// MIDDLEWARE DE AUTENTICAÇÃO
// =========================

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

// =========================
// SCHEMAS DE VALIDAÇÃO (JOI)
// =========================

const schemas = {
  login: Joi.object({
    usuario: Joi.string().min(3).max(50).required().messages({
      "string.min": "Usuário deve ter pelo menos 3 caracteres",
      "string.max": "Usuário deve ter no máximo 50 caracteres",
      "any.required": "Usuário é obrigatório",
    }),
    senha: Joi.string().min(4).required().messages({
      "string.min": "Senha deve ter pelo menos 4 caracteres",
      "any.required": "Senha é obrigatória",
    }),
  }),

  cliente: Joi.object({
    nome: Joi.string().min(2).max(100).required().messages({
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "string.max": "Nome deve ter no máximo 100 caracteres",
      "any.required": "Nome é obrigatório",
    }),
    telefone: Joi.string()
      .pattern(/^\d{10,11}$/)
      .required()
      .messages({
        "string.pattern.base": "Telefone deve conter 10 ou 11 dígitos numéricos",
        "any.required": "Telefone é obrigatório",
      }),
  }),

  produto: Joi.object({
    nome: Joi.string().min(2).max(100).required().messages({
      "string.min": "Nome deve ter pelo menos 2 caracteres",
      "string.max": "Nome deve ter no máximo 100 caracteres",
      "any.required": "Nome é obrigatório",
    }),
    preco: Joi.number().positive().precision(2).required().messages({
      "number.base": "Preço deve ser um número",
      "number.positive": "Preço deve ser maior que zero",
      "any.required": "Preço é obrigatório",
    }),
  }),

  pedido: Joi.object({
    cliente_id: Joi.number().integer().positive().required().messages({
      "number.base": "cliente_id deve ser um número",
      "number.integer": "cliente_id deve ser um número inteiro",
      "number.positive": "cliente_id deve ser maior que zero",
      "any.required": "cliente_id é obrigatório",
    }),
    status: Joi.string()
      .valid("pendente", "em_preparo", "pronto", "entregue", "cancelado")
      .default("pendente")
      .messages({
        "any.only":
          "Status inválido. Use: pendente, em_preparo, pronto, entregue ou cancelado",
      }),
  }),

  item: Joi.object({
    pedido_id: Joi.number().integer().positive().required().messages({
      "number.base": "pedido_id deve ser um número",
      "number.integer": "pedido_id deve ser um número inteiro",
      "any.required": "pedido_id é obrigatório",
    }),
    produto_id: Joi.number().integer().positive().required().messages({
      "number.base": "produto_id deve ser um número",
      "number.integer": "produto_id deve ser um número inteiro",
      "any.required": "produto_id é obrigatório",
    }),
    quantidade: Joi.number().integer().min(1).required().messages({
      "number.min": "Quantidade deve ser pelo menos 1",
      "any.required": "Quantidade é obrigatória",
    }),
    preco_unitario: Joi.number().positive().precision(2).required().messages({
      "number.positive": "Preço unitário deve ser maior que zero",
      "any.required": "Preço unitário é obrigatório",
    }),
  }),

  pedidoCompleto: Joi.object({
    cliente_id: Joi.number().integer().positive().required().messages({
      "number.base": "cliente_id deve ser um número",
      "any.required": "cliente_id é obrigatório",
    }),
    itens: Joi.array()
      .items(
        Joi.object({
          produto_id: Joi.number().integer().positive().required().messages({
            "any.required": "produto_id é obrigatório em cada item",
          }),
          quantidade: Joi.number().integer().min(1).required().messages({
            "number.min": "Quantidade deve ser pelo menos 1",
            "any.required": "quantidade é obrigatória em cada item",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "O pedido deve ter pelo menos 1 item",
        "any.required": "itens é obrigatório",
      }),
  }),
};

// =========================
// HELPER DE VALIDAÇÃO
// =========================

function validar(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(400).json({ erro: "Dados inválidos", detalhes: erros });
    }

    req.body = value; // usa o valor sanitizado pelo Joi (ex: default do status)
    next();
  };
}

// =========================
// ROTA INICIAL
// =========================

app.get("/", (req, res) => {
  res.send("<h1>API Lanchonete 🍔</h1>");
});

// =========================
// AUTH — LOGIN
// =========================

// POST /login
// Exemplo simples: usuário fixo em memória.
// Em produção, consulte a tabela de usuários e compare senha com bcrypt.
app.post("/login", validar(schemas.login), (req, res) => {
  const { usuario, senha } = req.body;

  // Substituir por consulta ao banco + bcrypt.compare em produção
  const USUARIO_FIXO = process.env.API_USUARIO || "admin";
  const SENHA_FIXA = process.env.API_SENHA || "1234";

  if (usuario !== USUARIO_FIXO || senha !== SENHA_FIXA) {
    return res.status(401).json({ erro: "Usuário ou senha inválidos" });
  }

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    mensagem: "Login realizado com sucesso",
    token,
    expira_em: JWT_EXPIRES_IN,
  });
});

// =========================
// CLIENTES
// =========================

// GET /clientes
app.get("/clientes", autenticar, async (req, res) => {
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
});

// POST /clientes
app.post("/clientes", autenticar, validar(schemas.cliente), async (req, res) => {
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
});

// =========================
// PRODUTOS
// =========================

// GET /produtos
app.get("/produtos", autenticar, async (req, res) => {
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
});

// POST /produtos
app.post("/produtos", autenticar, validar(schemas.produto), async (req, res) => {
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
});

// =========================
// PEDIDOS
// =========================

// POST /pedidos
app.post("/pedidos", autenticar, validar(schemas.pedido), async (req, res) => {
  try {
    const { cliente_id, status } = req.body;

    // Verifica se o cliente existe
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
});

// GET /pedidos
app.get("/pedidos", autenticar, async (req, res) => {
  try {
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
      ORDER BY p.id DESC
    `);

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

    res.json(Object.values(pedidos));
  } catch (erro) {
    console.error("[GET /pedidos]", erro);
    res.status(500).json({ erro: "Erro ao buscar pedidos" });
  }
});

// =========================
// ITENS DO PEDIDO
// =========================

// POST /itens
app.post("/itens", autenticar, validar(schemas.item), async (req, res) => {
  try {
    const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;

    // Verifica se o pedido existe
    const pedidoExiste = await pool.query(
      `SELECT id FROM pedidos WHERE id = $1`,
      [pedido_id]
    );

    if (pedidoExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    // Verifica se o produto existe
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
});

// =========================
// TOTAL DO PEDIDO
// =========================

// GET /pedidos/:id/total
app.get("/pedidos/:id/total", autenticar, async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({ erro: "ID do pedido inválido" });
    }

    // Verifica se o pedido existe
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
});

// =========================
// PEDIDO COMPLETO
// =========================

// POST /pedidos-completo
app.post(
  "/pedidos-completo",
  autenticar,
  validar(schemas.pedidoCompleto),
  async (req, res) => {
    const { cliente_id, itens } = req.body;

    try {
      // Verifica se o cliente existe
      const clienteExiste = await pool.query(
        `SELECT id FROM clientes WHERE id = $1`,
        [cliente_id]
      );

      if (clienteExiste.rows.length === 0) {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      // Busca todos os produtos de uma vez (resolve o N+1)
      const ids = itens.map((i) => i.produto_id);

      const produtosResult = await pool.query(
        `SELECT id, preco FROM produtos WHERE id = ANY($1::int[])`,
        [ids]
      );

      const precoMap = {};
      produtosResult.rows.forEach((p) => {
        precoMap[p.id] = p.preco;
      });

      // Verifica se todos os produtos existem
      const idsNaoEncontrados = ids.filter((id) => !precoMap[id]);

      if (idsNaoEncontrados.length > 0) {
        return res.status(404).json({
          erro: "Produtos não encontrados",
          ids: idsNaoEncontrados,
        });
      }

      // Inicia a transação
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
      console.error("[POST /pedidos-completo]", erro);
      res.status(500).json({ erro: "Erro ao criar pedido completo" });
    }
  }
);

module.exports = app;