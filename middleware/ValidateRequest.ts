///<reference path='../_references.d.ts'/>
///<reference path='../delegates/LocalizationDelegate'/>
///<reference path='../models/BaseModel'/>
///<reference path='../models/User'/>
///<reference path='../models/UserOauth'/>
///<reference path='../models/Integration'/>
///<reference path='../models/IntegrationMember'/>
///<reference path='../models/PhoneNumber'/>
///<reference path='../models/PhoneCall'/>
///<reference path='../models/SMS'/>
///<reference path='../api/ApiConstants.ts'/>

module middleware
{
    export class ValidateRequest
    {
        static requireFilters(req, res, next)
        {
            var filters = req.body[api.ApiConstants.FILTERS];
            if (!filters || _.keys(filters).length == 0)
                res.status(422).json('Fetching all values not allowed. Please specify filters');
            else
                next();
        }

        static requireFields(req, res, next)
        {
            var fields = req.params[api.ApiConstants.FILTERS];
            if (!fields || fields.length == 0)
                res.status(422).json('Fetching all values not allowed. Please specify filters');
            else
                next();
        }

        static requirePagination(req, res, next)
        {
            req.params['page'] = req.params['page'] || 0;
            req.params['page_size'] = req.params['page_size'] || 20;
            next();
        }

        /* Middleware to parse body attributes into models and check if they're valid */
        static parseBody(req, res, next)
        {
            _.each(_.keys(req.body), function (key)
            {
                var modelClass:typeof models.BaseModel = null;
                switch (key)
                {
                    case api.ApiConstants.USER:
                        modelClass = models.User;
                        break;
                    case api.ApiConstants.OAUTH:
                        modelClass = models.UserOauth;
                        break;
                    case api.ApiConstants.INTEGRATION:
                        modelClass = models.Integration;
                        break;
                    case api.ApiConstants.INTEGRATION_MEMBER:
                        modelClass = models.IntegrationMember;
                        break;
                    case api.ApiConstants.PHONE_NUMBER:
                        modelClass = models.PhoneNumber;
                        break;
                    case api.ApiConstants.SMS:
                        modelClass = models.SMS;
                        break;
                    case api.ApiConstants.PHONE_CALL:
                        modelClass = models.PhoneCall;
                        break;
                }

                if (modelClass)
                    req.body[key] = new modelClass(req.body[key]);
            });
            next();
        }

    }
}