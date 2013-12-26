
var _ = require('underscore');
var log4js = require('log4js');

var MysqlDelegate = require('../delegates/MysqlDelegate');
var GlobalIdDelegate = require('../delegates/GlobalIDDelegate');
var BaseModel = require('../models/BaseModel');
var Utils = require('../Utils');

/**
Base class for DAO
**/
var BaseDAO = (function () {
    function BaseDAO() {
        this.logger = log4js.getLogger(Utils.getClassName(this));
        if (this.getModel() && this.getModel().TABLE_NAME && this.getModel().PRIMARY_KEY) {
            this.primaryKey = this.getModel().PRIMARY_KEY;
            this.tableName = this.getModel().TABLE_NAME;
        } else
            throw ('Invalid Model class specified for ' + Utils.getClassName(this));
    }
    /* Create */
    BaseDAO.prototype.create = function (data, transaction) {
        var that = this;

        data = data || {};

        // Compose insert statement based on data
        var generatedId = new GlobalIdDelegate().generate(this.tableName);
        delete data['id'];
        data[this.primaryKey] = generatedId;
        data['created'] = new Date().getTime();
        data['updated'] = new Date().getTime();

        var inserts = _.keys(data);
        var values = _.map(_.values(data), function addQuotesIfString(val) {
            val = val || '';
            return typeof val === 'string' ? "'" + val + "'" : val;
        });

        var query = 'INSERT INTO ' + this.tableName + '(' + inserts.join(',') + ') VALUES (' + values.join(',') + ')';

        return MysqlDelegate.executeQuery(query, null, transaction).then(function created(result) {
            if (!transaction)
                return that.get(generatedId);
else
                return { id: generatedId };
        }, function createFailure(error) {
            this.logger.error('Error while creating a new ' + that.tableName);
            throw (error);
        });
    };

    /* Get by id */
    BaseDAO.prototype.get = function (id, fields) {
        if (this.primaryKey != 'id') {
            var search = {};
            search[this.primaryKey] = id;
            return this.search(search, { 'fields': fields }).then(function handleSearchComplete(rows) {
                return rows[0];
            });
        }

        var that = this;
        var selectColumns = fields ? fields.join(',') : '*';
        var query = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE id = ?';
        return MysqlDelegate.executeQuery(query, [id]).then(function objectFetched(rows) {
            switch (rows.length) {
                case 0:
                    that.logger.debug('No object found for' + this.tableName + ', id: ' + id);
                    throw ('No object found for' + this.tableName + ', id: ' + id);
                    break;
                case 1:
                    return rows[0];
                    break;
            }
            return null;
        }, function objectFetchError(error) {
            that.logger.error('Error while fetching ' + this.tableName + ', id: ' + id);
            throw (error);
        });
    };

    /* Search */
    BaseDAO.prototype.search = function (searchQuery, options) {
        // Compose where statement based on searchQuery
        var values = [];
        var whereStatements = [];

        for (var key in searchQuery) {
            if (_.isArray(searchQuery[key])) {
                whereStatements.push(key + ' IN (?)');
                values.push(_.map(_.values(searchQuery[key]), function addQuotesIfString(val) {
                    val = val || '';
                    return typeof val === 'string' ? "'" + val + "'" : val;
                }));
            } else {
                if (_.isString(searchQuery[key])) {
                    whereStatements.push(key + ' = "' + searchQuery[key] + '"');
                    values.push(searchQuery[key]);
                } else {
                    whereStatements.push(key + ' ' + searchQuery[key]['operator'] + ' "?"');
                    values.push(searchQuery[key]['value']);
                }
            }
        }

        if (whereStatements.length == 0) {
            throw ('Invalid search criteria');
        }

        // Compose select statement based on fields
        var selectColumns = options.hasOwnProperty('fields') ? options['fields'].join(',') : '*';

        var query = 'SELECT ' + selectColumns + ' FROM ' + this.tableName + ' WHERE ' + whereStatements.join(' AND ');
        return MysqlDelegate.executeQuery(query, values);
    };

    /* Update */
    BaseDAO.prototype.update = function (criteria, newValues, transaction) {
        // Remove fields with null values
        _.each(criteria, function (val, key) {
            if (val == null)
                delete criteria[key];
        });

        _.each(newValues, function (val, key) {
            if (val == null)
                delete newValues[key];
        });

        // Compose update statement based on newValues
        newValues['updated'] = new Date().getTime();
        delete newValues['id'];
        delete newValues[this.primaryKey];

        var updates = _.map(_.keys(newValues), function (updateColumn) {
            return updateColumn + ' = ?';
        });
        var values = _.values(newValues);

        // Compose criteria statements
        var wheres = _.map(_.keys(criteria), function (whereColumn) {
            return whereColumn + ' = ?';
        });
        values = values.concat(_.values(criteria));

        var query = 'UPDATE ' + this.tableName + ' SET ' + updates.join(",") + ' WHERE ' + wheres.join(" AND ");
        return MysqlDelegate.executeQuery(query, values, transaction);
    };

    /* Delete */
    BaseDAO.prototype.delete = function (id, softDelete, transaction) {
        if (typeof softDelete === "undefined") { softDelete = true; }
        if (softDelete)
            return this.update({ 'id': id }, { 'deleted': true }, transaction);
else
            return MysqlDelegate.executeQuery('DELETE FROM ' + this.tableName + ' WHERE id = ?', [id], transaction);
    };

    BaseDAO.prototype.getModel = function () {
        throw ('Model class not defined for ' + Utils.getClassName(this));
    };
    return BaseDAO;
})();

module.exports = BaseDAO;

//# sourceMappingURL=BaseDAO.js.map
