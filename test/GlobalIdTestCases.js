
var GlobalIDDelegate = require('../delegates/GlobalIDDelegate');

function testConsecutiveRuns(test) {
    var numRuns = 10;

    test.expect(numRuns * 2);

    var i = 0;
    var lastGid = 0;
    while (i < numRuns) {
        var newGid = new GlobalIDDelegate().generate('user', 1);
        test.notEqual(lastGid, newGid);
        test.ok(newGid > 0);
        lastGid = newGid;
        i++;
    }

    test.done();
}
exports.testConsecutiveRuns = testConsecutiveRuns;

