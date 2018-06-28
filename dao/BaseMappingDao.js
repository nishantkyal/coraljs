"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var _ = require("underscore");
var MysqlDao = require("./MysqlDao");
var Utils = require("../common/Utils");
var BaseMappingDao = (function (_super) {
    __extends(BaseMappingDao, _super);
    function BaseMappingDao() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseMappingDao.prototype.search = function (searchQuery, options, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var fk, srcPropertyNameCamelCase, setterMethod, whereStatements, wheres, values, self, mappingColumnNames, query;
            return __generator(this, function (_a) {
                fk = this.modelClass['FOREIGN_KEYS'][0];
                srcPropertyNameCamelCase = Utils.snakeToCamelCase(fk.getSourcePropertyName());
                setterMethod = 'set' + srcPropertyNameCamelCase;
                whereStatements = this.generateWhereStatements(searchQuery);
                wheres = _.map(whereStatements.where, function (where) {
                    return 'mapping.' + where;
                });
                values = whereStatements.values;
                self = this;
                mappingColumnNames = _.map(this.modelClass['COLUMNS'], function (colName) {
                    return 'mapping.' + colName + ' AS "' + self.modelClass.TABLE_NAME + '.' + colName + '"';
                }).join(',');
                query = 'SELECT ' + mappingColumnNames + ',referenced.* ' +
                    'FROM ' + this.modelClass.TABLE_NAME + ' mapping, ' + fk.referenced_table.TABLE_NAME + ' referenced ' +
                    'WHERE ' + wheres.join(' AND ') + ' ' +
                    'AND mapping.' + fk.src_key + ' = referenced.' + fk.target_key;
                return [2 /*return*/, self.mysqlDelegate.executeQuery(query, values, transaction)
                        .then(function handleResults(rows) {
                        var nameSpaceMappings = {};
                        _.each(self.modelClass['COLUMNS'], function (colName) {
                            nameSpaceMappings[self.modelClass.TABLE_NAME + '.' + colName] = colName;
                        });
                        // 2. Collect unique mapped objects
                        var referencedObjects = _.map(rows, function (row) {
                            return new fk.referenced_table(row);
                        });
                        // 3. Merge and return
                        return _.map(rows, function (row) {
                            // Remove the namespacing prefix from columns
                            var mappingObject = _.findWhere(referencedObjects, Utils.createSimpleObject(fk.target_key, row[self.modelClass.TABLE_NAME + "." + fk.src_key]));
                            _.each(_.keys(row), function (key) {
                                row[nameSpaceMappings[key]] = row[key];
                            });
                            var typedMappingObject = new self.modelClass(row);
                            typedMappingObject[setterMethod].call(typedMappingObject, mappingObject);
                            return typedMappingObject;
                        });
                    })
                        .catch(function handleFailure(error) {
                        self.logger.error('SEARCH failed for mapping table: %s, criteria: %s, error: %s', self.tableName, JSON.stringify(searchQuery), error.message);
                        throw (error);
                    })];
            });
        });
    };
    return BaseMappingDao;
}(MysqlDao));
module.exports = BaseMappingDao;
//# sourceMappingURL=BaseMappingDao.js.map