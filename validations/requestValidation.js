const Joi = require("joi");

const schema = {
  title: Joi.string().max(20).required().messages({
    "string.base": "Title must be a string",
    "string.max": "Title must have less or equal then 20 characters",
    "any.required": "Title is required",
  }),
  status: Joi.string()
    .valid("in progress", "planned", "under review")
    .messages({
      "any.only":
        "Status must be either: in progress, planned, or under review",
    })
    .forbidden(),
  category: Joi.string().messages({
    "string.base": "Category must be a string",
  }),
  description: Joi.string().required().messages({
    "string.base": "Description must be a string",
    "any.required": "Description is required",
  }),
  user: Joi.string().required().messages({
    "string.base": "User ID must be string",
    "any.required": "It must belongs to a user",
  }),
  images: Joi.optional(),
};
exports.createRequest = Joi.object(schema);
exports.updateRequest = Joi.object(schema).fork(
  ["user", "description", "title"],
  (schema) => schema.optional(),
);
exports.setStatus = Joi.object(schema)
  .fork(["user", "description", "title"], (schema) => schema.optional())
  .fork(["status"], (schema) => schema.optional());
