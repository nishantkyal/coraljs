import IntegrationMember        = require('./IntegrationMember');

/**
 * Bean class for Expert
 */
class Expert extends IntegrationMember {

    static TABLE_NAME = 'integration_member';
    static PRIMARY_KEY = 'integration_member_id';

    private revenue_share:number;
    private revenue_share_unit:number;

    /** Getters */
    getRevenueShare():number { return this.revenue_share; }
    getRevenueShareUnit():number { return this.revenue_share_unit; }

    /** Setters */
    setRevenueShare(val) { this.revenue_share = val; }
    setRevenueShareUnit(val) { this.revenue_share_unit = val; }

}