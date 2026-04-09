const express = require("express");

const authRoutes    = require("./routes/authRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const pedidoRoutes  = require("./routes/pedidoRoutes");
const itemRoutes    = require("./routes/itemRoutes");

const app = express();
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
  res.send("<h1>API Lanchonete 🍔</h1>");
});

// Rotas
app.use("/login",    authRoutes);
app.use("/clientes", clienteRoutes);
app.use("/produtos", produtoRoutes);
app.use("/pedidos",  pedidoRoutes);
app.use("/itens",    itemRoutes);

module.exports = app;