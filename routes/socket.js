/*
 * Serve content over a socket
 */


var isSolrReady = false;

exports.socket = function socket(socket) {
    socket.on('solr:ask', function() {
        if (isSolrReady) {
            socket.emit('solr:ready');
        }
    });
};

exports.solrReady= function() {
    isSolrReady = true;
    socket.emit('solr:ready');
}
