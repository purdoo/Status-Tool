const express = require('express');

// var indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const statusRouter = require('./routes/status');



let app = express();

// app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/status', statusRouter);

module.exports = app;
