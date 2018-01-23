import _                                                = require('underscore');
import log4js                                           = require('log4js');
import moment                                           = require('moment');
import IDao                                             = require('../dao/IDao');
import IDaoFetchOptions                                 = require('../dao/IDaoFetchOptions');
import MysqlDao                                         = require('../dao/MysqlDao');
import Utils                                            = require('../common/Utils');
import BaseModel                                        = require('../models/BaseModel');
import ForeignKey                                       = require('../models/ForeignKey');
import GlobalIdDelegate                                 = require('../delegates/GlobalIDDelegate');
import ForeignKeyType                                   = require('../enums/ForeignKeyType');

class BaseDaoDelegate {
    logger: log4js.Logger = log4js.getLogger(Utils.getClassName(this));
    dao: IDao;

    /** Can be constructed using just the model in case dao doesn't do anything special
     * e.g. Execute custom queries which IDao doesn't support
     * @param dao
     */
    constructor(dao: typeof BaseModel);
    constructor(dao: IDao);
    constructor(dao: any) {
        this.dao = Utils.getObjectType(dao) === 'Object' ? dao : new MysqlDao(dao);
        this.dao.modelClass.DELEGATE = this;
    }

    async get(id: any, options: IDaoFetchOptions = {}, foreignKeys: ForeignKey[] = [], transaction?: Object): Promise<any> {
        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        id = [].concat(id);

        if (id.length > 1)
            return this.search({'id': id}, options, foreignKeys, transaction);

        if (id.length === 1)
            return this.find({'id': id}, options, foreignKeys, transaction);
    }

    async find(search: Object, options: IDaoFetchOptions = {}, foreignKeys: ForeignKey[] = [], transaction?: Object): Promise<any> {
        var self: BaseDaoDelegate = this;

        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        try {
            var result: BaseModel = await this.dao.find(search, options, transaction)

            if (Utils.isNullOrEmpty(result))
                return result;

            var foreignKeysToPassOn = _.filter(foreignKeys, function (key: ForeignKey) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
            });

            foreignKeys = _.filter(foreignKeys, function (key: ForeignKey) {
                return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
            });

            var results = _.map(foreignKeys, async function (key: ForeignKey) {
                self.logger.debug('Processing find foreign key for %s', key.getSourcePropertyName());
                var delegate = key.referenced_table.DELEGATE;
                return delegate.search(Utils.createSimpleObject(key.target_key, result.get(key.src_key)), null, foreignKeysToPassOn);
            });

            _.each(results, function (resultSet: any, index) {
                result.set(foreignKeys[index].getSourcePropertyName(), resultSet);
            });

        } catch (error) {
            self.logger.error('Error occurred while finding %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
            throw error;
        }
        return result;
    }

    /*
     * Perform search based on search query
     * Also fetch joint fields
     */
    async search(search?: Object, options: IDaoFetchOptions = {}, foreignKeys: ForeignKey[] = [], transaction?: Object): Promise<any> {
        var self: BaseDaoDelegate = this;

        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        var baseSearchResults: BaseModel[] = await this.dao.search(search, options, transaction);
        if (Utils.isNullOrEmpty(baseSearchResults))
            return baseSearchResults;

        var foreignKeysToPassOn = _.filter(foreignKeys, function (key: ForeignKey) {
            return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) == -1;
        });

        foreignKeys = _.filter(foreignKeys, function (key: ForeignKey) {
            return self.dao.modelClass['FOREIGN_KEYS'].indexOf(key) != -1;
        });

        var foreignKeyResults = _.compact(_.map(foreignKeys, async function (key: ForeignKey) {
            self.logger.debug('Processing search foreign key for %s', key.getSourcePropertyName());
            var delegate = key.referenced_table.DELEGATE;
            return delegate.search(Utils.createSimpleObject(key.target_key, _.uniq(_.pluck(baseSearchResults, key.src_key))), null, foreignKeysToPassOn);
        }));

