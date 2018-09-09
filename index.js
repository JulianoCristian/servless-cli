#!/usr/bin/env node
const fs = require("fs");
const chalk = require("chalk");
const servlessNoInst = require("servless");
const createCommands = require("./CreateCommands").inject();
const program = require('commander');
const path = require('path');

program
    .command('init')
    .description('retrieves data from AWS and displays locally')
    .action(() => {
        createCommands.validateEmptyDirectory(process.cwd())
            .then(results => {
                return createCommands.populateDirectory(process.cwd());
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
    .command('policies [remote|needed|diff]')
    .description('Used to view and compare policies issues to this user via IAM and policies needed to run this app')
    .action(command => {
        createCommands.validateFullDirectory(process.cwd())
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
