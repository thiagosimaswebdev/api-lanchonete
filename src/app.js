const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const authRoutes    = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const pedidoRoutes  = require("./routes/pedidoRoutes");
const itemRoutes    = require("./routes/itemRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
  res.send("<h1>API Lanchonete 🍔</h1>");
});

// Documentação Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use("/login",    authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/clientes", clienteRoutes);
app.use("/produtos", produtoRoutes);
app.use("/pedidos",  pedidoRoutes);
app.use("/itens",    itemRoutes);

module.exports = app;