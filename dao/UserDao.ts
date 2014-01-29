///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/User.ts'/>

module dao
{
    export class UserDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.User; }
    }
}