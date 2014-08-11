import q = require('q');
import AbstractDao = require('./AbstractDao');
declare class BaseMappingDao extends AbstractDao {
    public find(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
    public search(searchQuery: Object, fields?: string[], transaction?: Object): q.Promise<any>;
}
export = BaseMappingDao;
