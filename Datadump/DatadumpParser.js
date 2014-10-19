var datadumpPath = 'D:\\Transferências\\stackexchange\\datadump';
var fs = require("fs");
var Q = require("q");
var solrManager = require('./SolrManager');



function getDatadumpFiles() {
    var deferred = Q.defer();
    fs.readdir(datadumpPath, function(err, files) { //get files in datadump directory
        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {
            // files = files.filter(function(file) { //only get files from stackoverflow
            //     return (file.substr(0, filePrefix.length) === filePrefix);
            // });
            deferred.resolve(files);
        };
    });
    return deferred.promise;
}

function uploadFile(fileName) {
    console.log("Uploading " + fileName);
    return solrManager.uploadFile(datadumpPath + '\\' + fileName);
}



function main() {

    solrManager.startSolr().then(function(){
        console.log("Solr started");
        getDatadumpFiles().then(function(files) {
        var filesToUpload = [];
        files.forEach(function(file) {
            filesToUpload.push(uploadFile(file).then(function(){
                console.log(file + ' uploaded.');
            }));
        });

        Q.allSettled(filesToUpload)
            .then(function(results) {
                console.log("Files uploaded.");
            });
    });
    })


}

main();
