const moment = require("moment");

module.exports = function processStatement(statement) {
  console.log(moment().toString(), { type: statement.constructor.name, data: { ...statement } });

  if (statement.process !== undefined) return statement.process()
};
