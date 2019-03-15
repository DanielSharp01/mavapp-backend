const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mavapp', { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
module.exports = mongoose;