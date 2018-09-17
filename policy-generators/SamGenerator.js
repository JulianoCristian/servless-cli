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

require('underscore').extend(module.exports, {newInst: function init(_options){
        function SamGenerator(config) {
            this.region = config.region;
            this.nodeRuntime =  config.nodeRuntime;
            this.yamlishJson = {};
            this.yamlishJson["AWSTemplateFormatVersion"] = '2010-09-09';
            this.yamlishJson["Transform"] = 'AWS::Serverless-2016-10-31';
            this.yamlishJson["Resources"] = {};
        }

        SamGenerator.prototype.addLambda = function (theEvent) {
            this.yamlishJson["Resources"][theEvent.getNameForEvent()] = theEvent.getJSONForEvent();
        };

        SamGenerator.prototype.addResource = function (theResource) {
            if(theResource.getNameForResource() !== null){
                this.yamlishJson["Resources"][theResource.getNameForResource()] = theResource.getJSONForResource();
            }
        };

        SamGenerator.prototype.writeToFile = function(fileName){
            yaml.writeSync(fileName, this.yamlishJson);
        };

        return new SamGenerator(_options);
    }});