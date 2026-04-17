const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido nas variáveis de ambiente!");
}
const JWT_EXPIRES_IN = "8h";
const SALT_ROUNDS = 10;

async function cadastrar(req, res) {
  try {
    const { nome, usuario, senha } = req.body;

    // Verifica se o usuário já existe
    const usuarioExiste = await pool.query(
      `SELECT id FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    if (usuarioExiste.rows.length > 0) {
      return res.status(409).json({ erro: "Usuário já cadastrado" });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, SALT_ROUNDS);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, usuario, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, usuario, criado_em`,
      [nome, usuario, senhaCriptografada]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    console.error("[POST /usuarios]", erro);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
}

async function login(req, res) {
  try {
    const { usuario, senha } = req.body;

    // Busca o usuário no banco
    const resultado = await pool.query(
      `SELECT * FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const usuarioEncontrado = resultado.rows[0];

    // Compara a senha com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuarioEncontrado.id, usuario: usuarioEncontrado.usuario },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      token,
      expira_em: JWT_EXPIRES_IN,
    });
  } catch (erro) {
    console.error("[POST /login]", erro);
    res.status(500).json({ erro: "Erro ao realizar login" });
  }
}

module.exports = { cadastrar, login };