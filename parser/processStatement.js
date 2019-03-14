module.exports = function processStatement(statement) {
  console.log({ type: statement.constructor.name, data: statement });
};
