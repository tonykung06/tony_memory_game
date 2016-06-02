var express = require('express');
var HighScore = require('../models/HighScore');

var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    console.log('Operating on /api/highscores...');
    next(); // make sure we go to the next routes and don't stop here
});

//GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({
        message: 'You may get to the rest APIs by /api/highscores'
    });
});

router.route('/highscores')
    .post(function (req, res) { // POST http://localhost:8080/api/highscores
        var highScore = new HighScore();
        highScore.name = req.body.name;
        highScore.email = req.body.email;
        highScore.score = req.body.score;
    
        highScore.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.json({
                success: true,
                id: highScore['_id'],
                message: 'The score is saved.'
            });
        });
    })
    .get(function (req, res) { // GET http://localhost:8080/api/highscores
        HighScore.find(function (err, highScores) {
            if (err) {
                res.send(err);
            }
            res.json(highScores);
        });
    });

router.route('/bears/:highscore_id')
    .get(function (req, res) { // GET http://localhost:8080/api/highscores/:highscore_id
        HighScore.findById(req.params.highscore_id, function (err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })
    .put(function (req, res) { // PUT http://localhost:8080/api/highscores/:highscore_id
        HighScore.findById(req.params.highscore_id, function (err, bear) {
            if (err) {
                res.send(err);
            }

            highScore.name = req.body.name;
            highScore.email = req.body.email;
            highScore.score = req.body.score;

            highScore.save(function (err) {
                if (err) {
                    res.send(err);
                }

                res.json({
                    success: true,
                    message: 'The highScore is updated.'
                });
            });

        });
    })
    .delete(function (req, res) { // DELETE http://localhost:8080/api/highscores/:highscore_id
        HighScore.remove({
            _id: req.params.highscore_id
        }, function (err, bear) {
            if (err) {
                res.send(err);
            }
            res.json({
                success: true,
                message: 'The highScore is deleted.'
            });
        });
    });

module.exports = router;