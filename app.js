'use strict';

var T = require('./public/js/config.js'),
	express = require('express'),
	moment = require('moment'),
	bodyParser = require('body-parser');

var app = express();

var accountList = {},
	timelineList = {},
	friendsList = {},
	msgList = {};

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

app.use('/static', express.static(__dirname + '/public'))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

T.get('account/verify_credentials', function(err, data, response) {

	accountList["screenName"] = data.screen_name;
	accountList["profileImgURL"] = data.profile_image_url;
	accountList["profileBgImgURL"] = data.profile_background_image_url;
	accountList["friendsCount"] = data.friends_count;
	//console.log(accountList);

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

		//console.log(timelineList);

			T.get('friends/list', { count: 5 }, function(err, data, response) {

				friendsList = data["users"].map(function (obj) {
					var list = {};
					list["profileImageURL"] = obj.profile_image_url;
					list["name"] = obj.name;
					list["screenName"] = obj.screen_name;
					list["following"] = obj.following;
					return list;
				});

				//console.log(friendsList);

				T.get('direct_messages', { count: 5 }, function(err, data, response) {

					msgList = data.map(function (obj) {
						var list = {};
						list["senderProfileImageURL"] = obj.sender["profile_image_url"];
						list["senderName"] = obj.sender["name"];
						list["messageBody"] = obj.text;
						list["date"] = moment(obj.created_at).format("MMM Do h:mm a");
						return list;
					});

					//console.log(msgList);
				})
			})
	})
})

app.get('/', function(req, res) {

	res.render('index', { 
		accountList: accountList,
		timelineList: timelineList,
		friendsList: friendsList,
		msgList: msgList
	});
});

app.post('/', function (req, res) {

  T.post('statuses/update', { status: req.body.tweetInput }, function(err, data, response) {

  	res.render('index', { 
		accountList: accountList,
		timelineList: timelineList,
		friendsList: friendsList,
		msgList: msgList
	});
  })
});

app.listen(3000, function() {
	console.log("The frontend server is running on port 3000!");
});



