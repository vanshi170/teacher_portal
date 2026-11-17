import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export function notFound(_req, _res, next) {
  next(new ApiError(404, 'Route not found.'));
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) {
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: 'The submitted data is invalid.' });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'An identifier or field value is invalid.' });
  }
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({ error: `${field || 'Record'} is already in use.` });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500 ? 'An unexpected server error occurred.' : error.message;
  if (status >= 500) {
    console.error(error);
  }
  return res.status(status).json({ error: message });
}
