import { RequestHandler } from 'express';
import { Schema, ValidationError, object } from 'yup';

export function validate(schema: Schema): RequestHandler {
  return async (req, res, next) => {
    if (!req.body) return res.status(422).json({ error: 'Empty body is not accepted' });

    const schemaToValidate = object({
      body: schema,
    });

    try {
      await schemaToValidate.validate({ body: req.body }, { abortEarly: true });
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(422).json({ error: err.message });
      }
    }
  };
}
