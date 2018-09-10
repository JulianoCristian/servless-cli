#!/usr/bin/env node
const fs = require("fs");
const chalk = require("chalk");
const configTemplate = require("./templates/config.json");
const CreateCommands = require("./CreateCommands").inject({configTemplate: configTemplate});
const GenerateCommands = require("./GenerateCommands").inject();
const program = require('commander');
const path = require('path');

program
    .command('init')
    .description('retrieves data from AWS and displays locally')
    .action(() => {
        CreateCommands.validateEmptyDirectory(process.cwd())
            .then(results => {
                return CreateCommands.populateDirectory(process.cwd());
            })
            .then(results => {
                console.log(chalk.green(results));
            })
            .catch(err =>
            {
                console.log(chalk.red(err));
            })
        //servless.getPolicies();
    });

program
    .command('generate [sam|yaml]')
    .description('generates the appropriate files to allow this app to be uploaded to AWS')
    .action(() => {
        let theGenerator = require("./policy-generators/SamGenerator").inject(require(path.join(process.cwd(), "config.json")));
        CreateCommands.validateFullDirectory(process.cwd())
            .then(results => {
                let theApp = require(path.join(process.cwd(), "app.js")).getRoot();
                return GenerateCommands.generate(theApp, theGenerator);
            })
            .then(results => {
                theGenerator.writeToFile(path.join(process.cwd(), "template.yaml"));
                console.log(chalk.green(results));
            })
        //servless.getPolicies();
    });

program
    .command('policies [remote|needed|diff]')
    .description('Used to view and compare policies issues to this user via IAM and policies needed to run this app')
    .action(command => {
        CreateCommands.validateFullDirectory(process.cwd())
            .then(results => {
                let servless = servlessNoInst(require(path.join(process.cwd(), "config.json")));
                switch (command) {
                    case "remote": {
                        return servless.getPolicies()
                            .then(policies => {
                                policies.forEach(elem => {
                                    console.log(chalk.green(elem))
                                });
                            });
                    } break;
                }
            })
            .catch(err => {
                console.log(chalk.red(err));
            })
    });

program
    .command('sync')
    .description('(re)generates files needed to sync correctly with AWS')
    .action(() => {
        servless.getPolicies();
    });


program
    .parse(process.argv);
