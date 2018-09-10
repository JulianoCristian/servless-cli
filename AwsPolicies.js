const AWS = require('aws-sdk');
const Promise = require("bluebird");

require('underscore').extend(module.exports, {inject: function init(_options) {
        function AwsPolicies(config) {
            this.config = config;
        }

        AwsPolicies.prototype.getLocalPolicies = function(rootRoute) {
            return Promise.resolve(rootRoute.getAllAWSPoliciesInTree());
        };

        AwsPolicies.prototype.getRemotePolicies = function(){
            AWS.config.update({
                region:this.config.region,
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey
            });

            var iam = new AWS.IAM({apiVersion: this.config.apiVersion});

            return new Promise(function(resolve, reject) {
                iam.listPolicies(
                    {
                        OnlyAttached: true,
                        Scope: "AWS"
                    },
                    function (err, data) {
                        if (err) reject("It looks like this user cannot ready their own IAM credentials.  Add 'IAMReadOnlyAccess' permission to fix."); // an error occurred
                        else resolve(data);           // successful response
                    });
            })
                .then((data)=>{
                    return data.Policies.map(elem => {return elem.PolicyName});
                });
        };

        return new AwsPolicies(_options);
}});
