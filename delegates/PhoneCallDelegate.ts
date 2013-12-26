import _                        = require('underscore');
import q                        = require('q');
import Utils                    = require('../Utils');
import IDao                     = require('../dao/IDao');
import PhoneCallDao             = require('../dao/PhoneCallDao');
import BaseDAODelegate          = require('./BaseDaoDelegate');

class PhoneCallDelegate extends BaseDAODelegate
{
    callsByUser(user_id:string, filters:Object, fields?:string[]):q.makePromise
    {
        filters['user_id'] = user_id;
        return (_.keys(filters).length == 1) ? Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, {'fields': fields});
    }

    callsToExpert(expert_id:string, filters:Object, fields?:string[]):q.makePromise
    {
        filters['expert_id'] = expert_id;
        return (_.keys(filters).length == 1) ? Utils.getRejectedPromise('Invalid filters') : this.getDao().search(filters, {'fields': fields});
    }

    getDao():IDao { return new PhoneCallDao(); }

}
export = PhoneCallDelegate