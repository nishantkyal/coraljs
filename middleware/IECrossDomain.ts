///<reference path='../_references.d.ts'/>
import express = require('express');

/**
 * Middleware to handle IE cross domain goofiness
**/
module middleware
{
    export class IECrossDomain
    {
        static fixRequestForIe(req:express.ExpressServerRequest, res:express.ExpressServerResponse, next:Function)
        {
            // Append access control header to all responses for cross domain communication
            res.header('Access-Control-Allow-Origin', '*');
            if (req.headers.hasOwnProperty('Access-Control-Request-Method') && req.method == 'OPTIONS')
            {
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
                res.header('Access-Control-Allow-Headers', 'X-Requested-With,Origin,Content-Type, Accept');
            }

            // Default content-type to application/json since XDR doesn't support this header
            if (!req.headers.hasOwnProperty('Content-Type'))
                req.headers['Content-Type'] = 'application/json';

            // Override method if _method parameter specified since XDR doesn't support any HTTP methods except GET and POST
            if (req.param('_method') != null)
                req.method = req.param('_method');

            next();
        }
    }
}