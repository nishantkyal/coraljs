///<reference path='./BaseDao.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/IntegrationMember.ts'/>

module dao
{
    export class IntegrationMemberDao extends BaseDao
    {
        getModel():typeof models.BaseModel { return models.IntegrationMember; }
    }
}