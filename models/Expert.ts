///<reference path='./IntegrationMember.ts'/>
/**
 * Bean class for Expert
 */
module models
{
    export class Expert extends IntegrationMember
    {
        static TABLE_NAME:string = 'integration_member';

        private revenue_share:number;
        private revenue_share_unit:number;

        /** Getters */
        getRevenueShare():number { return this.revenue_share; }
        getRevenueShareUnit():number { return this.revenue_share_unit; }

        /** Setters */
        setRevenueShare(val) { this.revenue_share = val; }
        setRevenueShareUnit(val) { this.revenue_share_unit = val; }

    }
}