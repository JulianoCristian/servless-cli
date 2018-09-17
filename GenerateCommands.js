const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");

require('underscore').extend(module.exports, {inject: function init(_options){
        function GenerateCommands(config) {
            if(config === undefined){
                config = {};
            }

            this.config = config;
        }

        GenerateCommands.prototype.generate = function (theApp, theGenerator) {
            let self = this;
                theApp.getEvents().map(elem => {
                    return theGenerator.addLambda(elem);
                });

                var resourceHash = theApp.getResources().getResourceHash();
                Object.keys(resourceHash).map(elem => {
                    return theGenerator.addResource(resourceHash[elem]);
                })
        };

        GenerateCommands.prototype._internalGenerate = function (appLevel, theGenerator, indentLevel) {
            if(appLevel.getChildren().length === 0){
                theGenerator.addLambda(appLevel);
                return "    ".repeat(indentLevel) + appLevel.getCommand()
            }
            else{
                var startStr = "";
                if(indentLevel > 0){
                    startStr = "    ".repeat(indentLevel-1)+ "->  ";
                }
                return  startStr + appLevel.getPath() + "\n" + appLevel.getChildren().map((elem, index) => {
                    return this._internalGenerate(elem, theGenerator, indentLevel + 1);
                }).join("\n");
            }
        };

        return new GenerateCommands(_options);
    }});