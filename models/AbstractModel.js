"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var log4js = require("log4js");
var _ = require("underscore");
var Utils = require("../common/Utils");
var ForeignKeyType = require("../enums/ForeignKeyType");
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
                if (typeof thisProtoConstructor[classProperty] == 'string'
                    && classProperty.match(/^COL_/) != null) {
                    var key = classProperty.replace(/^COL_/, '').toLowerCase();
                    if (!Utils.isNullOrEmpty(key))
                        thisProtoConstructor['COLUMNS'].push(key);
                }
                // Detect Foreign Keys
                if (Utils.getObjectType(thisProtoConstructor[classProperty]) == 'ForeignKey') {
                    var fk = thisProtoConstructor[classProperty];
                    thisProtoConstructor['FK_COLUMNS'].push(fk.getSourcePropertyName());
                    // TODO: Also add reverse foreign keys to referenced model
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
            var _this = this;
            var self = this;
            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof this[srcPropertyName] != "undefined")
                                process.nextTick(function () {
                                    resolve(self[srcPropertyName]);
                                });
                            self.logger.debug('Lazily Finding %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                            return [4 /*yield*/, fk.referenced_table.DELEGATE.find(Utils.createSimpleObject(fk.target_key, this[fk.src_key]))
                                    .then(function success(result) {
                                    return self[setterMethod].call(self, result);
                                })
                                    .then(function resultSet() {
                                    return self[getterMethod].call(self);
                                })
                                    .catch(function handleFailure(error) {
                                    self.logger.debug('Lazy loading failed for find %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                                    throw error;
                                })];
                        case 1:
                            result = _a.sent();
                            resolve(result);
                            return [2 /*return*/];
                    }
                });
            }); });
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
            var _this = this;
            var self = this;
            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof this[srcPropertyName] != "undefined")
                                process.nextTick(function () {
                                    resolve(self[srcPropertyName]);
                                });
                            self.logger.debug('Lazily Searching %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                            return [4 /*yield*/, fk.referenced_table.DELEGATE.search(Utils.createSimpleObject(fk.target_key, this[fk.src_key]))
                                    .then(function success(result) {
                                    return self[setterMethod].call(self, result);
                                })
                                    .then(function resultSet() {
                                    return self[getterMethod].call(self);
                                })
                                    .catch(function handleFailure(error) {
                                    self.logger.debug('Lazy loading failed for search %s.%s', fk.referenced_table.TABLE_NAME, fk.target_key);
                                    throw error;
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); });
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
}());
module.exports = AbstractModel;
//# sourceMappingURL=AbstractModel.js.map