#!/usr/bin/env node
const fs = require("fs");
const chalk = require("chalk");
const servless = require("servless");
const createCommands = require("./createCommands").inject();
const program = require('commander');

program
    .command('init')
    .description('retrieves data from AWS and displays locally')
    .action(() => {
        createCommands.validateEmptyDirectory(process.cwd())
            .then((results) => {
                return createCommands.populateDirectory(process.cwd());
            })
            .then((results) => {
                console.log(chalk.green(results));
            })
            .catch((err) =>
            {
                console.log(chalk.red(err));
            })
        //servless.getPolicies();
    });

program
    .command('sync')
    .description('(re)generates files needed to sync correctly with AWS')
    .action(() => {
        console.log(process.cwd());
        //servless.getPolicies();
    });


program
    .parse(process.argv);