        _.each(baseSearchResults, function (baseSearchResult: any) {
            _.each(foreignKeyResults, function (resultSet: any, index) {
                baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
            })
        });
        return baseSearchResults;

    }

    async searchWithIncludes(search?: Object, options: IDaoFetchOptions = {}, includes?: Object[], transaction?: Object): Promise<any> {
        var self: BaseDaoDelegate = this;

        options = options || {};
        options.fields = options.fields || this.dao.modelClass.PUBLIC_FIELDS;

        var baseSearchResults = await this.dao.search(search, options, transaction)

        if (Utils.isNullOrEmpty(baseSearchResults))
            return baseSearchResults;

        return self.processIncludes(baseSearchResults, search, options, includes, transaction);
    }

    async processIncludes(baseSearchResults: BaseModel[], search?: Object, options?: IDaoFetchOptions, includes?: Object[], transaction?: Object): Promise<any> {
        var self: BaseDaoDelegate = this;
        var foreignKeys: ForeignKey[] = [];

        try {
            var results = _.map(includes, async function (include: any) {
                if (typeof include === 'string') //if no nested includes
                {
                    var tempForeignKey: ForeignKey = self.dao.modelClass.getForeignKeyForColumn(include);
                    if (!Utils.isNullOrEmpty(tempForeignKey)) {
                        foreignKeys.push(tempForeignKey);
                        self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                        var delegate = tempForeignKey.referenced_table.DELEGATE;
                        return delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, null, transaction);
                    }
                }
                else // if nested includes then pass on to next call
                {
                    var tempForeignKey: ForeignKey = self.dao.modelClass.getForeignKeyForColumn(_.keys(include)[0]);
                    if (!Utils.isNullOrEmpty(tempForeignKey)) {
                        foreignKeys.push(tempForeignKey);
                        self.logger.debug('Processing search foreign key for %s', tempForeignKey.getSourcePropertyName());
                        var delegate = tempForeignKey.referenced_table.DELEGATE;
                        return delegate.searchWithIncludes(Utils.createSimpleObject(tempForeignKey.target_key, _.uniq(_.pluck(baseSearchResults, tempForeignKey.src_key))), {}, _.values(include)[0], transaction);
                    }
                }
            });

            _.each(baseSearchResults, function (baseSearchResult: any) {
                _.each(results, function (resultSet: any, index) {
                    baseSearchResult.set(foreignKeys[index].getSourcePropertyName(), resultSet);
                })
            });

        } catch (error) {
            self.logger.error('Error occurred while searching %s for criteria: %s, error: %s', self.dao.modelClass.TABLE_NAME, JSON.stringify(search), error.message);
            throw error;

        }

        return baseSearchResults;
    }


    async create(object: Object, transaction?: Object): Promise<any>;
    async create(object: Object[], transaction?: Object): Promise<any>;
    async create(object: any, transaction?: Object): Promise<any> {
        if (Utils.isNullOrEmpty(object))
            throw new Error('Invalid data. Trying to create object with null data');

        var self: BaseDaoDelegate = this;

        function prepareData(data: BaseModel) {
            var generatedId: number = new GlobalIdDelegate().generate(self.dao.modelClass.TABLE_NAME);
            data[BaseModel.COL_ID] = generatedId;
            data[BaseModel.COL_CREATED] = moment().valueOf();
            data[BaseModel.COL_UPDATED] = moment().valueOf();
            return data;
        };

        var newObject: any = (Utils.getObjectType(object) === 'Array') ? _.map(object, prepareData) : prepareData(object);

        return this.dao.create(newObject, transaction);
    }

    async update(criteria: Object, newValues: any, transaction?: Object): Promise<any>;
    async update(criteria: number, newValues: any, transaction?: Object): Promise<any>;
    async update(criteria: any, newValues: any, transaction?: Object): Promise<any> {
        // Compose update statement based on newValues
        newValues[BaseModel.COL_UPDATED] = new Date().getTime();
        delete newValues[BaseModel.COL_CREATED];
        delete newValues[BaseModel.COL_ID];

        return this.dao.update(criteria, newValues, transaction);
    }

    async delete(criteria: number, softDelete?: boolean, transaction?: Object): Promise<any>;
    async delete(criteria: Object, softDelete?: boolean, transaction?: Object): Promise<any>;
    async delete(criteria: any, softDelete: boolean = true, transaction?: Object): Promise<any> {
        if (Utils.isNullOrEmpty(criteria))
            throw new Error('Please specify what to delete');

        if (softDelete)
            return this.dao.update(criteria, {'deleted': moment().valueOf()}, transaction);
        else
            return this.dao.delete(criteria, transaction);
    }

    async save(object: Object, dbTransaction?: Object): Promise<any> {
        return Utils.isNullOrEmpty(object[BaseModel.COL_ID]) ? this.create(object, dbTransaction) : this.update(object[BaseModel.COL_ID], object, dbTransaction);
    }
}

export = BaseDaoDelegate