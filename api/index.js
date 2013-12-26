module.exports = function(app) {

    require("./UserApi")(app);
    require("./ExpertApi")(app);
    require("./IntegrationApi")(app);
    require("./IntegrationOwnerApi")(app);
    require("./PhoneCallApi")(app);
    require("./ExpertScheduleApi")(app);
    require("./TransactionApi")(app);

};