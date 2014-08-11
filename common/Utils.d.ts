/// <reference path="../_references.d.ts" />
declare class Utils {
    static getRandomString(length: number, characters?: string): string;
    static getRandomInt(min: any, max: any): any;
    static isNullOrEmpty(val: any): boolean;
    static getClassName(object: Object): string;
    static copyProperties(source: any, target: any): void;
    static camelToSnakeCase(camelCasedString: string): string;
    static snakeToCamelCase(snakeCasedString: string): string;
    static snakeCaseToNormalText(snakeCasedString: string): string;
    static enumToNormalText(enumObject: Object): {};
    static getObjectType(obj: any): string;
    static createSimpleObject(...args: any[]): Object;
    static repeatChar(char: string, times: number, delimiter?: string): string;
    static escapeHTML(s: string): string;
    static unescapeHTML(s: string): string;
    static addQueryToUrl(baseUrl: string, query: Object): string;
    static escapeObject(Obj: Object): Object;
    static escapeObject(Obj: Object[]): Object[];
    static unEscapeObject(obj: Object): Object;
    static unEscapeObject(obj: Object[]): Object[];
    static setLongerTimeout(func: Function, interval: number, ...args: any[]): number;
    static generateUrl(urlPattern: string, values?: Object, baseUrl?: string): string;
}
export = Utils;
