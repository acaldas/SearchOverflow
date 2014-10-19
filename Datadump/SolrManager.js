var Q = require("q");
var solr = require('solr-client');
var exec = require('child_process').exec;

var sorlPath = 'D:\\Transferências\\solr-4.10.1\\solr-4.10.1\\example';
var solrCommand = 'java -jar start.jar';
var solrIp = '127.0.0.1';
var solrPort = 8983;
var solrCore = 'collection1';

var solrClient = null;
var solrProcess = null;

exports.startSolr = function() {
    var deferred = Q.defer();

    if (solrProcess) {
        console.log("Solr already running");
        deferred.resolve(solrProcess);
    } else {
        try {
            console.log("Starting solr");
            solrProcess = exec(solrCommand, {
                cwd: sorlPath
            }, function(error, stdout, stderr) {
                if (error)
                    throw error;
            });

            solrProcess.stdout.on('data', function(data) {
                setTimeout(function(){deferred.resolve()},
                    3000);
                //give time for Solr to initiate, better way?
            });

            solrProcess.on('error', function(code) {
                throw 'Solr error: ' + code;
            });

            solrProcess.on('exit', function(code) {
                console.log('Solr process exited with code ' + code);
            });

        } catch (err) {
            console.log("Error starting Solr: " + err);
            deferred.reject(err);
        }
    }

    return deferred.promise;
};

exports.uploadFile = function(filePath, format, contentType) {
    var deferred = Q.defer();

    format = format || 'xml';
    contentType = contentType || 'application/xml;charset=utf-8';

    var options = {
        path: filePath,
        format: format,
        contentType: contentType
    }

    setTimeout(function(){
        createSolrClient().then(function() {
        var request = solrClient.addRemoteResource(options, function(err, obj) {
            if (err) {
                console.log('Error uploading file: ' + err);
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
    }, function(error) {
        console.log("Error: " + error);
        deferred.reject(error);
    });
    }, 3000);


    return deferred.promise;
};

function createSolrClient() {
    var deferred = Q.defer();

    if (solrClient)
        deferred.resolve(solrClient);
    else {
        try {
            solrClient = solr.createClient(solrIp, solrPort, solrCore);
            solrClient.autoCommit = true;
            deferred.resolve(solrClient);

        } catch (error) {
            console.log("Error: " + error);
        }
    }


    return deferred.promise;
}
