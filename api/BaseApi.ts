///<reference path='../_references.d.ts'/>

class BaseApi
{
    constructor(app)
    {
    }

    getEndPoint(baseUrl?:string):string
    {
        return null;
    }

    getIdEndPoint(id?:number, baseUrl?:string):string
    {
        return null;
    }
}
export = BaseApi;