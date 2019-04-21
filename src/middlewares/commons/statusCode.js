module.exports = () => {
  return async (req, res, next) => {
    let statusCode = res.statusCode || 200;
    res.status(statusCode).send({
      result: res.result,
      statusCode: statusCode
    });
  }
}