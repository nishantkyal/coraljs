///<reference path='../_references.d.ts'/>
import _                                                = require('underscore');
import q                                                = require('q');
import request                                          = require('request');
import BaseDaoDelegate                                  = require('./BaseDaoDelegate');
import SkillCode                                        = require('../models/SkillCode');
import Utils                                            = require('../common/Utils');

class SkillCodeDelegate extends BaseDaoDelegate
{
    constructor() { super(SkillCode); }

    /*find(search:Object, fields?:string[], includes:IncludeFlag[] = [], transaction?:Object):q.Promise<any>
    {
        var self = this;
        return super.find(search, fields, includes, transaction)
            .then( function (result){
                if (Utils.isNullOrEmpty(result))
                    return self.create(Utils.createSimpleObject(SkillCode.SKILL, search[SkillCode.SKILL]));
            })
    }*/

}
export = SkillCodeDelegate