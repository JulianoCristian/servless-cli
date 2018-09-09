const fs = require("fs");
const path = require("path");
const configTemplate = require("./templates/config.json");

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

    CreateCommands.prototype.populateDirectory = function (fullPath2Base) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(fullPath2Base, 'config.json'), JSON.stringify(configTemplate, null, 2), (err) => {
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