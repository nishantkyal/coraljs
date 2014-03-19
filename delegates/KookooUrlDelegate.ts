import url                                      = require('url');

class KookooUrlDelegate
{
    static BASE_URL:string = '';
    static INFOLLION_URL:string = 'http://www.infollion.com:2021';

    static kookooCallback():string { return this.get('/rest/kookoo/calling'); }

    private static get(urlPattern:string, values?:Object):string {
        if (values)
            for (var key in values)
                if (values[key] != null)
                    urlPattern = urlPattern.replace(new RegExp(':' + key), values[key])
        return url.resolve(KookooUrlDelegate.BASE_URL, urlPattern);
    }
}
export = KookooUrlDelegate