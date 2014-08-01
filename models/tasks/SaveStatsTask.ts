import q                                                        = require('q');
import _                                                        = require('underscore');
import moment                                                   = require('moment');
import log4js                                                   = require('log4js');
import SaveStatsDelegate                                        = require('../../delegates/SaveStatsDelegate');
import SaveStats                                                = require('../../models/SaveStats');
import CacheHelperFactory                                       = require('../../factories/CacheHelperFactory');
import AbstractScheduledTask                                    = require('./AbstractScheduledTask');
import Config                                                   = require('../../common/Config');
import Utils                                                    = require('../../common/Utils');
import ScheduledTaskType                                        = require('../../enums/ScheduledTaskType');
import CacheHelperType                                          = require('../../enums/CacheHelperType');
import SaveStatsTaskType                                        = require('../../enums/SaveStatsTaskType');

class SaveStatsTask extends AbstractScheduledTask
{
    private keys:string[];
    private type:SaveStatsTaskType;
    private saveString:string;

    static KEYS:string              = 'keys';
    static TYPE:string              = 'type';
    static SAVE_STRING:string       = 'saveString';

    constructor(keys:string[],type:SaveStatsTaskType, saveString:string)
    {
        super();
        this.keys = keys;
        this.type = type;
        this.saveString = saveString;
        this.setTaskType(ScheduledTaskType.SAVE_STATS);
    }

    execute():q.Promise<any>
    {
        var self = this;
        var saveStatsDelegate = new SaveStatsDelegate();
        var saveTasks= [];
        var cacheFetchTasks = [];
        var cacheDeleteTasks = [];
        var saveStats:SaveStats[] = [];

        var dayAfter = moment().add('days',1);
        var millis:number = 86400 * 1000;
        var newSaveString:string = 'DAY_' + dayAfter.date() + '_OF_' + dayAfter.format('MMM').toUpperCase() + '_' + dayAfter.year();

        switch(self.getType())
        {
            case SaveStatsTaskType.WEEKLY:
                var dayAfterAWeek = moment().add('days',7);
                newSaveString = 'WEEK_OF_' + dayAfterAWeek.day(1).date() + '_' + dayAfterAWeek.format('MMM').toUpperCase() + '_' + dayAfterAWeek.year();
                millis *= 7;
                break;
            case SaveStatsTaskType.MONTHLY:
                var dayAfterAMonth = moment().add('months',1);
                newSaveString = dayAfterAMonth.format('MMM').toUpperCase() + '_' + dayAfterAMonth.year();
                //millis *= moment().daysInMonth();//TODO[ankit] settimeout cannot take a month delay - need a work around
                break;
        }

        _.each(self.keys, function(key){
            cacheFetchTasks.push(
                CacheHelperFactory.getCacheHelper(CacheHelperType.STATS_CACHE_HELPER).get(key)
                    .then( function(value)
                    {
                        var tempSaveStats:SaveStats = new SaveStats();
                        tempSaveStats.setName(key);
                        tempSaveStats.setCount(value);
                        tempSaveStats.setType(self.getSaveString());
                        saveTasks.push(saveStatsDelegate.create(tempSaveStats));
                    })
            );
            cacheDeleteTasks.push(CacheHelperFactory.getCacheHelper(CacheHelperType.STATS_CACHE_HELPER).del(key));
        })

        return q.all(cacheFetchTasks)
            .then( function statsFetched(){
                return q.all(saveTasks);
            })
            .then( function statsSaved(){
                return q.all(cacheDeleteTasks);
            })
            .finally(
            function scheduleItself()
            {
                var ScheduledTaskDelegate = require('../../delegates/ScheduledTaskDelegate');
                return ScheduledTaskDelegate.getInstance().scheduleAfter(new SaveStatsTask(self.getKeys(),self.getType(),newSaveString), millis);
            });
    }

    isValid():boolean
    {
        return super.isValid()
            && !Utils.isNullOrEmpty(this.keys) && !Utils.isNullOrEmpty(this.type) && !Utils.isNullOrEmpty(this.saveString);
    }

    toJson():Object
    {
        return _.extend(super.toJson(), {keys:this.keys, type:this.type, saveString:this.saveString});
    }

    /* Getters */
    getKeys():string[]                      { return this.keys;}
    getType():SaveStatsTaskType             { return this.type;}
    getSaveString():string                  { return this.saveString;}
}
export = SaveStatsTask