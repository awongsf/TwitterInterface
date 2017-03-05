'use strict';

var T = require('./public/js/config.js');
var express = require('express');

var app = express();

app.use('/static', express.static(__dirname + '/public'))

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

app.get('/', function(req, res){
	var path = req.path;
	res.locals.path = path;
	res.render('index');
});

//
//  search twitter for all tweets containing the word 'banana' since July 11, 2011
//
// T.get('search/tweets', { q: 'banana since:2011-07-11', count: 100 }, function(err, data, response) {
//   console.log(data)
// })

app.listen(3000, '0.0.0.0', function() {
	console.log("The frontend server is running on port 3000!");
});