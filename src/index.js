'use strict';

// load modules
const express = require('express');
const {connect} = require('mongoose');
const morgan = require('morgan');

const {users} = require('./routes/api/');

const app = express();

var connection = connect(
    'mongodb://localhost:27017/course-api', 
    {useNewUrlParser: true}
)
    .then(con => console.log(`Successfully connected to ${con.connection.name}!`))
    .catch(err => console.error(`Could not connect to database.`, err));

// set our port
app.set('port', process.env.PORT || 5000);

app.use(morgan('dev'));
app.use(express.json());

// TODO add additional routes here

// user routes
app.use('/api/users', users);

// send a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

// uncomment this route in order to test the global error handler
// app.get('/error', function (req, res) {
//   throw new Error('Test error');
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// global error handler
app.use((err, req, res, next) => {
    //console.error(err);
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors ? err.errors : {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

module.exports = app;
