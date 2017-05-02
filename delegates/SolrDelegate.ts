///<reference path='../_references.d.ts'/>
import solr_client                                      = require('solr-client');
import http                                             = require('http');

class SolrDelegate
{
    createConnection(host:string, port:string, path:string, core:string):Solr.SolrClient
    {
        return solr_client.createClient(host, port, core, path, http.globalAgent);
    }
}
export = SolrDelegate