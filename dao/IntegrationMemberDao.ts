///<reference path='./BaseDAO.ts'/>
///<reference path='../models/BaseModel.ts'/>
///<reference path='../models/IntegrationMember.ts'/>

module dao
{
    export class IntegrationMemberDao extends BaseDAO
    {
        getModel():typeof models.BaseModel { return models.IntegrationMember; }
    }
}