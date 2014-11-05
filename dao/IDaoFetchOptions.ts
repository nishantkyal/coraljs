interface IDaoFetchOptions
{
    max?:number;
    offset?:number;
    fields?:string[];
    sort:string[];
}
export = IDaoFetchOptions