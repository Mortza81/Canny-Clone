const Joi = require("joi");

const authValidation = {
  name: Joi.string().required().max(20).messages({
    "string.base": "Name must be a string",
    "any.required": "Name is requied",
    "string.max": "Name must have less or equal then 20 characters",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Your email is not valid",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
  passwordConfirm: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Your password and your passwordConfirm do not match",
    "any.required": "Please confirm your password",
  }),
  role: Joi.string().valid("admin", "user").default("user").messages({
    "any.only": "Role must be either admin or user",
  }),
};
exports.signup = Joi.object(authValidation).fork(["role"], (schema) =>
  schema.forbidden().messages({
    "any.unknown": "Not allowed field: role",
  }),
);
exports.login = Joi.object(authValidation).fork(
  ["name", "passwordConfirm"],
  (schema) => schema.optional(),
);
