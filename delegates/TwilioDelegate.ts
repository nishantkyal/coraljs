import q                = require('q');
import Config           = require('../Config');
var twilio              = require('twilio')(Config.get('twilio.account_sid'), Config.get('twilio.auth_token'));

class TwilioDelegate
{
    sendSMS(to:string, from:string, body:string):q.makePromise
    {
        var deferred = q.defer();
        twilio.sendMessage({ to: to, from: '+17068727043', body: body }, function(err, responseData)
        {
            if (!err)
                deferred.resolve(responseData);
            else
                deferred.reject(err);
        });
        return deferred.promise;
    }
}
export = TwilioDelegate