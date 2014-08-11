/// <reference path="../_references.d.ts" />
declare class FileWatcherDelegate {
    constructor(path: string, filters: RegExp[], initHandler?: (files: string[]) => void, createHandler?: (file: string, stat: string) => void, updateHandler?: (file: string, curr: string, prev: string) => void, deleteHandler?: (file: string, stat: string) => void);
}
export = FileWatcherDelegate;
