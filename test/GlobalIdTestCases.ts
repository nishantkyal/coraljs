///<reference path='../_references.d.ts'/>
import nodeunit                                                 = require('nodeunit');
import GlobalIdDelegate                                         = require('../delegates/GlobalIdDelegate');

export function testConsecutiveRuns(test:nodeunit.Test)
{
    var numRuns = 10;
    test.expect(numRuns);
    var i = 0;
    var lastGid = 0;
    while (i < numRuns) {
        var newGid = new GlobalIdDelegate().generate('user', 1);
        test.notEqual(lastGid, newGid);
        lastGid = newGid;
        i++;
    }
    test.done();
}