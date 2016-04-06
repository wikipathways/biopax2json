var fs = require('fs')
  , pg = require('pg')
  , Firebase = require('firebase')
  , FirebaseLogin = require('firebase-login')
  ;

module.exports = {
  // implement JSON stringify serialization
  // see http://stackoverflow.com/questions/4253367/how-to-escape-a-json-string-containing-newline-characters-using-javascript
  escape: function(key, val) {
      if (typeof(val) !== 'string') {
        return val;
      }
      return val      
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\']/g, '\\\'')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
        //.replace(/('[a-zA-Z0-9\s]+\s*)'(\s*[a-zA-Z0-9\s]+')/g,"$1\\\'$2")
  },

  toPostgres: function (wikipathwaysId, pvjson, globalContext, callback) {
    var pvjsonString = JSON.stringify(pvjson);
    var config = JSON.parse(fs.readFileSync('config.json'));
    var postgresConfig = config.postgres;

    // get a pg client from the connection pool
    pg.connect(postgresConfig.conString, function(err, client, done) {

      var handleError = function(err) {
        // no error occurred, continue with the request
        if(!err) {
          return false;
        }

        // An error occurred, remove the client from the connection pool.
        // A truthy value passed to done will remove the connection from the pool
        // instead of simply returning it to be reused.
        // In this case, if we have successfully received a client (truthy)
        // then it will be removed from the pool.
        done(client);
        return true;
      };

      // this is just sample code. I need to update it to reflect our current task
      client.query('INSERT INTO visit (date) VALUES ($1)', [new Date()], function(err, result) {

        // handle an error from the query
        if (handleError(err)) {
          return callback(err);
        }

        // get the total number of visits today (including the current visit)
        client.query('SELECT COUNT(date) AS count FROM visit', function(err, result) {

          // handle an error from the query
          if (handleError(err)) {
            return callback(err);
          }

          // return the client to the connection pool for other requests to reuse
          done();
        });
      });
    });
  },

  toFile: function (wikipathwaysId, pvjson, globalContext, callback) {
    var pvjsonString = JSON.stringify(pvjson, null, 2);
    //var config = JSON.parse(fs.readFileSync('config.json'));
    //var fileConfig = config.file;

    //fs.writeFile(fileConfig.output + wikipathwaysId + '.json', pvjsonString, function(err) {
    fs.writeFile('./data-output/' + wikipathwaysId + '.json', pvjsonString, function(err) {
      if (err) {
        return callback(err);
      }
      return callback(null);
    }); 
  },

  toFirebase: function (wikipathwaysId, pvjson, callback) {
    var pathways = new Firebase('https://wikipathways.firebaseio.com/pathways/');
    //pathways.child('@context').set(globalContext);
    pathways.child(wikipathwaysId).set(pvjson);
    return callback(null, 'success');
    /*
    var config = JSON.parse(fs.readFileSync('config.json'));
    console.log('credentials');
    console.log(config.firebase.credentials);
    console.log(config.firebase.credentials.email);
    console.log(config.firebase.credentials.password);



    FirebaseLogin(ref, config.firebase.credentials, 
      function (err, data) {
        if (err) return callback(err);
        ref.child('@context').set(globalContext);
        ref.child(wikipathwaysId).set(pvjson);
        return callback(null);
      });
      //*/
  }
};
