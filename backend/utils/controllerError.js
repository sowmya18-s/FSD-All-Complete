const respondWithControllerError = (res, error, context, fallbackMessage) => {
  console.error(`${context}: ${error?.name || 'Unknown error'}`);

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with one of these values already exists.',
    });
  }

  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Submitted data is invalid.',
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  respondWithControllerError,
  escapeRegex,
};
