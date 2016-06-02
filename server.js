var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    highScoreRouter = require('./app/routes/highscore');

var webServerPort = process.env.PORT || 8080;

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/memorygame');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//set up routing
app.use('/api', highScoreRouter);

//route to the UI
app.use(express.static('app/ui/build/production/MemoryGame'));
//app.use(express.static('app/ui'));

app.listen(webServerPort);
console.log('node.js is listening on port ' + webServerPort);