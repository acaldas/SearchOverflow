/*
 * Serve content over a socket
 */


var solrClient = null;

exports.socket = function socket(socket) {
    socket.on('solr:ask', function () {
        if (solrClient) {
            socket.emit('solr:ready');
        }
    });

    socket.on('solr:query', function (query) {
        var promise = solrClient.querySolr(query);

        promise.then(function (result) {
            socket.emit('solr:queryResult', result);
        });
    });
};

exports.solrReady = function (solr) {
    solrClient = solr;
    if (solrClient)
        socket.emit('solr:ready');
}


