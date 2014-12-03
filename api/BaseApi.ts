///<reference path='../_references.d.ts'/>

class BaseApi
{
    constructor(app)
    {
    }

    static getEndpoint(baseUrl?:string):string
    {
        return null;
    }

    static getIdEndpoint(id?:number, baseUrl?:string):string
    {
        return null;
    }
}
export = BaseApi;