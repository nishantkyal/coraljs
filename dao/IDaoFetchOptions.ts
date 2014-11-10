interface IDaoFetchOptions
{
    max?:number;
    offset?:number;
    fields?:string[];
    sort?:Object[];
}
export = IDaoFetchOptions