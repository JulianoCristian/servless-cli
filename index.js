#!/usr/bin/env node
const fs = require("fs");
const chalk = require("chalk");
const configTemplate = require("./templates/config.json");
const CreateCommands = require("./CreateCommands").inject({configTemplate: configTemplate});
const GenerateCommands = require("./GenerateCommands").inject();
const program = require('commander');
const path = require('path');
const awsPoliciesNoInst = require('./AwsPolicies');
const Promise = require("bluebird");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
        //servless.getRemotePolicies();
    });

program
    .command('package')
    .description('generates the appropriate files to allow this app to be uploaded to AWS')
    .action(() => {
        let theGenerator = require("./policy-generators/SamGenerator").inject(require(path.join(process.cwd(), "config.json")));
        CreateCommands.validateFullDirectory(process.cwd())
            .then(results => {
                let theApp = require(path.join(process.cwd(), "app.js")).getCurrentInstance().getRoot();
                return GenerateCommands.generate(theApp, theGenerator);
            })
            .then(results => {
                theGenerator.writeToFile(path.join(process.cwd(), "template.yaml"));
                console.log(chalk.green(results));
            })
    });

function generateCLI(){
    let theGenerator = require("./policy-generators/SamGenerator").inject(require(path.join(process.cwd(), "config.json")));
    return CreateCommands.validateFullDirectory(process.cwd())
        .then(results => {
            let theApp = require(path.join(process.cwd(), "app.js")).getCurrentInstance().getRoot();
            return GenerateCommands.generate(theApp, theGenerator);
        })
        .then(results => {
            theGenerator.writeToFile(path.join(process.cwd(), "template.yaml"));
            console.log(chalk.green(results));
        });
}

program
    .command('generate')
    .description('generates the appropriate files to allow this app to be uploaded to AWS')
    .action(() => {
        generateCLI();
    });

function runCommandLine(cmd){
    console.log(cmd);
    return exec(cmd);
}

function packageCLI() {
    return runCommandLine("aws cloudformation package --template-file template.yaml --s3-bucket " +
        require(path.join(process.cwd(), "config.json")).s3DeploymentBucket  +
            " --output-template-file package.yaml");
}

program
    .command('package')
    .description('generates the appropriate files to allow this app to be uploaded to AWS')
    .action(() => {
        generateCLI()
        .then(() => {
            return packageCLI()
        })
    });

function deployCLI() {
    return runCommandLine("aws cloudformation deploy --template-file package.yaml --stack-name " +
        require(path.join(process.cwd(), "config.json")).stackName +
                " --capabilities CAPABILITY_IAM");
}

program
    .command('deploy')
    .description('generates the appropriate files to allow this app to be uploaded to AWS')
    .action(() => {
        generateCLI()
            .then(() => {
                return packageCLI()
            })
            .then(() => {
                return deployCLI()
            })
    });
program
    .command('policies [remote|needed|diff]')
    .description('Used to view and compare policies issues to this user via IAM and policies needed to run this app')
    .action(command => {
        CreateCommands.validateFullDirectory(process.cwd())
            .then(results => {
                switch (command) {
                    case "remote": {
                        let userConfig = require(path.join(process.cwd(), "config.json"));
                        let servless = awsPoliciesNoInst.inject(userConfig);

                        return servless.getRemotePolicies()
                            .then(policies => {
                                policies.forEach(elem => {
                                    console.log(chalk.green(elem))
                                });
                            });
                    } break;

                    case "needed": {
                        let userConfig = require(path.join(process.cwd(), "config.json"));
                        let theApp = require(path.join(process.cwd(), "app.js")).getCurrentInstance().getRoot();
                        let servless = awsPoliciesNoInst.inject(userConfig);

                        return servless.getLocalPolicies(theApp)
                            .then(policies => {
                                policies.forEach(elem => {
                                    console.log(chalk.green(elem))
                                });
                            });
                    } break;

                    case "diff": {
                        let userConfig = require(path.join(process.cwd(), "config.json"));
                        let theApp = require(path.join(process.cwd(), "app.js")).getCurrentInstance().getRoot();
                        let servless = awsPoliciesNoInst.inject(userConfig);

                        return servless.getLocalPolicies(theApp)
                            .bind({})
                            .then(localPolicies => {
                                this["localPolicies"] = localPolicies;
                                return servless.getRemotePolicies();
                            })
                            .then(remotePolicies => {
                                let localPolicies = this["localPolicies"];
                                this["remotePolicies"] = remotePolicies;

                                let needAndHave = localPolicies.map(elem =>{
                                    if(remotePolicies.indexOf(elem) !== -1){
                                        return elem;
                                    }
                                    else{
                                        return null;
                                    }
                                })
                                    .filter(elem => {return elem !== null});

                                let dontHaveAndNeed = localPolicies.map(elem =>{
                                    if(remotePolicies.indexOf(elem) === -1){
                                        return elem;
                                    }
                                    else{
                                        return null;
                                    }
                                })
                                    .filter(elem => {return elem !== null});


                                let haveAndDontNeed = remotePolicies.map(elem => {
                                    if(localPolicies.indexOf(elem) === -1 && elem != "IAMReadOnlyAccess"){
                                        return elem;
                                    }
                                    else{
                                        return null;
                                    }
                                })
                                    .filter(elem => {return elem !== null});


                                console.log(chalk.green("Needed Policies Already granted to your IAM user\n    " + needAndHave.join("\n    ")));
                                console.log(chalk.red("Needed Policies NOT granted to your user\n    " + dontHaveAndNeed.join("\n    ")));
                                console.log(chalk.blue("Policies your IAM user has that are not needed for this project\n    " + haveAndDontNeed.join("\n    ")));

                                return;
                            });
                    } break;

                }
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
