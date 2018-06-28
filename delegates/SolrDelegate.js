"use strict";
var solr_client = require("solr-client");
var http = require("http");
var SolrDelegate = (function () {
    function SolrDelegate() {
    }
    SolrDelegate.prototype.createConnection = function (host, port, path, core) {
        return solr_client.createClient(host, port, core, path, http.globalAgent);
    };
    return SolrDelegate;
}());
module.exports = SolrDelegate;
//# sourceMappingURL=SolrDelegate.js.map