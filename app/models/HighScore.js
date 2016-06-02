var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HighScoreSchema = new Schema({
    name: String,
    email: String,
    score: Number
});

module.exports = mongoose.model('HighScore', HighScoreSchema, 'highscores');