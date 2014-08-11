/// <reference path="../_references.d.ts" />
declare class LocalizationDelegate {
    private static ctor;
    static get(key: string, locale?: string): string;
    static setLocale(locale: string): void;
}
export = LocalizationDelegate;
