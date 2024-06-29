const Joi = require("joi");
const schema = {
  user: Joi.string().required().messages({
    "string.base": "User ID must be a string",
    "string.empty": "User ID cannot be empty",
    "any.required": "Comment must belong to a user",
  }),
  request: Joi.string().required().messages({
    "string.base": "Request ID must be a string",
    "string.empty": "Request ID cannot be empty",
    "any.required": "Comment must belong to a request",
  }),
  body: Joi.string().required().messages({
    "string.base": "Comment body must be a string",
    "string.empty": "Comment body cannot be empty",
    "any.required": "Your comment should have a body text",
  }),
  images: Joi.optional(),
};
exports.createComment = Joi.object(schema);
exports.updateComment = Joi.object(schema).fork(
  ["user", "body", "request"],
  (schema) => schema.optional(),
);
