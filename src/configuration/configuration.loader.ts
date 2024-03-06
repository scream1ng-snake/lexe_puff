import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as Joi from 'joi';
import * as yaml from 'js-yaml';
import * as path from 'path';

const validationSchema = Joi.object({
  mode: Joi.string(),
  db: Joi.object({
    application: Joi.object({
      type: Joi.string().valid('postgres').required(),
      user: Joi.string().required(),
      host: Joi.string().hostname().required(),
      port: Joi.number().integer().required(),
      password: Joi.string().required(),
      database: Joi.string().required(),
      schema: Joi.string().required(),
    }),
    lexema8: Joi.object({
      type: Joi.string().valid('postgres').required(),
      user: Joi.string().required(),
      host: Joi.string().hostname().required(),
      port: Joi.number().integer().required(),
      password: Joi.string().required(),
      database: Joi.string().required(),
      schema: Joi.string().required(),
    }),
  }),

  http: Joi.object({
    port: Joi.number().integer().required(),
    host: Joi.string().hostname().required(),
  }),

  ftp: Joi.object({
    host: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string().required(),
    ftpPath: Joi.string().required(),
    secure: Joi.bool().required(),
  }),
  yandex: Joi.object({
    OAuth: Joi.string().required(),
    XFolderId: Joi.string().required(),
  })
});

export function configGetter() {
  const filepath = path.join(process.cwd(), 'config.yaml')
  const file = fs.readFileSync(filepath, 'utf8')
  const config = yaml.load(file) as Record<string, any>
  const { error, value, warning } = validationSchema.validate(config)
  if(error) throw error
  return value
}