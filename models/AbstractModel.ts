import _                                        = require('underscore');
import Utils                                    = require('../common/Utils');
import BaseDaoDelegate                          = require('../delegates/BaseDaoDelegate');
class AbstractModel
{
    __proto__;
    static TABLE_NAME:string;
    static DELEGATE:BaseDaoDelegate;

    constructor(data:Object = {})
    {
        var thisProtoConstructor = this.__proto__.constructor;
        thisProtoConstructor['COLUMNS'] = thisProtoConstructor['COLUMNS'] || [];
        var self = this;

        if (thisProtoConstructor['COLUMNS'].length == 0)
            for (var classProperty in thisProtoConstructor)
                if (typeof thisProtoConstructor[classProperty] == 'string'
                    && classProperty.match(/^COL_/) != null)
                {
                    var key:string = classProperty.replace(/^COL_/, '').toLowerCase();
                    if (!Utils.isNullOrEmpty(key))
                        thisProtoConstructor['COLUMNS'].push(key);
                }

        _.each (thisProtoConstructor['COLUMNS'], function(column:string) {
            self[column] = data[column];
        });
    }

    toJson():any
    {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        var data = {};
        _.each (thisProtoConstructor['COLUMNS'], function(column:string) {
            if (Utils.getObjectType(self[column]) == 'Array')
            {
                data[column] = _.map(self[column], function(obj:any)
                {
                    return obj.toJson();
                });
            }
            else
            {
                try {
                    data[column] = self[column].toJson();
                } catch (e) {
                    data[column] = self[column];
                }
            }
        });
        return data;
    }

    toString():string { return '[object ' + Utils.getClassName(this) + ']'; }
}
export = AbstractModel