const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "troque_em_producao";
const JWT_EXPIRES_IN = "8h";

async function login(req, res) {
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
}

module.exports = { login };