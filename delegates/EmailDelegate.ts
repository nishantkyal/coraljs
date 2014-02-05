///<reference path='../_references.d.ts'/>
///<reference path='../models/Email.ts'/>
///<reference path='../dao/IDao.ts'/>
///<reference path='../dao/EmailDao.ts'/>
///<reference path='../enums/CallStatus.ts'/>
///<reference path='./UserDelegate.ts'/>
///<reference path='./IntegrationMemberDelegate.ts'/>

/**
 Delegate class for managing email
 1. Queue new email
 2. Check status of emails
 3. Search emails
 */
module delegates
{
    export class EmailDelegate
    {
        getDao():dao.IDao { return new dao.EmailDao(); }

        send():Q.Promise<any>
        {
            return null;
        }

        sendCallStatusUpdateNotifications(callerUserId:number, expertId:number, status:enums.CallStatus):Q.Promise<any>
        {
            var that = this;

            // 1. Get expert's user id
            // 2. Get emails for caller and expert
            // 3. Send emails
            return new delegates.IntegrationMemberDelegate().get(expertId, ['user_id'])
                .then(
                function expertUserIdFetched(expert)
                {
                    return new delegates.UserDelegate().search({'id': [expert['user_id'], callerUserId]}, ['email']);
                })
                .then(
                function emailsFetched(users:Array<models.User>):any
                {
                    var expertEmail, callerEmail;
                    _.each(users, function(user:models.User) {
                        if (user.getId() == callerUserId)
                            callerEmail = user['email'];
                        else
                            expertEmail = user['email'];
                    });

                    switch(status)
                    {
                        // TODO: Implement all call status emails
                        case enums.CallStatus.POSTPONED:
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
}