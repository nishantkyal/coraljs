///<reference path='../_references.d.ts'/>
///<reference path='../api/ApiConstants.ts'/>;
///<reference path='../delegates/ApiUrlDelegate.ts'/>;
///<reference path='../delegates/PhoneCallDelegate.ts'/>;
///<reference path='../middleware/AccessControl.ts'/>;
///<reference path='../middleware/ValidateRequest.ts'/>;
///<reference path='../models/PhoneCall.ts'/>;
var json2xml = require('json2xml');

/**
 * API calls for managing phone calls
 */
module api
{
    export class PhoneCallApi
    {
        constructor(app)
        {
            var phoneCallDelegate = new delegates.PhoneCallDelegate();

            app.put(delegates.ApiUrlDelegate.phoneCall(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var phoneCall:models.PhoneCall = req.body[ApiConstants.PHONE_CALL];

                phoneCallDelegate.create(phoneCall)
                    .then(
                    function callCreated(result) { res.send(result); },
                    function callCreateError(error) { res.send(500); }
                )
            });

            app.post(delegates.ApiUrlDelegate.phoneCallById(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var phoneCallId:number = req.params[ApiConstants.PHONE_CALL_ID];
                var phoneCall:models.PhoneCall = req.body[ApiConstants.PHONE_CALL];

                phoneCallDelegate.update({id: phoneCallId}, phoneCall)
                    .then(
                    function callUpdated() { res.send(200); },
                    function callUpdateError(error) { res.status(500); }
                )
            });

            app.post(delegates.ApiUrlDelegate.phoneCallReschedule(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var phoneCallId:number = req.params[ApiConstants.PHONE_CALL_ID];

                // 1. Update call status
                // 2. Send emails to both caller and expert
                // 3. Send SMS to both caller and expert


            });

            app.post(delegates.ApiUrlDelegate.phoneCallCancel(), middleware.AccessControl.allowDashboard, function (req, res)
            {

            });

            app.get(delegates.ApiUrlDelegate.phoneCallById(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var phoneCallId:number = req.params[ApiConstants.PHONE_CALL_ID];

                return phoneCallDelegate.get(phoneCallId)
                    .then(
                    function callFetched(call) { res.json(call); },
                    function callFetchFailed(error) { res.status(400).send('No phone call found for id: ' + phoneCallId); }
                )
            });

            app.get(delegates.ApiUrlDelegate.phoneCall(), middleware.ValidateRequest.requireFilters, middleware.AccessControl.allowDashboard, function (req, res)
            {
                var filters = req.body[ApiConstants.FILTERS];

                phoneCallDelegate.search(filters)
                    .then(
                    function handleCallSearched(response) { res.json(response); },
                    function handleCallSearchFailed(error) { res.status(500).json(error); }
                );
            });


        }
    }
}