function validar(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(400).json({ erro: "Dados inválidos", detalhes: erros });
    }

    req.body = value;
    next();
  };
}

module.exports = validar;