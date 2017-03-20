/*
To run this app, please populate the config.js file using the following template:

'use strict';

var Twit = require('twit');

module.exports = new Twit({
	consumer_key: 'insert_consumer_key',
	consumer_secret: 'insert_consumer_secret',
	access_token: 'insert_access_token',
	access_token_secret: 'insert_acces_token_secret'
});

*/

'use strict';

var T = require('./public/js/config.js'),
	express = require('express'),
	moment = require('moment'),
	bodyParser = require('body-parser');

var app = express();

// Objects to be populated with data 
// requested from Twit API
var accountList = {},
	timelineList = {},
	friendsList = {},
	msgList = {};

// customize how relative time is displayed
moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s:  "s",
        m:  "1m",
        mm: "%dm",
        h:  "1h",
        hh: "%dh",
        d:  "1d",
        dd: "%dd",
        M:  "1mo",
        MM: "%dmo",
        y:  "1y",
        yy: "%dy"
    }
});

app.use('/static', express.static(__dirname + '/public')) // serve static files
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'pug'); // set Pug as view engine
app.set('views', __dirname + '/templates'); // retrieve views from folder named 'templates'

// Request data on authenticating user
T.get('account/verify_credentials', function(err, data, response) {

	accountList["screenName"] = data.screen_name;
	accountList["profileImgURL"] = data.profile_image_url;
	accountList["profileBgImgURL"] = data.profile_background_image_url;
	accountList["friendsCount"] = data.friends_count;

	// Request data on 5 most recent tweets on authenticating user's timeline
	T.get('statuses/home_timeline', { count: 5 }, function(err, data, response) {

		timelineList = data.map(function (obj) {
			var list = {};
			list["text"] = obj.text;
			list["retweets"] = obj.retweet_count;
			list["likes"] = obj.favorite_count;
			list["dateTweeted"] = moment(obj.created_at, "dd MMM DD HH:mm:ss ZZ YYYY", "en").fromNow(true);
			list["name"] = obj.user["name"];
			list["userScreenName"] = obj.user["screen_name"];
			list["userProfileImgURL"] = obj.user["profile_image_url"];
			return list;
		});		

			// Request data on last 5 friends the authenticating user followed
			T.get('friends/list', { count: 5 }, function(err, data, response) {

				friendsList = data["users"].map(function (obj) {
					var list = {};
					list["profileImageURL"] = obj.profile_image_url;
					list["name"] = obj.name;
					list["screenName"] = obj.screen_name;
					list["following"] = obj.following;
					return list;
				});

				// Request data on last 5 direct messages received by authenticating user
				T.get('direct_messages', { count: 5 }, function(err, data, response) {

					msgList = data.map(function (obj) {
						var list = {};
						list["senderProfileImageURL"] = obj.sender["profile_image_url"];
						list["senderName"] = obj.sender["name"];
						list["messageBody"] = obj.text;
						list["date"] = moment(obj.created_at, "dd MMM DD HH:mm:ss ZZ YYYY", "en").format("MMM Do h:mm a");
						return list;
					});

				})
			})
	})
})

// Route http get requests to root
app.get('/', function(req, res) {

	// Render index.pug along with data collected from
	// Twit API requests.
	res.render('index', { 
		accountList: accountList,
		timelineList: timelineList,
		friendsList: friendsList,
		msgList: msgList
	});
});

// Route http post requests to root
app.post('/', function (req, res) {

	// API request to update the authenticating user's current status with
	// data submitted by form.
	T.post('statuses/update', { status: req.body.tweetInput }, function(err, data, response) {

		// After status is updated, render the index page again.
		res.render('index', { 
			accountList: accountList,
			timelineList: timelineList,
			friendsList: friendsList,
			msgList: msgList
		});
	})
});

// Error handler
app.use(function (err, req, res, next) {

  console.error(err.stack);
  res.status(500).render('error', {errorMsg: err.message});

})

// 404 error handler
app.use(function (req, res, next) {

  res.status(404).render('error', {errorMsg: "Sorry, this page could not be found."});

})

// Bind and listen for connections on port 3000
app.listen(3000, function() {

	console.log("The frontend server is running on port 3000!");

});





