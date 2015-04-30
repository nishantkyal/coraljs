define(["require", "exports"], function (require, exports) {
    var SMSStatus;
    (function (SMSStatus) {
        SMSStatus[SMSStatus["SCHEDULED"] = 1] = "SCHEDULED";
        SMSStatus[SMSStatus["FAILED"] = 2] = "FAILED";
        SMSStatus[SMSStatus["RETRIED"] = 3] = "RETRIED";
    })(SMSStatus || (SMSStatus = {}));
    return SMSStatus;
});
//# sourceMappingURL=SMSStatus.js.map