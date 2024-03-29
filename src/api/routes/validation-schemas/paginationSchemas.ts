import joi from '@hapi/joi';

export const paginatedQuerySchema = joi.object({
  page: joi.number().default(0),
  size: joi.number().default(50),
  sort: joi.string().default('updatedAt'),
  sortDirection: joi
    .string()
    .valid('asc', 'desc')
    .default('desc'),
});
