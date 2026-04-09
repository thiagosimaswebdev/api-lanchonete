const Joi = require("joi");

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

  atualizarStatus: Joi.object({
    status: Joi.string()
      .valid("pendente", "em_preparo", "pronto", "entregue", "cancelado")
      .required()
      .messages({
        "any.only":
          "Status inválido. Use: pendente, em_preparo, pronto, entregue ou cancelado",
        "any.required": "Status é obrigatório",
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

module.exports = schemas;