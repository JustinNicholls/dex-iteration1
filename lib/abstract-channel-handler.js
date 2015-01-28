/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */

var HttpCodeError = require('./util/http-code-error');
var logger = require('./util/logger');
var tumblr = require('tumblr.js');
var KBUtils = require ('./kb-utils.js');
var accessToken = require('./accessToken.js');

var config = {
  kb: { host: "developer.kb.kdexit.co"} ,
  datastore: 'TumblrDB'
};

//global variable declarations
var kbclient = new KBUtils(config); //declare an instance of xKb adapter
var access = new accessToken(); //declare an instance of access token authorization
var accessTokenString ;

//Tumblr Client
//create new client for tumblr with consumer_key, consumer_secret, token, token_secret
var client = tumblr.createClient({
  consumer_key: 'G5DTquGeU2TaVZa2m91DGadxaIh3Yv7sxhT2D4QbW4lmys9Wck',
  consumer_secret: '7hxOb0QDwJ65BbK2RWyvi9QbxOoxJ2T1UZYUzNGBsSjgtwRMLr',
  token: '0UT2vXL9kN66aPBcHpZWXQyNz9gnjrnVVpQrVR7ANaMARofXVl',
  token_secret: 's5J9fFYiEefBCqKn1ldOwHLiIAn2wAlo1tJJ5VK9zqXWCx0yR0'
});


//calls authenticate function from routes/accessToken.js
access.authenticate("cfung58@uwo.ca", "Beaufighter_1", "activesight", function(err, token){
  accessTokenString = token;
  console.log("accessTokenString: " , accessTokenString);
});

//kb-utils set token
kbclient.setToken(accessTokenString);
console.log("KB client token has been set!");

//xKB adapter
/*
var self = this;

setTimeout(function() {

  //put extract data
  self.extractData(id, function(err, data) {
    //if there is an error
    if (err){
        callback(err);
     }

    //compute change
     self.diff(function(err, dat) {
         //save changes
         self.kbclient.persist(dat, callback);
      });

   });


 }, 20000);
*/

//poll on a 20 second interval




/**
 * Constructor for abstract channel handlers.
 * This class should be extended as necessary by concrete handler implementations.
 * @constructor
 */
function AbstractChannelHandler() {
}

function buildLogMsg(action, msg) {
  return "resource: abstract channel handler, action: " + action + ", " + msg;
}


/**
 * Determine whether a channel instance is compatible with the handler.
 *
 * @param {Object} channel channel instance to test
 * @return {Boolean} true if accepted, false otherwise
 */
AbstractChannelHandler.prototype.accept = function (channel) {
  var name = "false";

  var website = channel.url.split(".");

  for(var i=0; i < website.length; i++){

    //checks if the url contains the world tumblr
    if(website[i] == "tumblr"){
      name = "true";

      break;
    }
    else{
      name = "false";
    }

  };

  if(name == "true"){
    logger.info(buildLogMsg("accept", "msg: supported by this channel handler"));
    return true;
  }
  else{
    return false;
  }

};

/**
 * Deliver a content playlist to a channel instance.
 * Result should be an array of objects corresponding to the posted SC instances.
 *
 * Result objects must at a minimum consist of { scObjectId: '...' } and should be
 * extended with any other data necessary to uniquely reference the deployed content
 * (e.g. post ID).
 *
 * @param {Object} params delivery parameters
 * @param {Object} playlist content playlist
 * @param {Function} callback invoked as callback([error], [result]) when finished
 */
