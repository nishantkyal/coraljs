import express                                              = require('express');
import ApiUrlDelegate                                       = require('../delegates/ApiUrlDelegate');
import TimeZoneDelegate                                     = require('../delegates/TimeZoneDelegate');
import ApiConstants                                         = require('../enums/ApiConstants');

class TimeZoneApi
{
    constructor(app, secureApp)
    {
        var timeZoneDelegate = new TimeZoneDelegate();

        app.get(ApiUrlDelegate.timeZoneByOffset(), function (req:express.Request, res:express.Response)
        {
            var offset = parseInt(req.query[ApiConstants.OFFSET])*-60;

            timeZoneDelegate.getClosestTimeZone(offset)
            .then(
            function timeZoneFetched(timeZone){
                res.status(200).json(timeZone);
            }),
            function timeZoneFetchError(error){
                res.send(500);
            }
        });
    }
}
export = TimeZoneApi