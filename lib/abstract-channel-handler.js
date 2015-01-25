/**
 * Copyright Digital Engagement Xperience 2014
 * Created by Andrew
 *
 */

var HttpCodeError = require('./util/http-code-error');
var logger = require('./util/logger');
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
  //console.log(channel.url);

  var website = channel.url.split(".");
  //console.log(website);

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
  //if name is true, then callback will send 200
  //if name is false, then callback will send 501
  //var name = true;

  //extract delivery-body.json
  //extract info from params
  //extract url from params
  var url = params.channel.url;

  //we need to remove 'https://' from the url
  url = url.replace('https://' ,'');
  console.log("new url: " + url);

  //extract info from playlist
  //console.log(playlist[0].scObj.id);

  //extract scObj.id?
  var scObjectId = playlist[0].scObj.id;

  if (playlist[0].multimedia.text == ""){
    //console.log("text is empty");
    name = false;
  }
  //else extract info from text, then post it to Tumblr
  else{
    //extract name and content from the text content
    var title = playlist[0].multimedia.text[0].property.name;
    //title = "'" + title + "'";
    var message = playlist[0].multimedia.text[0].property.content;
    //message = "'" + message + "'";

    var text_options = {
      'title': title,
      'body': message
    };

    //get tumblr to send the text_options to the appropriate tumblr blog url
    client.text(url, text_options , function (err, data) {
      console.log("HURRAH!!!");
    });

     //name = true;

  }

  //checks if there is image
  if(playlist[0].multimedia.image == "" ){
    //console.log("image is empty" );
  }
  else {
    //fill in here
    //name = true;
  }

  //checks if there is video
  if (playlist[0].multimedia.video == ""){
    //console.log("video is empty");
  }
  else{
    //fill in here
    //name = true;
  }


  if (name == true){
    logger.info(buildLogMsg("accept", "msg: supported by this channel handler"));

    //NOTE: is there another way instead of using HttpCodeError
    //we have to use text_options in this case to replace the 'deliver implemented' line
    callback(text_options);
  }
  else{
    logger.info(buildLogMsg("deliver", "msg: not supported by this channel handler"));
    callback(new HttpCodeError(501, 'deliver not implemented'));
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
  logger.info(buildLogMsg("remove", "msg: not supported by this channel handler"));
  //console.log("scInstances: " +  scInstances);
  //console.log("callback: " + callback);

  callback(new HttpCodeError(501, 'remove not implemented'));
};


module.exports = AbstractChannelHandler;
