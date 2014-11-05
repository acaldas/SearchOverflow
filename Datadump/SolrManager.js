var Q = require("q");
var solr = require('solr-client');
var exec = require('child_process').exec;
var _ = require('underscore');
var sorlPath = function(){
    var user = 0;
    switch (user){
        case 0:
            return 'D:\\Transferências\\solr-4.10.1\\solr-4.10.1\\example';
        case 1:
            return '/home/vitor/solr/example';
    }

}
var solrCommand = 'java -jar start.jar';
var solrIp = '127.0.0.1';
var solrPort = 8983;
var solrCore = 'posts';

var fs = require('fs');
//var bigXml = require('big-xml');

var startSolr = false

var solrClient = null;
var solrProcess = null;
var startSolrPromise = null;

exports.startSolr = function() {
    var deferred = Q.defer();


    if (!startSolr)
        if (solrClient)
            deferred.resolve();
        else
            createSolrClient().then(function() {
                deferred.resolve();
            });
    else {
        if (startSolrPromise) {
            return startSolrPromise;
        } else if (solrProcess) {
            console.log("Solr already running");
            deferred.resolve();
        } else {
            processStarted = true;
            try {
                createSolrClient().then(function() {
                    solrClient.ping(function(err, obj) {
                        if (!err) {
                            console.log("Solr server already online");
                            solrProcess = {
                                status: "no access to solr process"
                            };
                            deferred.resolve();
                        } else {
                            console.log("Starting solr");
                            solrProcess = exec(solrCommand, {
                                cwd: sorlPath,
                                maxBuffer: 1024 * 500
                            }, function(error, stdout, stderr) {
                                if (error)
                                    throw error;
                            });

                            var first = true;
                            solrProcess.stdout.on('data', function(data) {
                                if (first) {
                                    first = false;
                                    createSolrClient().then(function() {
                                        pingUntilSuccess(deferred);
                                    });
                                }
                            });

                            solrProcess.on('error', function(code) {
                                throw 'Solr error: ' + code;
                            });

                            solrProcess.on('exit', function(code) {
                                console.log('Solr process exited with code ' + code);
                            });

                        }
                    });
                });

            } catch (err) {
                console.log("Error starting Solr: " + err);
                deferred.reject(err);
            }
        }
    }
    startSolrPromise = deferred.promise;
    return startSolrPromise;
};

function pingUntilSuccess(deferred) {
    solrClient.ping(function(err, obj) {
        if (err) {
            console.log("Solr ping refused");
            setTimeout(function() {
                pingUntilSuccess(deferred)
            }, 1000);
        } else {
            console.log("Solr ping accepted");
            deferred.resolve();
        }
    });
}

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
            deferred.reject();
        }
    }


    return deferred.promise;
}

exports.querySolr = function(query) {
    var deferred = Q.defer();

    var query2 = solrClient.createQuery()
        .set(encodeURI('q=Title:' + query + ' OR Body:' + query))
        .start(0)
        .rows(10);

    solrClient.search(query2, function(err, obj) {
        if (err) {
            deferred.reject();
            console.log(err);
        } else {
            deferred.resolve(obj);
            console.log(obj);
        }
    });

    return deferred.promise;
}



/*
exports.uploadFile = function(filePath, format, contentType) {
    var deferred = Q.defer();

    function transformRow(row) {
        var item = {};

        _.each(row.attrs, function(value, key) {

            if (key === 'Id')
                key = 'id'
            else if (key === 'Date')
                value += 'Z';

            item[key] = value;
        });
        return item;
    }
    try {
        setTimeout(function() {
            createSolrClient().then(function() {
                var fileStream = createFileStream(filePath);

                var solrStream = solrClient.createAddStream()
                    .on('error', function(error) {
                        console.log("Error: " + error);
                    })
                    .on('end', function() {
                        console.log('File imported.');
                    });

                fileStream.on('record', function(record) {
                    solrStream.write(transformRow(record));
                })
            })
        }, 3000);
    } catch (exception) {
        console.log("Exception: " + exception);
    }

    // format = format || 'xml';
    // contentType = contentType || 'application/xml;charset=utf-8';

    // var options = {
    //     path: filePath,
    //     format: format,
    //     contentType: contentType,
    //     parameters: {

    //     }
    // }

    // if (format === 'xslt')
    //     options.parameters.tr = 'transformStackoverflow.xsl'
    // try {
    //     setTimeout(function() {
    //         createSolrClient().then(function() {
    //             var request = solrClient.addRemoteResource(options, function(err, obj) {
    //                 if (err) {
    //                     console.log('Error uploading file: ' + err);
    //                     deferred.reject(err);
    //                 } else {
    //                     console.log(obj);
    //                     deferred.resolve();
    //                 }
    //             });

    //         }, function(error) {
    //             console.log("Error: " + error);
    //             deferred.reject(error);
    //         });
    //     }, 3000);
    // } catch (error) {
    //     console.log("Upload error: " + error);
    // }

    return deferred.promise;
};


function createFileStream(xmlPath, callback, promise) {

    try {
        var reader = bigXml.createReader(xmlPath, /^(Badges|row)$/, {});
        var counter = 0;
        var a = new Date();
        reader.on('record', function(record) {
            counter++;

            if (counter % 10000 === 0) {
                var b = new Date();
                console.log(counter + ': ' + (b - a) / 1000 + ' seconds');
                a = b;
            }

        });

        reader.on('error', function(record) {
            console.log('error: ' + record);
        });

        reader.on('end', function() {
            console.log('end');
        });

    } catch (error) {
        console.log("Exception: " + error);
        throw error;
    }

    return reader;

}
*/
