interface IDaoFetchOptions
{
    max?:number;
    offset?:number;
    getDeleted?:boolean;
    fields?:string[];
    sort?:Object[];
}
export = IDaoFetchOptions