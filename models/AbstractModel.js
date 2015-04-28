///<reference path='../_references.d.ts'/>
var log4js = require('log4js');
var q = require('q');
var _ = require('underscore');
var Utils = require('../common/Utils');
var ForeignKeyType = require('../enums/ForeignKeyType');
var AbstractModel = (function () {
    function AbstractModel(data) {
        if (data === void 0) { data = {}; }
        this.logger = log4js.getLogger(Utils.getClassName(this));
        var thisProtoConstructor = this.__proto__.constructor;
        var self = this;
        if (!thisProtoConstructor._INITIALIZED) {
            thisProtoConstructor['COLUMNS'] = [];
            thisProtoConstructor['FK_COLUMNS'] = [];
            thisProtoConstructor['FOREIGN_KEYS'] = [];
            for (var classProperty in thisProtoConstructor) {
                // Detect columns
                if (typeof thisProtoConstructor[classProperty] == 'string' && classProperty.match(/^COL_/) != null) {
                    var key = classProperty.replace(/^COL_/, '').toLowerCase();
                    if (!Utils.isNullOrEmpty(key))
                        thisProtoConstructor['COLUMNS'].push(key);
                }
                // Detect Foreign Keys
                if (Utils.getObjectType(thisProtoConstructor[classProperty]) == 'ForeignKey') {
                    var fk = thisProtoConstructor[classProperty];
                    thisProtoConstructor['FK_COLUMNS'].push(fk.getSourcePropertyName());
                    switch (fk.type) {
                        case 2 /* ONE_TO_MANY */:
                        case 3 /* MANY_TO_MANY */:
                            this.hasMany(fk);
                            break;
                        case 4 /* MANY_TO_ONE */:
                        case 1 /* ONE_TO_ONE */:
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
            if (!Utils.isNullOrEmpty(data[column]))
                self[setterMethod].call(self, data[column]);
        });
        _.each(thisProtoConstructor['FK_COLUMNS'], function (column) {
            var setterMethod = 'set' + Utils.snakeToCamelCase(column);
            if (!Utils.isNullOrEmpty(data[column]))
                self[setterMethod].call(self, data[column]);
        });
    }
    AbstractModel.prototype.toJson = function () {
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
    };
    AbstractModel.prototype.toString = function () {
        return '[object ' + Utils.getClassName(this) + ']';
    };
    AbstractModel.prototype.get = function (propertyName) {
        var thisProtoConstructor = this.__proto__.constructor;
        if (thisProtoConstructor['COLUMNS'].indexOf(propertyName) == -1)
            throw new Error('Non-existent property: ' + propertyName + ' referenced');
        return this[propertyName];
    };
    AbstractModel.prototype.set = function (propertyName, val) {
        var thisProto = this.__proto__;
        var setterMethodName = 'set' + Utils.snakeToCamelCase(propertyName);
        var setterMethod = thisProto[setterMethodName];
        if (setterMethod)
            setterMethod.call(this, val);
        else
            throw new Error('Non-existent property: Tried calling non-existent setter: ' + setterMethodName + ' for model: ' + Utils.getClassName(this));
    };
    /* Foreign key methods */
    AbstractModel.prototype.hasOne = function (fk) {
        var srcPropertyName = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod = 'get' + srcPropertyNameCamelCase;
        var setterMethod = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;
        // Getter method
        thisProto[getterMethod] = function () {
            var self = this;
            if (typeof this[srcPropertyName] != "undefined")
                return q.resolve(this[srcPropertyName]);
            self.logger.debug('Lazily Finding %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
            return fk.referenced_table.DELEGATE.find(Utils.createSimpleObject(fk.target_key, this[fk.src_key])).then(function success(result) {
                return self[setterMethod].call(self, result);
            }).then(function resultSet() {
                return self[getterMethod].call(self);
            }).fail(function handleFailure(error) {
                self.logger.debug('Lazy loading failed for find %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                throw error;
            });
        };
        // Setter method
        thisProto[setterMethod] = function (val) {
            this[srcPropertyName] = null;
            if (_.isArray(val))
                this[srcPropertyName] = _.findWhere(val, Utils.createSimpleObject(fk.target_key, this[fk.src_key]));
            if (_.isObject(val) && (val[fk.target_key] == this[fk.src_key] || Utils.isNullOrEmpty(this[fk.src_key])))
                this[srcPropertyName] = val;
        };
    };
    AbstractModel.prototype.hasMany = function (fk) {
        var srcPropertyName = fk.getSourcePropertyName();
        var srcPropertyNameCamelCase = Utils.snakeToCamelCase(srcPropertyName);
        var getterMethod = 'get' + srcPropertyNameCamelCase;
        var setterMethod = 'set' + srcPropertyNameCamelCase;
        var thisProto = this.__proto__;
        // Getter method
        thisProto[getterMethod] = function () {
            var self = this;
            if (typeof this[srcPropertyName] != "undefined")
                return q.resolve(this[srcPropertyName]);
            self.logger.debug('Lazily Searching %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
            return fk.referenced_table.DELEGATE.search(Utils.createSimpleObject(fk.target_key, this[fk.src_key])).then(function success(result) {
                return self[setterMethod].call(self, result);
            }).then(function resultSet() {
                return self[getterMethod].call(self);
            }).fail(function handleFailure(error) {
                self.logger.debug('Lazy loading failed for search %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                throw error;
            });
        };
        // Setter method
        thisProto[setterMethod] = function (val) {
            this[srcPropertyName] = null;
            if (_.isObject(val) && val[fk.target_key] == this[fk.src_key])
                this[srcPropertyName] = [val];
            if (_.isArray(val))
                this[srcPropertyName] = _.where(val, Utils.createSimpleObject(fk.target_key, this[fk.src_key]));
        };
    };
    AbstractModel.getForeignKeyForSrcKey = function (srcKey) {
        return _.findWhere(this['FOREIGN_KEYS'], { src_key: srcKey });
    };
    AbstractModel.getForeignKeyForColumn = function (col) {
        var index;
        _.each(this['FK_COLUMNS'], function (fk_col, i) {
            if (fk_col == col)
                index = i;
        });
        return this['FOREIGN_KEYS'][index];
    };
    AbstractModel.FOREIGN_KEYS = [];
    AbstractModel.FK_COLUMNS = [];
    AbstractModel.PUBLIC_FIELDS = [];
    return AbstractModel;
})();
module.exports = AbstractModel;
//# sourceMappingURL=AbstractModel.js.map