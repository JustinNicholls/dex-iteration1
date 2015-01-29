var _ = require('underscore');

//global variable token
var token = "";

var protocol = require('http');
function KBUtils(config) {

  if (!config || !config.kb) {
    throw new Error("Configuration is required!");
  }

  this.config = config;

  if (config.protocol === 'https') {
    protocol = require('https');
  }else {
    protocol = require('http');
  }
}

KBUtils.prototype.setToken = function(token) {
 this.token = token;
  //console.log("token about to be transferred: ", token);
  //console.log("this.token:", this.token);
 return this;
};

KBUtils.prototype.selectAll = function(callback) {
  var query = "SELECT * FROM Notes";

  this.executeSelectAllQuery(this.token, query, "TumblrDB", callback);
};

KBUtils.prototype.deleteAll = function(callback) {
  var query = "DELETE FROM Notes";

  this.executeDeleteAllQuery(this.token, query, "TumblrDB", callback);

};

KBUtils.prototype.persistSample = function(data, callback) {

  //convert data to insert:  this is specific to the structure for the data
  var query = "INSERT INTO Notes (timestamp, blog_name, type, post_id, added_text) VALUES (?,?,?,?,?)";
  //data.timestamp = "'"+ data.timestamp +"'";
  //data.
  //console.log("data.timestamp: ",  data.timestamp);
  var queryParams = [data.timestamp, data.blog_name, data.type, data.post_id, data.added_text ];

  this.executeQuery(this.token,query, queryParams, "TumblrDB", callback);

};

/**
 * Handle Http Request to KB
 * @param options {json} The request parameters
 * @param body {json} The body of the message
 * @param cb
 */
function makeHttpRequest(options, body, cb) {


  body= JSON.stringify(body);
  options.headers['Content-length'] = Buffer.byteLength(body);


  var req = protocol.request(options, function(response) {
    response.setEncoding('utf8');
    var str ='';
    response.on('data',function(chunk) {
      str += chunk;
    });
    response.on('end', function() {
      var code = response.statusCode;
      if (code === 200 || code === 204) {
        var err;
        var dat;
        try {
          dat = JSON.parse(str);
          err = null;
        }catch(e){
          err = e;
        }
        cb(err,dat);
      }else {
        var errr = new Error('unexpected response code:'+code);
        errr.httpCode = 500;
        cb(errr);
      }
    });
    response.on('error', function(err){
      return cb(err);
    });
  });

  req.on('error', function(e) {
    return console.error(e);
    cb(e);
  });

  req.write(body);
  req.end();

}

KBUtils.prototype.executeSelectAllQuery = function(token, query, dataStore, callback){
  var queryObject = {
    "query": query
  };

  var options = {
    host: "developer.kb.dexit.co",
    port: "80",
    path: "/access/stores/" + dataStore + "/query",
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      //,'Authorization': 'Bearer ' + token
    }
  };

  options.headers.Authorization = 'Bearer ' + token;
  //console.log("options.headers.Authorization: " + options.headers.Authorization);

  makeHttpRequest(options, queryObject, function(err, data) {
    if (err){
      return callback(err);
    }
    console.log("select all data in query: " + data);
    callback(err,data);
  });

};


//exeecute just the delete all query
KBUtils.prototype.executeDeleteAllQuery = function(token, query, dataStore, callback) {
  var queryObject = {
    "query": query
  };
  //console.log("query for deleteall: " + query);
  //console.log("queryObject for deleteall: " + queryObject);

  var options = {
    host: "developer.kb.dexit.co",
    port: "80",
    path: "/access/stores/" + dataStore + "/query",
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      //,'Authorization': 'Bearer ' + token
    }
  };

  options.headers.Authorization = 'Bearer ' + token;
  //console.log("options.headers.Authorization: " + options.headers.Authorization);

  makeHttpRequest(options, queryObject, function(err, data) {
    if (err){
      return callback(err);
    }

    callback(err,data);
  });
};


//execute query...not delete query though
KBUtils.prototype.executeQuery = function (token,query, queryParams, dataStore, callback) {
  var queryObject = {
    "query": query,
    "parameters": queryParams
  };

  //var token = '455f566e-2695-4711-b6f1-c5a81c55253d';

  //console.log("token in query: " + token);

  var options = {
    host: "developer.kb.dexit.co",
    port: "80",
    path: "/access/stores/" + dataStore + "/query",
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
      //,'Authorization': 'Bearer ' + token
    }
  };

  options.headers.Authorization = 'Bearer ' + token;


  //console.log("options.headers.Authorization: " + options.headers.Authorization);

  //construct the query object
  /*
   var queryObject = {};
    queryObject.query = query;
   if (queryParams && queryParams.length > 0) {
        queryObject.parameters = queryParams;
    }
    */
  //var queryObject = {"query": "INSERT INTO Notes (timestamp, blog_name, type, post_id, added_text) VALUES (?,?,?,?,?)", "parameters" : ["1422481076", "takingjustin", "reblog", "109422770023", "the coach"]};

  makeHttpRequest(options, queryObject, function(err, data) {
    if (err){
      return callback(err);
    }
    callback(err,data);
  });

};
module.exports = KBUtils;
