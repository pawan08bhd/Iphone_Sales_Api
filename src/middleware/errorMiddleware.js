export const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON request body';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((item) => item.message).join(', ');
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    status = 409;
    message = 'A record with these values already exists';
  }

  const body = { error: message };
  if (process.env.NODE_ENV !== 'production' && status === 500) body.details = err.message;
  res.status(status).json(body);
};
