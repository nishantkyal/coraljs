///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/User.ts'/>

module dao
{
    export class UserDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.User; }
    }
}