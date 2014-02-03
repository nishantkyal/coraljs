///<reference path='../_references.d.ts'/>
///<reference path='./ApiConstants.ts'/>;
///<reference path='../middleware/AccessControl.ts'/>;
///<reference path='../delegates/ApiUrlDelegate.ts'/>;
///<reference path='../delegates/PhoneNumberDelegate.ts'/>;
///<reference path='../models/PhoneNumber.ts'/>;

/**
 * API calls for managing settings to IntegrationMembers who are experts
 * e.g. Call schedules, viewing reports, manage payment details
 */
module api
{
    export class PhoneNumberApi
    {
        constructor(app)
        {
            var phoneNumberDelegate = new delegates.PhoneNumberDelegate();

            /* Add phone number */
            app.put(delegates.ApiUrlDelegate.phoneNumber(), middleware.AccessControl.allowDashboard, function (req, res)
            {
                var phoneNumber:models.PhoneNumber = req.body[ApiConstants.PHONE_NUMBER];

                if (phoneNumber.isValid())
                    phoneNumberDelegate.create(phoneNumber)
                        .then(
                        function handlePhoneNumberCreated(result) { res.json(result); },
                        function handlePhoneNumberCreateFailed(err) { res.json(500).json(err); }
                    )
                else
                    res.status(500).json('Invalid input');
            });

            /* Search phone number */
            app.get(delegates.ApiUrlDelegate.phoneNumber(), function (req, res)
            {
                phoneNumberDelegate.search(req.body[ApiConstants.PHONE_NUMBER])
                    .then(
                    function handlePhoneNumberSearched(result) { res.json(result); },
                    function handlePhoneNumberSearchFailed(err) { res.json(500).json(err); }
                )
            });

            /* Get phone number by id */
            app.get(delegates.ApiUrlDelegate.phoneNumberById(), function (req, res)
            {
                var phoneNumberId = req.params[ApiConstants.PHONE_NUMBER_ID];

                phoneNumberDelegate.get(phoneNumberId)
                    .then(
                    function handlePhoneNumberSearched(result) { res.json(result); },
                    function handlePhoneNumberSearchFailed(err) { res.json(500).json(err); }
                )
            });

            /* Update phone number */
            app.post(delegates.ApiUrlDelegate.phoneNumberById(), function (req, res)
            {
                var phoneNumberId:string = req.params[ApiConstants.PHONE_NUMBER_ID];
                var phoneNumber:models.PhoneNumber = req.body[ApiConstants.PHONE_NUMBER];

                phoneNumberDelegate.update(phoneNumberId, phoneNumber)
                    .then(
                    function handlePhoneNumberUpdated(result) { res.json(result); },
                    function handlePhoneNumberUpdateFailed(err) { res.json(500).json(err); }
                )
            });

            /* Delete phone number */
            app.delete(delegates.ApiUrlDelegate.phoneNumberById(), function (req, res)
            {
                var phoneNumberId:string = req.params[ApiConstants.PHONE_NUMBER_ID];

                phoneNumberDelegate.delete(phoneNumberId)
                    .then(
                    function handlePhoneNumberDeleted(result) { res.json(result); },
                    function handlePhoneNumberDeleteFailed(err) { res.json(500).json(err); }
                )
            });
        }

    }
}