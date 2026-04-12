# 🍔 API Lanchonete

API REST desenvolvida em Node.js para gerenciamento de uma lanchonete, com autenticação JWT, validação de dados e boas práticas de desenvolvimento.

---

## 🚀 Tecnologias

- **Node.js** + **Express** — servidor HTTP
- **PostgreSQL** — banco de dados relacional
- **jsonwebtoken** — autenticação via JWT
- **bcrypt** — criptografia de senhas
- **Joi** — validação de inputs
- **nodemon** — hot reload em desenvolvimento

---

## 📁 Estrutura do projeto

```
src/
├── config/
│   └── db.js                 # Conexão com o banco de dados
├── controllers/
│   ├── authController.js     # Login e cadastro de usuários
│   ├── clienteController.js  # CRUD de clientes
│   ├── produtoController.js  # CRUD de produtos
│   ├── pedidoController.js   # Pedidos e itens
│   └── itemController.js     # Itens avulsos
├── middlewares/
│   ├── autenticar.js         # Verificação do token JWT
│   └── validar.js            # Helper de validação Joi
├── routes/
│   ├── authRoutes.js
│   ├── usuarioRoutes.js
│   ├── clienteRoutes.js
│   ├── produtoRoutes.js
│   ├── pedidoRoutes.js
│   └── itemRoutes.js
├── schemas/
│   └── schemas.js            # Schemas de validação Joi
└── app.js                    # Configuração do Express
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos

- Node.js v18+
- PostgreSQL
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/api-lanchonete.git

# Acesse a pasta
cd api-lanchonete

# Instale as dependências
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=db_lanchonete

JWT_SECRET=seu_secret_aqui
```

### Banco de dados

Execute o script abaixo no PostgreSQL para criar as tabelas:

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE itens_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);
```

### Rodando o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)**. Para acessar as rotas protegidas, é necessário:

1. Cadastrar um usuário em `POST /usuarios`
2. Fazer login em `POST /login` e obter o token
3. Enviar o token no header de todas as requisições:

```
Authorization: Bearer seu_token_aqui
```

---

## 📋 Rotas da API

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/usuarios` | Cadastrar usuário | Não |
| POST | `/login` | Fazer login e obter token | Não |

### Clientes

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/clientes` | Listar todos os clientes | Sim |
| GET | `/clientes/:id` | Buscar cliente por ID | Sim |
| POST | `/clientes` | Criar cliente | Sim |
| PUT | `/clientes/:id` | Atualizar cliente | Sim |
| DELETE | `/clientes/:id` | Deletar cliente | Sim |

### Produtos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/produtos` | Listar todos os produtos | Sim |
| GET | `/produtos/:id` | Buscar produto por ID | Sim |
| GET | `/produtos?nome=x` | Buscar produto por nome | Sim |
| POST | `/produtos` | Criar produto | Sim |
| PUT | `/produtos/:id` | Atualizar produto | Sim |
| DELETE | `/produtos/:id` | Deletar produto | Sim |

### Pedidos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/pedidos` | Listar todos os pedidos | Sim |
| GET | `/pedidos?status=pendente` | Filtrar por status | Sim |
| GET | `/pedidos?page=1&limit=10` | Listar com paginação | Sim |
| GET | `/pedidos/:id` | Buscar pedido por ID | Sim |
| GET | `/pedidos/:id/total` | Calcular total do pedido | Sim |
| POST | `/pedidos` | Criar pedido | Sim |
| POST | `/pedidos/completo` | Criar pedido com itens | Sim |
| PATCH | `/pedidos/:id/status` | Atualizar status do pedido | Sim |
| POST | `/itens` | Adicionar item a um pedido | Sim |

---

## 📦 Exemplos de requisição

### Cadastro de usuário

```json
POST /usuarios
{
  "nome": "Thiago",
  "usuario": "thiago",
  "senha": "123456"
}
```

### Login

```json
POST /login
{
  "usuario": "thiago",
  "senha": "123456"
}
```

### Criar pedido completo

```json
POST /pedidos/completo
{
  "cliente_id": 1,
  "itens": [
    { "produto_id": 1, "quantidade": 2 },
    { "produto_id": 2, "quantidade": 1 }
  ]
}
```

### Atualizar status do pedido

```json
PATCH /pedidos/1/status
{
  "status": "em_preparo"
}
```

**Status disponíveis:** `pendente` → `em_preparo` → `pronto` → `entregue` / `cancelado`

---

## ✅ Funcionalidades

- Autenticação real com JWT e senha criptografada via bcrypt
- Validação de todos os inputs com Joi
- CRUD completo de clientes e produtos
- Criação de pedido completo com transação e rollback automático
- Atualização de status do pedido com regras de negócio
- Filtro de pedidos por status
- Busca de produtos por nome
- Paginação nos pedidos
- Deleção segura com verificação de vínculos
- Proteção contra SQL injection com queries parametrizadas

---

## 👨‍💻 Autor

Desenvolvido por **Thiago**

[![GitHub](https://img.shields.io/badge/GitHub-thiagosimaswebdev-181717?style=flat&logo=github)](https://github.com/thiagosimaswebdev)