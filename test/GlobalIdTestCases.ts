///<reference path='../_references.d.ts'/>
///<reference path='../delegates/GlobalIDDelegate.ts'/>
import nodeunit                 = require('nodeunit');

module tests
{
    export function testConsecutiveRuns(test:nodeunit.Test)
    {
        var numRuns = 10;
        test.expect(numRuns * 2);
        var i = 0;
        var lastGid = 0;
        while (i < numRuns) {
            var newGid = new delegates.GlobalIDDelegate().generate('user', 1);
            test.notEqual(lastGid, newGid);
            test.ok(newGid > 0);
            lastGid = newGid;
            i++;
        }
        test.done();
    }
}