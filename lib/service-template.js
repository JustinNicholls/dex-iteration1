/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */

/*jslint node: true */
'use strict';

// third party modules
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var tumblr = require('tumblr.js');
// internal modules
var HttpCodeError = require('./util/http-code-error');
var logger = require('./util/logger');

/**
 * Start up a third-party channel handler application at the specified path.
 *
 * @param {string} path URL path base for handler service
 * @param {AbstractChannelHandler} handler handler for processing third-party channel requests
 * @param {string} [port] port to listen on
 */
module.exports = function (path, handler, port) {

  /*
     ===============================================================
     Express Application Setup
     ===============================================================
     */
  var app = module.exports = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(morgan('dev', { stream: {
    write: function (message, encoding) {
      // strip off newline from message since logger will add one anyways
      logger.info(message.replace(/[\r\n]*$/, ''));
    }
  }}));

  /*
     ===============================================================
     Application Routes
     ===============================================================
     */
  // routes for channel handler
  var router = express.Router();
  app.use(path, require('../routes/route_handler')(router, handler));

  //create new client for tumblr with consumer_key, consumer_secret, token, token_secret
  var client = tumblr.createClient({
    consumer_key: 'G5DTquGeU2TaVZa2m91DGadxaIh3Yv7sxhT2D4QbW4lmys9Wck',
    consumer_secret: '7hxOb0QDwJ65BbK2RWyvi9QbxOoxJ2T1UZYUzNGBsSjgtwRMLr',
    token: '0UT2vXL9kN66aPBcHpZWXQyNz9gnjrnVVpQrVR7ANaMARofXVl',
    token_secret: 's5J9fFYiEefBCqKn1ldOwHLiIAn2wAlo1tJJ5VK9zqXWCx0yR0'
  });


  //testing GET tumblr user info
  app.get('/test', function (req, res) {

    client.userInfo(function (err, data) {
      res.send(data);
    });
  });

  //global static variable declaration
  //temporary for blog_id, used for testing purposes
  var blog_id;
  //temporary for photo_id, used for testing purposes
  var photo_id;
  //temporary variable for notes, used for testing purposes
  var notes;

  //testing POST text post to Tumblr
  app.post('/text', function (req, res) {

    client.text('alexf388.tumblr.com', {title:'Hello', body:'Hello World!' }, function (err, data) {
      res.send(data);
      //console.log(data);
      //parse data from function callback
      //blog_id = JSON.stringify(data);
      //console.log(blog_id);
      blog_id = blog_id.replace(/"/g, '');
      blog_id = blog_id.replace("id:", '');
      blog_id = blog_id.replace(/[\])}[{(]/g,'');
      console.log('blog_id' + blog_id);

    });
  });

  //testing REMOVE textpost from Tumblr
  app.delete('/text', function (req, res) {
    //var blog_id = 109398704831;
    client.deletePost('alexf388.tumblr.com', blog_id, function(err, data) {
      res.send(data);

    });

  });

  //posting picture to Tumblr parameters
  //hard coded as of now
  var picture_options={
    caption: 'David Riley',
    link: 'http://cdn.marketplaceimages.windowsphone.com/v8/images/a74aebf8-f907-4bf2-9aa6-c6b39f2ecd07?imageType=ws_icon_large',
    source: 'http://cdn.marketplaceimages.windowsphone.com/v8/images/a74aebf8-f907-4bf2-9aa6-c6b39f2ecd07?imageType=ws_icon_large'
  };

  //post photo
  app.post('/photo', function (req, res) {
    client.photo('alexf388.tumblr.com', picture_options, function(err, data) {
      res.send(data);
      photo_id = JSON.stringify(data);
      photo_id = photo_id.replace(/"/g, '');
      photo_id = photo_id.replace("id:", '');
      photo_id = photo_id.replace(/[\])}[{(]/g,'');
      console.log('photo_id' + photo_id);
    });

  });

  //TODO: delete photo

  //post video
  //video options
  var video_options = {
    caption: 'trolloll',
    embed:'https://www.youtube.com/watch?v=oavMtUWDBTM'
  };

  app.post('/video', function (req, res) {
    client.video('alexf388.tumblr.com', video_options, function(err, data) {
      res.send(data);

    });

  });

  //TODO: delete video


  //posts_options for getting posts request
  var posts_options = {
    notes_info: true //retrieves notes
  };

  //TODO: retrieve posts and their notes
  app.get('/posts', function (req, res) {
    client.posts('alexf388.tumblr.com', posts_options, function(err, data) {
      res.send(data);

      var number_of_posts = data.blog.posts;
      console.log("number of posts: " + number_of_posts);

      //if there is more than one post, we need to go through each post and see if they have notes
      if (number_of_posts > 0 )
      {
        //for loop to go through each post
        for (var i = 0 ; i < number_of_posts ; i++)
        {

          //console.log("note_count " + data.posts[i].note_count);

          //if attribute note_count for each post is bigger than 0
          if (data.posts[i].note_count > 0 )
          {

            var number_of_notes = 0 ;
            for (data.posts[i].notes.timestamp in data.posts[i].notes)
            {

              number_of_notes++;
              var temp_note = data.posts[i].notes[number_of_notes];

              if (temp_note != null) {
                //console.log("current note: " + number_of_notes);
                console.log("note: " + temp_note.blog_name);
                console.log("contents:" + temp_note);
              }


            }
            console.log ("number_of_notes: " + number_of_notes);
          }

        }

      }
      /*
		notes = data.posts[0].notes;
		//console.log(notes); //displays all the notes for post 0

		var count = 0;

		//each note has its own unique timestamp, we count the number of timestamps to
		//count the number of notes
 		for (notes.timestamp in notes)
		{
			if (notes.hasOwnProperty(notes.timestamp) )
			{
				count++;
			}
		}

		console.log("count2 " + count);

		*/
    });

  });

  // catch-all error handler
  app.use(function(req, res, next) {
    next(new HttpCodeError(404, 'The resource you requested does not exist.'));
  });
  app.use(require('../routes/rest-error-handler'));

  /*
     ===============================================================
     Application Service Start
     ===============================================================
     */
  var processport = port || process.env.PORT || 5050;
  app.listen(processport);

  console.log("Listening on port: " + processport);

  return app;
};