AbstractChannelHandler.prototype.deliver = function (params, playlist, callback) {
  //Tumblr Client
  //create new client for tumblr with consumer_key, consumer_secret, token, token_secret
  var client = tumblr.createClient({
    consumer_key: 'G5DTquGeU2TaVZa2m91DGadxaIh3Yv7sxhT2D4QbW4lmys9Wck',
    consumer_secret: '7hxOb0QDwJ65BbK2RWyvi9QbxOoxJ2T1UZYUzNGBsSjgtwRMLr',
    token: '0UT2vXL9kN66aPBcHpZWXQyNz9gnjrnVVpQrVR7ANaMARofXVl',
    token_secret: 's5J9fFYiEefBCqKn1ldOwHLiIAn2wAlo1tJJ5VK9zqXWCx0yR0'
  });


  //if name is true, then callback will send 200
  //if name is false, then callback will send 501
  var name = false;

  //extract delivery-body.json
  //extract info from params
  //extract url from params
  var url = params.channel.url;

  //we need to remove 'https://' from the url
  url = url.replace('https://' || 'http://' ,'');
  //console.log("new url: " + url);

  //extract scObj.id?
  var scObjectId = playlist[0].scObj.id;

  console.log("text: ", playlist[0].multimedia.text);
  console.log("image: ", playlist[0].multimedia.image);

  //TEXT POST
  //if there is no text and no image
  if (playlist[0].multimedia.text == "" && playlist[0].multimedia.image == ""){
    //console.log("text is empty");
    name = false;
  }
  //else if there is text but no image
  else if (playlist[0].multimedia.text != "" && playlist[0].multimedia.image == ""){
    name = true;

    //extract name and content from the text content
    var title = playlist[0].multimedia.text[0].property.name;
    //title = "'" + title + "'";
    var message = playlist[0].multimedia.text[0].property.content;
    //message = "'" + message + "'";

    var text_options = {
      'title': title,
      'body': message
    };


    //variable that will contain the post_id
    var post_id;
    client.text('alexf388.tumblr.com', text_options, function (err, data) {
      console.log("text but no image to Tumblr");
      //console.log("data from client.text: ", data);

      if (data){
        post_id = data; //in json format

        //get id from { id : <some number> }
        post_id = post_id.id;

        var new_text_options = {
          'scObjectId' : scObjectId,
          'postId' : post_id
        };


        callback(null, new_text_options);
      }
      else if (err){
        callback(new HttpCodeError(501, 'deliver not implemented, unable to send text to Tumblr'));
      }


      /*
      kbclient.persistSample (new_text_options, function(err, data) {
        console.log("err: " + err);
        console.log("data: " + data);
        }
      );
      */

    });

  }
  //else if there is no text but an image
  else if (playlist[0].multimedia.text == "" && playlist[0].multimedia.image != "") {
    name = true;

    //extract url from the image
    var image_url = playlist[0].multimedia.image[0].url;

    var image_options={
      source: image_url
    }

    var post_id;
    client.photo('alexf388.tumblr.com', image_options, function(err, data) {
      console.log("no text but image to Tumblr");

      console.log("data: ", data);
      console.log("err: ", err);

      if (data){
        post_id = data; //in json format

        //get id from { id : <some number> }
        post_id = post_id.id;

        var new_image_options = {
          'scObjectId' : scObjectId,
          'postId' : post_id
        };

        callback(null, new_image_options);
      }
      else if (err){
        callback(new HttpCodeError(501, 'deliver not implemented, unable to send image to Tumblr'));
      }

    });


  }
  //else if there is both text and image
  else if (playlist[0].multimedia.text != "" && playlist[0].multimedia.image != "") {
    name = true;

    //extract content from the text
    var image_name = playlist[0].multimedia.text[0].property.content;
    //extract url from the image
    var image_url = playlist[0].multimedia.image[0].url;

    var image_options={
      caption: image_name,
      link: image_url,
      source: image_url
    }
    var post_id;
    client.photo('alexf388.tumblr.com', image_options, function(err, data) {
      console.log("both text and image!");

      console.log("data: ", data);
      console.log("err: ", err);

      if (data) {
      post_id = data; //in json format

      //get id from { id : <some number> }
      post_id = post_id.id;

      var new_image_options = {
        'scObjectId' : scObjectId,
        'postId' : post_id
      };

      callback(null, new_image_options);

      }
      else if (err){
        callback(new HttpCodeError(501, 'deliver not implemented, unable to send text and image to Tumblr'));
      }
    });


  }



  /*
  //IMAGE POST

  //checks if there is image
  if(playlist[0].multimedia.image == "" ){
    console.log("image is empty" );
    name = false;
    //do nothing, move onto the next one
  }
  else {
    name = true;
    //extract url and property.name from image json
    var image_url = playlist[0].multimedia.image[0].url;
    var image_name = playlist[0].multimedia.image[0].property.name;
    console.log(image_url);
    console.log(image_name);

    var image_options={
      caption: image_name,
      link: image_url,
      source: image_url
    }

    var post_id;
    client.photo('alexf388.tumblr.com', image_options, function(err, data) {
      console.log("data from client.photo: ", data);
      post_id = data; //in json format
      console.log("(1) the post_id for image is: " , post_id);

      //get id from { id : <some number> }
      post_id = post_id.id;

      var new_image_options = {
        'scObjectId' : scObjectId,
        'postId' : post_id
      };


      callback(null, new_image_options);


    });


  }
  */


  //VIDEO CODE, not needed for this implementation apparently
  /*
  //checks if there is video
  if (playlist[0].multimedia.video == ""){
    console.log("video is empty");
    name = false;
    //do nothing, move onto the next one
  }
  else{
    name = true;

    //fill in here
    //ASSUMPTION: video json and image json formats are the same
    var video_url = playlist[0].multimedia.video[0].url;
    var video_name = playlist[0].multimedia.video[0].property.name;
    console.log(video_url);
    console.log(video_name);

    var video_options={
      caption: video_name,
      embed: video_url
    }

    client.video('alexf388.tumblr.com', video_options, function(err, data) {
      console.log("video has been posted!");
    });


    callback(null);

  }
  */

  //NOTE: is name even needed in this situation?
  if (name == true){
    logger.info(buildLogMsg("accept", "msg: supported by this channel handler"));
    //NOTE: do we need a callback function here?

  }
  else{
    logger.info(buildLogMsg("deliver", "msg: not supported by this channel handler"));
    //callback(new HttpCodeError(501, 'deliver not implemented'));
  }




};

