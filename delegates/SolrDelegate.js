"use strict";
///<reference path='../_references.d.ts'/>
const solr_client = require("solr-client");
const http = require("http");
class SolrDelegate {
    createConnection(host, port, path, core) {
        return solr_client.createClient(host, port, core, path, http.globalAgent);
    }
}
module.exports = SolrDelegate;
//# sourceMappingURL=SolrDelegate.js.map