const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");

require('underscore').extend(module.exports, {inject: function init(_options){
    function CreateCommands(config) {
        this.config = config;
    }

    CreateCommands.prototype.validateEmptyDirectory = function (fullPath2Base) {
        return Promise.resolve()
            .then((_) =>{
                if(fs.existsSync(path.join(fullPath2Base, "config.json")) == true ||
                    fs.existsSync(path.join(fullPath2Base, "app.js")) == true){
                    throw("This directory is not empty");
                }
                return "This is an empty directory";
            })
    };

    CreateCommands.prototype.validateFullDirectory = function (fullPath2Base) {
        return this.validateEmptyDirectory(fullPath2Base)
            .then(() => {
                throw("Current directory is not a valid servless directory")
            })
            .catch(() =>{
                return "Directory is structured correctly";
            });
    };

    CreateCommands.prototype.populateDirectory = function (fullPath2Base) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(fullPath2Base, 'config.json'), JSON.stringify(this.config.configTemplate, null, 2), (err) => {
                if (err){
                    reject(err);
                }
                else{
                    resolve("Servless directory initialized!");
                }
            });
        });
    };

    return new CreateCommands(_options);
}});