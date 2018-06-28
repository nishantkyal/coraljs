import ModelDecorators = require("../decorators/ModelDecorators");
import AbstractModel = require("./AbstractModel");

@ModelDecorators.tableName("HUHA")
class DecoratedModel extends AbstractModel {
    @ModelDecorators.columnName("p1")
    private property:string;

    constructor() {
        super();
    }
}
export = DecoratedModel;