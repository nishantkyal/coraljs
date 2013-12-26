import express              = require('express');
import ApiUrlDelegate       = require('../delegates/ApiUrlDelegate');
import AccessControl        = require('../middleware/AccessControl');
import ValidateRequest      = require('../middleware/ValidateRequest');

/**
 * API calls for managing phone calls
 */
class PhoneCallApi {

    constructor(app)
    {
        /**
         * Create call
         * Allow via searchntalk.com only
         **/
        app.put(ApiUrlDelegate.phoneCall(), AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /**
         * Update call
         */
        app.post(ApiUrlDelegate.phoneCallById(), AccessControl.allowDashboard, function(req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /**
         * Reschedule call
         * Allow user or expert
         **/
        app.post(ApiUrlDelegate.phoneCallReschedule(), AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /**
         * Cancel call
         * Allow user or expert
         **/
        app.post(ApiUrlDelegate.phoneCallCancel(), AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

        /**
         * Get call details
         * Allow user or expert
         */
        app.get(ApiUrlDelegate.phoneCallById(), AccessControl.allowDashboard, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {
            // TODO: Allow search by caller, callee, incoming/outgoing, date range
        });

        /**
         * Get all calls
         * Allow searchntalk.com
         */
        app.get(ApiUrlDelegate.phoneCall(), ValidateRequest.requireFilters, function (req:express.ExpressServerRequest, res:express.ExpressServerResponse)
        {

        });

    }
}
export = PhoneCallApi