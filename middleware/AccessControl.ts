///<reference path='../_references.d.ts'/>
///<reference path='../models/IntegrationMember.ts'/>
///<reference path='../common/Utils.ts'/>
///<reference path='../common/Config.ts'/>
///<reference path='../delegates/IntegrationMemberDelegate.ts'/>
///<reference path='../enums/IntegrationMemberRole.ts'/>
/**
 * Middleware to access control Integration REST APIs
 * Note: Website accesses delegates directly and doesn't go through the APIs hence no access control middleware for it
 */

module middleware
{
    export class AccessControl
    {
        static logger:log4js_module.Logger = log4js.getLogger(common.Utils.getClassName('AccessControl'));

        static allowOwner(req, res, next:Function)
        {
            var accessToken = req.query['token'];
            var integrationMemberId = req.params['memberId'];
            AccessControl.getIntegration(accessToken, integrationMemberId)
                .then(
                function handleRoleFetched(integrationMember)
                {
                    if (AccessControl.isRequestFromDashboard(req) || integrationMember.role === enums.IntegrationMemberRole.OWNER)
                        next();
                    else
                        res.status(401).json('Unauthorized');
                },
                function roleFetchError(error)
                {
                    AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                    res.status(500).json("Couldn't authenticate request");
                }
            )
        }

        static allowAdmin(req, res, next)
        {
            var accessToken = req.query['token'];
            var integrationMemberId = req.params['memberId'];
            AccessControl.getIntegration(accessToken, integrationMemberId)
                .then(
                function handleRoleFetched(integrationMember)
                {
                    if (AccessControl.isRequestFromDashboard(req) || integrationMember.role >= enums.IntegrationMemberRole.ADMIN)
                        next();
                    else
                        res.status(401).json('Unauthorized');
                },
                function roleFetchError(error)
                {
                    AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                    res.status(500).json("Couldn't authenticate request");
                }
            )
        }

        static allowExpert(req, res, next)
        {
            var accessToken = req.query['token'];
            var integrationMemberId = req.params['expertId'];
            AccessControl.getIntegration(accessToken, integrationMemberId)
                .then(
                function handleRoleFetched(integrationMember)
                {
                    if (AccessControl.isRequestFromDashboard(req) || integrationMember.role === enums.IntegrationMemberRole.EXPERT)
                        next();
                    else
                        res.status(401).json('Unauthorized');
                },
                function roleFetchError(error)
                {
                    AccessControl.logger.error('Error fetching role for accessToken: ' + accessToken + ', ' + error);
                    res.status(500).json("Couldn't authenticate request");
                }
            )
        }

        static allowDashboard(req, res, next)
        {
            if (AccessControl.isRequestFromDashboard(req))
                next();
            else {
                AccessControl.logger.error('Auth failed for IP: ' + req.ip);
                res.status(500).json("Couldn't authenticate request");
            }
        }

        private static isRequestFromDashboard(req) {
            var remoteAddress = req.ip;
            var searchntalkHosts = common.Config.get('SearchNTalk.hosts');

            if (!searchntalkHosts && searchntalkHosts.length == 0)
                this.logger.error('NO SEARCHNTALK HOSTS CONFIGURED, DASHBOARD WONT AUTHENTICATE');

            return searchntalkHosts.indexOf(remoteAddress) != -1;
        }

        /* Helper method to get details of integration corresponding to token and member id */
        static getIntegration(accessToken:string, integrationMemberId?:string):Q.Promise<any>
        {
            var search = {'access_token': accessToken};
            if (integrationMemberId)
                search['integration_member_id'] = integrationMemberId;

            return new delegates.IntegrationMemberDelegate().findValidAccessToken(accessToken, integrationMemberId);
        }

    }
}