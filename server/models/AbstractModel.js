"use strict";
const log4js = require("log4js");
const q = require("q");
const _ = require("underscore");
const Utils = require("../common/Utils");
const ForeignKeyType = require("../enums/ForeignKeyType");
class AbstractModel {
    constructor(data = {}) {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        if (!thisProtoConstructor._INITIALIZED) {
            thisProtoConstructor['COLUMNS'] = [];
            thisProtoConstructor['FK_COLUMNS'] = [];
            thisProtoConstructor['FOREIGN_KEYS'] = [];
            for (var classProperty in thisProtoConstructor) {
                if (typeof thisProtoConstructor[classProperty] == 'string'
                    && classProperty.match(/^COL_/) != null) {
                    var key = classProperty.replace(/^COL_/, '').toLowerCase();
                    if (!Utils.isNullOrEmpty(key))
                        thisProtoConstructor['COLUMNS'].push(key);
                }
                if (Utils.getObjectType(thisProtoConstructor[classProperty]) == 'ForeignKey') {
                    var fk = thisProtoConstructor[classProperty];
                    thisProtoConstructor['FK_COLUMNS'].push(fk.getSourcePropertyName());
                    switch (fk.type) {
                        case ForeignKeyType.ONE_TO_MANY:
                        case ForeignKeyType.MANY_TO_MANY:
                            this.hasMany(fk);
                            break;
                        case ForeignKeyType.MANY_TO_ONE:
                        case ForeignKeyType.ONE_TO_ONE:
                            this.hasOne(fk);
                            break;
                    }
                    thisProtoConstructor['FOREIGN_KEYS'].push(fk);
                }
            }
            thisProtoConstructor['PUBLIC_FIELDS'] = thisProtoConstructor['PUBLIC_FIELDS'] || thisProtoConstructor['COLUMNS'];
            thisProtoConstructor._INITIALIZED = true;
        }
        _.each(thisProtoConstructor['COLUMNS'], function (column) {
            var setterMethod = 'set' + Utils.snakeToCamelCase(column);
            var columnData = data[thisProtoConstructor['COL_' + column.toUpperCase()]];
            if (!Utils.isNullOrEmpty(columnData))
                self[setterMethod].call(self, columnData);
        }, self);
        _.each(thisProtoConstructor['FK_COLUMNS'], function (column) {
            var setterMethod = 'set' + Utils.snakeToCamelCase(column);
            var columnData = data[thisProtoConstructor['COL_' + column.toUpperCase()]];
            if (!Utils.isNullOrEmpty(columnData))
                self[setterMethod].call(self, columnData);
        }, self);
    }
    toJson() {
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        var data = {};
        var cols = thisProtoConstructor['COLUMNS'].concat(thisProtoConstructor['FK_COLUMNS']);
        _.each(cols, function (column) {
            if (Utils.getObjectType(self[column]) == 'Array') {
                data[column] = _.map(self[column], function (obj) {
                    try {
                        return obj.toJson();
                    }
                    catch (e) {
                        return obj;
                    }
                });
            }
            else {
                try {
                    data[column] = self[column].toJson();
                }
                catch (e) {
                    data[column] = self[column];
                }
            }
        });
        return data;
    }
    toString() { return '[object ' + Utils.getClassName(this) + ']'; }
    get(propertyName) {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw new Error('Non-existent property: ' + propertyName + ' referenced');
        return this[propertyName];
    }
    set(propertyName, val) {
        var thisProto = this.__proto__;
        var setterMethodName = 'set' + Utils.snakeToCamelCase(propertyName);
        var setterMethod = thisProto[setterMethodName];
        if (setterMethod)
            setterMethod.call(this, val);
        else
            throw new Error('Non-existent property: Tried calling non-existent setter: ' + setterMethodName + ' for model: ' + Utils.getClassName(this));
    }
    hasOne(fk) {
        var srcPropertyName = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod = 'get' + srcPropertyNameCamelCase;
        var setterMethod = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;
        thisProto[getterMethod] = function () {
            var self = this;
            if (typeof this[srcPropertyName] != "undefined")
                return q.resolve(this[srcPropertyName]);
            self.logger.debug('Lazily Finding %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
            var result = fk.referenced_table.DELEGATE.find(Utils.createSimpleObject(fk.target_key, this[fk.src_key]))
                .then(function success(result) {
                return self[setterMethod].call(self, result);
            })
                .then(function resultSet() {
                return self[getterMethod].call(self);
            })
                .catch(function handleFailure(error) {
                self.logger.debug('Lazy loading failed for find %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                throw error;
            });
        };
        thisProto[setterMethod] = function (val) {
            this[srcPropertyName] = null;
            if (_.isArray(val))
                this[srcPropertyName] = _.findWhere(val, Utils.createSimpleObject(fk.target_key, this[fk.src_key]));
            if (_.isObject(val) && (val[fk.target_key] == this[fk.src_key] || Utils.isNullOrEmpty(this[fk.src_key])))
                this[srcPropertyName] = val;
        };
    }
    hasMany(fk) {
        var srcPropertyName = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod = 'get' + srcPropertyNameCamelCase;
        var setterMethod = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;
        thisProto[getterMethod] = function () {
            var self = this;
            if (typeof this[srcPropertyName] != "undefined")
                return q.resolve(this[srcPropertyName]);
            self.logger.debug('Lazily Searching %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
            return fk.referenced_table.DELEGATE.search(Utils.createSimpleObject(fk.target_key, this[fk.src_key]))
                .then(function success(result) {
                return self[setterMethod].call(self, result);
            })
                .then(function resultSet() {
                return self[getterMethod].call(self);
            })
                .catch(function handleFailure(error) {
                self.logger.debug('Lazy loading failed for search %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                throw error;
            });
        };
        thisProto[setterMethod] = function (val) {
            this[srcPropertyName] = null;
            if (_.isObject(val) && val[fk.target_key] == this[fk.src_key])
                this[srcPropertyName] = [val];
            if (_.isArray(val))
                this[srcPropertyName] = _.where(val, Utils.createSimpleObject(fk.target_key, this[fk.src_key]));
        };
    }
    static getForeignKeyForSrcKey(srcKey) {
        return _.findWhere(this['FOREIGN_KEYS'], { src_key: srcKey });
    }
    static getForeignKeyForColumn(col) {
        var index;
        _.each(this['FK_COLUMNS'], function (fk_col, i) {
            if (fk_col == col)
                index = i;
        });
        return this['FOREIGN_KEYS'][index];
    }
}
AbstractModel.FOREIGN_KEYS = [];
AbstractModel.FK_COLUMNS = [];
AbstractModel.PUBLIC_FIELDS = [];
module.exports = AbstractModel;
//# sourceMappingURL=AbstractModel.js.map