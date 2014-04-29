import AbstractDao                                          = require('./AbstractDao');
import Widget                                               = require('../models/Widget');

class WidgetDao extends AbstractDao
{
    constructor() { super(Widget); }
}
export = WidgetDao