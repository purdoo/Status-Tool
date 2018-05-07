const express = require('express');
const cors = require('cors')

// var indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const statusRouter = require('./routes/status');


let app = express();


app.use(cors());

// app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/status', statusRouter);

module.exports = app;