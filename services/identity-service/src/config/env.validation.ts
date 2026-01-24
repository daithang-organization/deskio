import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3001),

  // Multi-tenant / service basics (optional placeholders)
  SERVICE_NAME: Joi.string().default('deskio-service'),

  // Database/Redis placeholders for later (optional)
  DATABASE_URL: Joi.string().optional(),
  REDIS_URL: Joi.string().optional()
}).unknown(true);
