import BaseDAO              = require('./BaseDAO');

class SmsDao extends BaseDAO
{

    static getTableName():string
    {
        return 'sms';
    }

}
export = SmsDao