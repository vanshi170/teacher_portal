import ApiError from '../utils/ApiError.js';

export function validateBody(schema) {
  return function validateRequestBody(req, _res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ApiError(400, result.error.issues[0].message));
    }
    req.body = result.data;
    return next();
  };
}

export function validateQuery(schema) {
  return function validateRequestQuery(req, _res, next) {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ApiError(400, result.error.issues[0].message));
    }
    req.validatedQuery = result.data;
    return next();
  };
}
