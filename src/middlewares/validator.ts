import { RequestHandler } from 'express';
import { Schema, ValidationError, object } from 'yup';

export function validate(schema: Schema): RequestHandler {
  return async (req, res, next) => {
    if (!req.body) return res.json({ status: 400, error: 'Empty body is not accepted' });

    const schemaToValidate = object({
      body: schema,
    });

    try {
      await schemaToValidate.validate({ body: req.body }, { abortEarly: true });
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.json({ status: 400, error: err.message });
      }
    }
  };
}
