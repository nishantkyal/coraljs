///<reference path='../_references.d.ts'/>
import _                                            = require('underscore');
import q                                            = require('q');
import redis                                        = require('redis');
import Config                                       = require('../common/Config');
import Utils                                        = require('../common/Utils');
import CacheHelper                                  = require('./CacheHelper');

class CounterCacheHelper extends CacheHelper
{

}
export = CounterCacheHelper