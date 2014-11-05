/*
 * Serve JSON to our AngularJS client
 */

module.exports = function api(solrClient, socket) {

    solrClient.startSolr().then(function(){

        socket.solrReady();
    });

    this.name = function(req, res) {
        res.json({
            name: 'Bob'
        });
    };
}
