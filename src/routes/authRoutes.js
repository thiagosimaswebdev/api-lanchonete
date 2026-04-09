const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const validar = require("../middlewares/validar");
const schemas = require("../schemas/schemas");

router.post("/", validar(schemas.login), login);

module.exports = router;