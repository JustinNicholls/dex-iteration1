var _ = require('underscore');

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
 return this;
};

KBUtils.prototype.persistSample = function(data, callback) {

    //convert data to insert:  this is specific to the structure for the data
    var query = "INSERT INTO post (scObjectId,postId) VALUES (?,?)";
    var queryParams = [data.scObjectID, data.postId];

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

KBUtils.prototype.executeQuery = function (token,query, queryParams, dataStore, callback) {

   var options = {
        host: "developer.kb.dexit.co",
        port: "80",
        path: "/access/stores/" + dataStore + "/query",
        method: 'POST',
        headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
        }
    };
   //add token to header if present
   if (token) {
        options.headers.Authorization = 'Bearer ' + token;
    }

   //construct the query object
   var queryObject = {};
    queryObject.query = query;
   if (queryParams && queryParams.length > 0) {
        queryObject.parameters = queryParams;
    }

    makeHttpRequest(options, queryObject, function(err, data) {
       if (err){
           return callback(err);
        }
        callback(err,data);
    });

};
module.exports = KBUtils;
