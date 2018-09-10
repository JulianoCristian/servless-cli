const fs = require("fs");
const path = require("path");
const yaml = require("node-yaml");

/*
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  GetFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.get
      Runtime: nodejs6.10
      CodeUri: s3://bucket/api_backend.zip
      Policies: AmazonDynamoDBReadOnlyAccess
      Environment:
        Variables:
          TABLE_NAME: !Ref Table
      Events:
        GetResource:
          Type: Api
          Properties:
            Path: /resource/{resourceId}
            Method: get

  PutFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.put
      Runtime: nodejs6.10
      CodeUri: s3://bucket/api_backend.zip
      Policies: AmazonDynamoDBFullAccess
      Environment:
        Variables:
          TABLE_NAME: !Ref Table
      Events:
        PutResource:
          Type: Api
          Properties:
            Path: /resource/{resourceId}
            Method: put

  DeleteFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.delete
      Runtime: nodejs6.10
      CodeUri: s3://bucket/api_backend.zip
      Policies: AmazonDynamoDBFullAccess
      Environment:
        Variables:
          TABLE_NAME: !Ref Table
      Events:
        DeleteResource:
          Type: Api
          Properties:
            Path: /resource/{resourceId}
            Method: delete

  Table:
    Type: AWS::Serverless::SimpleTable
 */

require('underscore').extend(module.exports, {inject: function init(_options){
        function SamGenerator(config) {
            this.AWSTemplateFormatVersion = config.apiVersion;
            this.region = config.region;
            this.nodeRuntime =  config.nodeRuntime;
            this.yamlishJson = {};
            this.yamlishJson["AWSTemplateFormatVersion"] = this.AWSTemplateFormatVersion;
            this.yamlishJson["Resources"] = {};
        }

        /*
  GetFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.get
      Runtime: nodejs6.10
      CodeUri: s3://bucket/api_backend.zip
      Policies: AmazonDynamoDBReadOnlyAccess
      Environment:
        Variables:
          TABLE_NAME: !Ref Table
      Events:
        GetResource:
          Type: Api
          Properties:
            Path: /resource/{resourceId}
            Method: get

         */
        SamGenerator.prototype.addLambda = function (endpoint) {
            this.yamlishJson["Resources"][endpoint.getGeneratedFunctionName()] = {
                Type:"AWS::Serverless::Function",
                Properties:{
                    Handler: "app.handleCall",
                    Runtime: this.nodeRuntime,
                    Policies: endpoint.getRequiredAWSPolicies(),
                    Events:{
                        GetResources:{
                            Type: "Api",
                            Properties:{
                                Path: endpoint.getFullPath(),
                                Method: endpoint.getCommand()
                            }
                        }
                    }
                }
            };
        };

        SamGenerator.prototype.writeToFile = function(fileName){
            yaml.writeSync(fileName, this.yamlishJson);
        };

        return new SamGenerator(_options);
    }});