/**
 * Get feedback (e.g. replies, comments) from previously delivered content.
 * Result should be an array of objects which use the format provided by
 * translateFeedback().
 *
 * @param {Object} params content parameters
 * @param {Function} callback invoked as callback([error], [result]) when finished
 */
AbstractChannelHandler.prototype.getFeedback = function (params, callback) {
  //Tumblr Client
  //create new client for tumblr with consumer_key, consumer_secret, token, token_secret
  var client = tumblr.createClient({
    consumer_key: 'G5DTquGeU2TaVZa2m91DGadxaIh3Yv7sxhT2D4QbW4lmys9Wck',
    consumer_secret: '7hxOb0QDwJ65BbK2RWyvi9QbxOoxJ2T1UZYUzNGBsSjgtwRMLr',
    token: '0UT2vXL9kN66aPBcHpZWXQyNz9gnjrnVVpQrVR7ANaMARofXVl',
    token_secret: 's5J9fFYiEefBCqKn1ldOwHLiIAn2wAlo1tJJ5VK9zqXWCx0yR0'
  });

  logger.info(buildLogMsg("getFeedback", "msg: not supported by this channel handler"));
  callback(new HttpCodeError(501, 'getFeedback not implemented'));
};

/**
 * Remove previously delivered content from the channel instance.
 *
 * The SC instance objects passed in will match those which were provided in the
 * response to the deliver() call.
 *
 * @param {Object[]} scInstances SC instances to be deleted
 * @param {Function} callback invoked as callback([error]) when finished
 */
AbstractChannelHandler.prototype.remove = function (scInstances, callback) {
  //Tumblr Client
  //create new client for tumblr with consumer_key, consumer_secret, token, token_secret
  var client = tumblr.createClient({
    consumer_key: 'G5DTquGeU2TaVZa2m91DGadxaIh3Yv7sxhT2D4QbW4lmys9Wck',
    consumer_secret: '7hxOb0QDwJ65BbK2RWyvi9QbxOoxJ2T1UZYUzNGBsSjgtwRMLr',
    token: '0UT2vXL9kN66aPBcHpZWXQyNz9gnjrnVVpQrVR7ANaMARofXVl',
    token_secret: 's5J9fFYiEefBCqKn1ldOwHLiIAn2wAlo1tJJ5VK9zqXWCx0yR0'
  });


  var name = false;
  logger.info(buildLogMsg("remove", "msg: not supported by this channel handler"));
  console.log("scInstances: " +  scInstances);
  console.log("callback: " + callback);




  //callback(new HttpCodeError(501, 'remove not implemented'));
};


module.exports = AbstractChannelHandler;
