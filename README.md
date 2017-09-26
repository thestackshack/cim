# Cloud Infrastructure Manager (CIM)
[![version](https://img.shields.io/npm/v/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![downloads](https://img.shields.io/npm/dt/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![license](https://img.shields.io/npm/l/cim.svg?maxAge=360)](https://github.com/claudiajs/cim/blob/master/LICENSE)
[![dependencies](https://img.shields.io/david/thestackshack/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)

CIM takes the pain out of Infrastructure as Code and CloudFormation! 

The importance of IaC has increased, due to the rise in popularity of cloud functions, event driven architectures, and the number of AWS services offered.  

Logic has slowly been pulled out of our applications and into cloud service providers.  This is amazing and allows our applications to scale and be cost effective but it changes how they look and feel

Infrastructure as Code is just as important, or more important, than the code itself.  Implementing IaC at the onset of a new project is a must.  But don't worry, CIM is here to help.  

 - CIM makes it easy to create, update, and delete stacks
 - CIM allows you to create nested stacks
 - CIM helps organize stack inputs (parameters)
 - CIM provides templates to help you get started
 - CIM has support for Lambda functions
 - CIM has an extensible Plugin framework

Easily create your stack, build and deploy your code, and view your logs.

Table of contents:
- [Usage](#usage)
- [Setup](#setup)
- [Commands](#commands)
- [Config (_cim.yml)](#_cimyml)
- [Templates](#templates-1)
- [Plugin Framework](#plugin-framework)

# Usage

```
# Install CIM
npm install cim -g

# See the available templates
cim templates

# Create your first stack using the lambda template
mkdir app
cd app
cim create --template=lambda-node

# Deploy your stack
cim stack-up

# Deploy your code
cim lambda-deploy

# View logs
cim lambda-logs --alias=hello --tail=true

# Delete you stack
cim stack-delete
```

# Setup
## Prerequisites
- [Configure your AWS keys](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html#getting-started-nodejs-configure-keys)
- [Install node and npm](https://nodejs.org/en/download/current/) 
## Install CIM
Use npm to install CIM globally.
```
npm install cim -g
```

# Commands
- [create](#create)
- [templates](#templates)
- [stack-up](#stack-up)
- [stack-show](#stack-show)
- [stack-delete](#stack-delete)
- [lambda-deploy](#lambda-deploy)
- [lambda-logs](#lambda-logs)
- [help](#help)
## create
Create a new CIM package based on a give [template](#templates-1).

At minimum a CIM package contains the following files:
- [A CloudFormation script (cloudformation.yml)](https://aws.amazon.com/documentation/cloudformation/)
- [A CIM file (_cim.yml)](#_cimyml)
### Usage
```
mkdir app
cd app
cim create --template=<template>
```
Where `<template>` is equal to one of the templates from `cim templates`.

### Options
- `--template`: The name of a [template](#templates-1).
  - _ex. --template=lambda-node_
- `--dir`: (optional) The directory where you wish the new package to be.
  - _ex. --dir=/app_

## templates
View all the available templates.  Templates are used in the `create` command.
### Usage
```
cim templates
```
## stack-up
Create or update your stack.  Sends a create or update command to CloudFormation using the properties defined in your [_cim.yml](#_cimyml).
### Usage
```
cim stack-up {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--recursive`: (optional) Recursively search for nested stacks to create or update.  Any nested directory with a valid [_cim.yml](#_cimyml) file.  Default is 'false'.
  - _ex. --recursive=true_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_
## stack-show
Show all the details about your CloudFormation stack.  Helper method to see the status of your stack.
### Usage
```
cim stack-show {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--recursive`: (optional) Recursively search for nested stacks to create or update.  Any nested directory with a valid [_cim.yml](#_cimyml) file.  Default is 'false'.
  - _ex. --recursive=true_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_
## stack-delete
Delete your stack.  Sends a delete command to CloudFormation using the properties defined in your [_cim.yml](#_cimyml).
### Usage
```
cim stack-delete {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--recursive`: (optional) Recursively search for nested stacks to create or update.  Any nested directory with a valid [_cim.yml](#_cimyml) file.  Default is 'false'.
  - _ex. --recursive=true_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_
## lambda-deploy
Deploy you Lambda functions.
### Usage
```
cim lambda-deploy {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--recursive`: (optional) Recursively search for nested stacks to deploy.  Any nested directory with a valid [_cim.yml](#_cimyml) file.  Default is 'false'.
  - _ex. --recursive=true_
- `--alias`: (optional) Restrict to a single Lambda function by its [alias](#alias).
  - _ex. --alias=function1_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_
## lambda-logs
Show the CloudWatch Logs for a single Lambda function.
### Usage
```
cim lambda-logs {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--alias`: Restrict to a single Lambda function by its [alias](#alias).
  - _ex. --alias=function1_
- `--tail`: (optional) Tail the logs.  Default is false.
  - _ex. --tail=true_
- `--startTime`: (optional) Start fetching logs from this time.  Time in minutes.  Ex. '30s' minutes ago.  Default is '30s'.
  - _ex. --startTime=30s_
- `--internal`: (optional) Interval, in milliseconds, between calls to CloudWatch Logs when using 'tail'.  Default is 5000.
  - _ex. --internal=5000_
- `--filterPattern`: (optional) [CloudWatch Logs filter pattern](http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html).
  - _ex. --filterPattern=ERROR_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_
## help
### Usage
View all the available commands.
```
cim help
```
View a single command.
```
cim <command> --help
```

# _cim.yml

# Templates

# Plugin Framework


# TODO
- Add all lambda event triggers as templates
- Add multiple CloudFormation scripts per package
