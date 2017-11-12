"use strict";
var ForeignKeyType;
(function (ForeignKeyType) {
    ForeignKeyType[ForeignKeyType["ONE_TO_ONE"] = 1] = "ONE_TO_ONE";
    ForeignKeyType[ForeignKeyType["ONE_TO_MANY"] = 2] = "ONE_TO_MANY";
    ForeignKeyType[ForeignKeyType["MANY_TO_MANY"] = 3] = "MANY_TO_MANY";
    ForeignKeyType[ForeignKeyType["MANY_TO_ONE"] = 4] = "MANY_TO_ONE";
})(ForeignKeyType || (ForeignKeyType = {}));
module.exports = ForeignKeyType;
//# sourceMappingURL=ForeignKeyType.js.map