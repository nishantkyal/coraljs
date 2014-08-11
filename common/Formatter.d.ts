/// <reference path="../_references.d.ts" />
import MoneyUnit = require('../enums/MoneyUnit');
import Salutation = require('../enums/Salutation');
declare class Formatter {
    static formatMoney(val: number, moneyUnit: MoneyUnit): string;
    static formatName(firstName: string, lastName?: string, title?: Salutation): string;
    static formatDate(m: Date): string;
    static formatDate(m: string): string;
    static formatDate(m: number): string;
    static getNameInitials(firstName?: string, lastName?: string): string;
    static formatEmail(email: string, firstName?: string, lastName?: string, title?: Salutation): string;
    static formatTimezone(offset: any): string;
}
export = Formatter;
