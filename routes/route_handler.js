/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */
'use strict';

// third-party modules
var _ = require('underscore');
// internal modules
var logger = require('../lib/util/logger');


//Tumblr stuff
var tumblr = require('tumblr.js');

//Tumblr Client
//create new client for tumblr with consumer_key, consumer_secret, token, token_secret
  var client = tumblr.createClient({
    consumer_key: 'G5DTquGeU2TaVZa2m91DGadxaIh3Yv7sxhT2D4QbW4lmys9Wck',
    consumer_secret: '7hxOb0QDwJ65BbK2RWyvi9QbxOoxJ2T1UZYUzNGBsSjgtwRMLr',
    token: '0UT2vXL9kN66aPBcHpZWXQyNz9gnjrnVVpQrVR7ANaMARofXVl',
    token_secret: 's5J9fFYiEefBCqKn1ldOwHLiIAn2wAlo1tJJ5VK9zqXWCx0yR0'
  });

/**
 * Add routes for a third-party channel handler to an Express application.
 *
 * @param app express application
 * @param {AbstractChannelHandler} handler handler for processing third-party channel requests
 */
module.exports = function (app, handler) {

  if (!handler) {
    throw new Error('Service not found!');
  }


  //accept function
  app.post('/accept', function (req, res) {
    logger.debug("accept:", req.body);
    var accepted = handler.accept(req.body);
    //console.log("what is accepted? " + accepted);

    //deliver post goes here if true
    //NOTE: not sure if we really need to call deliver, or DEX calls deliver below

    //end if


    logger.debug("accepted:", accepted);
    res.status(200).send({accepted: accepted});
  });

  app.post('/deliver', function(req, res, next) {
    handler.deliver(req.body.params, req.body.playlist, function(err, result) {
      if (err) {
        console.log("NO SUCCESS :( " );
        next(err);

      } else {
        console.log("GREAT SUCCESS :) ");
        console.log('delivered: ', result);
        logger.debug("delivered:", result);

        //original res.send
        //result = JSON.stringify(result);
        res.status(200).send(result); //should send the scObjectId and postId
      }
    });
  });

  app.post('/feedback', function(req, res, next) {
    handler.getFeedback(req.body, function(err, feedback) {
      if (err) {
        next(err);
      } else {
        logger.debug("feedback:", feedback);
        res.status(200).send(feedback);
      }
    });
  });

  app.post('/remove', function(req, res, next) {
    logger.debug("remove: ", req.body);
    handler.remove(req.body, function(err) {
      if (err) {
        next(err);
      } else {
        res.status(200).send();
      }
    });
  });

  return app;
};
