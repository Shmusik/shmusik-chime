require('dotenv').load();

//required
const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const methods = require('./src/server.js');

//methods
const createMeeting = methods.createMeeting;
const createAttendee = methods.createAttendee;
const getMeeting = methods.getMeeting;
const deleteMeeting = methods.deleteMeeting;
const updateEndpoint = methods.updateEndpoint;
const sendNotification = methods.sendNotification;
const createJoinMeeting = methods.createJoinMeeting;

//create express webapp.
const app = express();

//parse json and urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function(request, response) {
    response.send("Welcome!");
});

app.get('/', function(request, response) {
    response.send("Welcome!");
});

app.post('/createMeeting', function(request, response) {
    createMeeting(request.body, response);
});

app.post('/createAttendee', function(request, response) {
    createAttendee(request.body, response);
});

app.get('/getMeeting', function(request, response) {
    getMeeting(request, response);
});

app.delete('/deleteMeeting', function(request, response) {
    deleteMeeting(request, response);
});

app.post('/updateEndpoint', function(request, response) {
    updateEndpoint(request.body, response);
});

app.post('/sendNotification', function(request, response) {
    sendNotification(request.body, response);
});

app.post('/createJoinMeeting', function(request, response ){
    createJoinMeeting(request, response);
});

//create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Server running on *:' + port);
});