const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

module.exports = errorHandler;
