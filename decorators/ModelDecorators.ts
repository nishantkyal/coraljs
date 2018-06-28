import "reflect-metadata"

class ModelDecorators
{
    static tableName(tableName:string) {
        return (target:any) => {
            target.__proto__.TABLE_NAME = tableName;
        }
    }

    static columnName(colName:string) {
        return Reflect.metadata("columnName", colName);
    }

    static getColumnName(target: any, propertyKey: string) {
        return Reflect.getMetadata("columnName", target, propertyKey);
    }
}
export = ModelDecorators;