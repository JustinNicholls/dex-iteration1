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

    //blog id variable declaration
    //temporary for blog_id, used for testing purposes 
    var blog_id;
  
    //testing POST text post to Tumblr 
    app.post('/text', function (req, res) {
		
	client.text('alexf388.tumblr.com', {title:'Hello', body:'Hello World!' }, function (err, data) {
		res.send(data); 
		//console.log(data);
		//parse data from function callback
		blog_id = JSON.stringify(data); 
		//console.log(blog_id); 
		blog_id = blog_id.replace(/"/g, ''); 
		blog_id = blog_id.replace("id:", ''); 
		blog_id = blog_id.replace(/[\])}[{(]/g,'')
		console.log(blog_id); 
			
	}); 
    }); 

    //testing REMOVE textpost from Tumblr 
    app.delete('/text', function (req, res) {
	client.deletePost('alexf388.tumblr.com', blog_id, function(err, data) {
	
		res.send(data);  
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

