///<reference path='../_references.d.ts'/>
import _                            = require('underscore');
import q                            = require('q');
import Email                        = require('../models/Email')
import User                         = require('../models/User')
import IntegrationMember            = require('../models/IntegrationMember')
import IDao                         = require('../dao/IDao');
import EmailDao                     = require('../dao/EmailDao');
import CallStatus                   = require('../enums/CallStatus');
import ApiFlags                     = require('../enums/ApiFlags');
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

    send():q.Promise<any>
    {
        return null;
    }

    sendCallStatusUpdateNotifications(callerUserId:number, expertId:number, status:CallStatus):q.Promise<any>
    {
        var that = this;

        // 1. Get expert's user id
        // 2. Get emails for caller and expert
        // 3. Send emails
        return new IntegrationMemberDelegate().get(expertId, ['user_id'])
            .then(
            function expertUserIdFetched(expert:IntegrationMember)
            {
                return new UserDelegate().search({'id': [expert['user_id'], callerUserId]}, ['email']);
            })
            .then(
            function emailsFetched(users:Array<User>)
            {
                var expertEmail, callerEmail;
                _.each(users, function(user:User) {
                    if (user.getId() == callerUserId)
                        callerEmail = user.getEmail();
                    else
                        expertEmail = user.getEmail();
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