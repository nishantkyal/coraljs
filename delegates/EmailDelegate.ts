import _                            = require('underscore');
import q                            = require('q');
import Email                        = require('../models/Email')
import IDao                         = require('../dao/IDao');
import EmailDao                     = require('../dao/EmailDao');
import CallStatus                   = require('../enums/CallStatus');
import UserDelegate                 = require('../delegates/UserDelegate');
import IntegrationMemberDelegate    = require('../delegates/IntegrationMemberDelegate');

/**
 Delegate class for managing email
 1. Queue new email
 2. Check status of emails
 3. Search emails
 */
class EmailDelegate
{
    getDao():IDao { return new EmailDao(); }

    send():q.makePromise
    {
        return null;
    }

    sendCallStatusUpdateNotifications(callerUserId:number, expertId:number, status:CallStatus):q.makePromise
    {
        var that = this;

        // 1. Get expert's user id
        // 2. Get emails for caller and expert
        // 3. Send emails
        return new IntegrationMemberDelegate().get(expertId, ['user_id'])
            .then(
            function expertUserIdFetched(expert)
            {
                return new UserDelegate().search({'id': [expert['user_id'], callerUserId]}, ['email']);
            })
            .then(
            function emailsFetched(users)
            {
                var expertEmail, callerEmail;
                _.each(users, function(user) {
                    if (user.id == callerUserId)
                        callerEmail = user['email'];
                    else
                        expertEmail = user['email'];
                });

                switch(status)
                {
                    // TODO: Implement all call status emails
                    case CallStatus.POSTPONED:
                        return q.all([
                            that.send(),
                            that.send()
                        ]);
                        break;
                }

                return null;
            });
    }

}
export = EmailDelegate