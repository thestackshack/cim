# Cloud Infrastructure Manager (CIM)
[![version](https://img.shields.io/npm/v/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![downloads](https://img.shields.io/npm/dt/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![license](https://img.shields.io/npm/l/cim.svg?maxAge=360)](https://github.com/claudiajs/cim/blob/master/LICENSE)
[![dependencies](https://img.shields.io/david/thestackshack/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)

[![](https://nodei.co/npm/cim.svg?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/cim)

CIM takes the pain out of Infrastructure as Code and CloudFormation! 

The importance of IaC has increased, due to the rise in popularity of cloud functions, event driven architectures, and the number of AWS services offered.  

Logic has slowly been pulled out of our applications and into cloud service providers.  This is amazing and allows our applications to scale and be cost effective but it changes how they look and feel.

Infrastructure as Code is just as important, or more important, than the code itself.  Implementing IaC at the onset of a new project is a must.  But don't worry, CIM is here to help.  

 - CIM makes it easy to create, update, and delete stacks
 - CIM allows you to create nested stacks
 - CIM helps organize stack input parameters
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

For examples see the [templates](#templates-1).

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
The _cim.yml file is where details about your stack are stored.  Lets take a look at base template.

## Basic
```
version: 0.1
stack:
  name: 'base'
  template:
    file: 'cloudformation.yml'
    bucket: 'base-templates'
```

The stack `name` will be used when creating your CloudFormation stack.  Shen you view all your CloudFormation stacks through the AWS console, this will be the name.  
A lot of the AWS resources created within this stack will also have this name as a prefix within their name.

The `template` defines the local CloudFormation `file` to use for this stack.  When calling CloudFormation the CloudFormation file needs to be on S3.  The S3 `bucket` is where CIM stores the CloudFormation file prior to calling CloudFormation.

## Parent stacks
In most cases you will have multiple stacks, and these stacks will be nested.  For example, lets say you have a `base` stack for your VPC and other shared resources, and then a stack for your api application.  Your project structure might look like:
```
/iac
    /base
        - _cim.yml
        - cloudformation.yml
    /api-app
        - _cim.yml
        - cloudformation.yml
```
Through the use of the `parents` field you can reference and reuse items in a parent stack.  In our api app example we reuse the parent stack name and template bucket.  
```
version: 0.1
stack:
  name: '${stack.parents.base.stack.name}-api'
  template:
    file: 'cloudformation.yml'
    bucket: '${stack.parents.base.stack.template.bucket}'
  parents:
    base: '../base'
```
You can reference multiple `parents` by key.

## Parameters
The `parameters` field is used to define the input parameter values sent to CloudFormation during a [stack-up](#stack-up) command.

Continuing our example above lets say we also want to pass in the base stack name as an input parameter for cross stack parameter referencing.
```
version: 0.1
stack:
  name: '${stack.parents.base.stack.name}-api'
  template:
    file: 'cloudformation.yml'
    bucket: '${stack.parents.base.stack.template.bucket}'
  parents:
    base: '../base'
  parameters:
    BaseStackName: '${stack.parents.base.stack.name}'
```

## Capabilities
If you have IAM resources, you can specify either capability. If you have IAM resources with custom names, you must specify CAPABILITY_NAMED_IAM. If you don't specify this parameter, this action returns an InsufficientCapabilities error.

Valid Values: CAPABILITY_IAM | CAPABILITY_NAMED_IAM
Continuing our example above lets say we also want to pass in the base stack name as an input parameter for cross stack parameter referencing.
```
version: 0.1
stack:
  name: '${stack.parents.base.stack.name}-api'
  template:
    file: 'cloudformation.yml'
    bucket: '${stack.parents.base.stack.template.bucket}'
  parents:
    base: '../base'
  parameters:
    BaseStackName: '${stack.parents.base.stack.name}'
  capabilities:
    - 'CAPABILITY_IAM'
```

## Tags
Tags are used to not only tag your CloudFormation stack but to also tag all resources created by the stack given that those resources support tags.
```
version: 0.1
stack:
  name: '${stack.parents.base.stack.name}-api'
  template:
    file: 'cloudformation.yml'
    bucket: '${stack.parents.base.stack.template.bucket}'
  parents:
    base: '../base'
  parameters:
    BaseStackName: '${stack.parents.base.stack.name}'
  capabilities:
    - 'CAPABILITY_IAM'
  tags:
    app: 'api-app'
    owner: 'John Doe'
```

## Stage
The `stage` object is used to override any part of the configuration file what that `--stage` is used as a command line option.  For example if we have the following dev stage:
```
version: 0.1
stack:
  name: 'base-prod'
  template:
    file: 'cloudformation.yml'
    bucket: 'base-templates'
  parameters:
    param1: 'prod-param'
stage:
  dev:
    stack:
      name: 'base-dev'
      parameters:
        param1: 'dev-param'
```

Now when we use the `--stage=dev` command line option, our stack name will be 'base-dev' and our param1 will be 'dev-param'.  Any field can be overridden.    

## opt
You can reference any other field in the config file and use it in a variable.
```
version: 0.1
stack:
  name: 'base-prod'
  template:
    file: 'cloudformation.yml'
    bucket: 'base-templates'
  parameters:
    param1: '${opt.stack.name}'
```
## env
You can reference any environment var in the config file and use it in a variable.
```
version: 0.1
stack:
  name: 'base-prod'
  template:
    file: 'cloudformation.yml'
    bucket: 'base-templates'
  parameters:
    param1: '${env.param1}'
```
## kms.decrypt
You can include any kms encrypted string (base64 encoded) and CIM will decrypt prior to running the commend.
```
version: 0.1
stack:
  name: 'base-prod'
  template:
    file: 'cloudformation.yml'
    bucket: 'base-templates'
  parameters:
    param1: '${kms.decrypt(<kms encrypted and bas64 encoded string)}'
```

## Lambda
If your stack includes one or more lambda's you can add the `lambda` section to your _cim.yml to enable Lambda support ([lambda-deploy](#lambda-deploy), [lambda-logs](#lambda-logs)).

In this example we have two Lambda functions.  The `function_name` will be an output param from our stack.  The `alias` is used by the [lambda-deploy](#lambda-deploy) and [lambda-logs](#lambda-logs) commands to specify a single function.

The `deploy` section which is broken up into two parts is used by the [lambda-deploy](#lambda-deploy) command.
- `pre_deploy` Install any dependencies, run the tests, and package the Lambda zip for deployment.
- `post_deploy` Tear down any leftover artifacts from the `pre_deploy` phase.

The Lambda zip that is packaged in the `pre_deploy` phase must match the `zip_file` under each function.  When a function is deployed it uses the `zip_file` as the deployment artifact.
```
lambda:
  functions:
    -
      alias: hello
      function_name: ${stack.outputs.LambdaFunction}
      zip_file: index.zip
    -
      alias: second
      function_name: ${stack.outputs.LambdaFunctionSecond}
      zip_file: index.zip
  deploy:
    phases:
      pre_deploy:
        commands:
          # Install all npm packages including dev packages.
          - npm install

          # Run the tests
          # - npm test

          # Remove all the npm packages.
          - rm -Rf node_modules

          # Only install the non-dev npm packages.  We don't want to bloat our Lambda with dev packages.
          - npm install --production

          # Zip the Lambda for upload to S3.
          - zip -r index.zip .
      post_deploy:
        commands:
          # Remove the zip file.
          - rm -Rf index.zip

          # Reinstall the dev npm packages.
          - npm install
```

# Templates
The templates are using when [creating](#create) a new package.
```
cim create --template=<template>
```

| Name | Description |
| --- | --- |
| [cloudformation](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/CloudFormation/template) | Basic setup. |
| [serverless-web-app](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/ServerlessWebApp/template) | Static S3 website with SSL, CDN, and CI/CD. |
| [serverless-api](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/ServerlessApi/template) | API Gateway proxying calls to a Lambda backend. Optional custom domain.  |
| [lambda-node](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/template) | A single Lambda function. |
| [lambda-node-s3](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/s3/template) | A single Lambda function with an S3 event trigger. |
| [lambda-node-dynamodb](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/dynamodb/template) | A single Lambda function with a DynamoDB stream event trigger. |
| [lambda-node-kinesis](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/kinesis/template) | A single Lambda function with a Kinesis stream event trigger. |
| [lambda-node-sns](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/sns/template) | A single Lambda function with an SNS event trigger. |
| [lambda-node-cloudwatch-cron](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/cloudwatch-cron/template) | A single Lambda function with a scheduled CloudWatch cron event trigger. |
| [lambda-node-cloudwatch-logs](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/Lambda/nodejs/cloudwatch-logs/template) | A single Lambda function with a CloudWatch Logs event trigger. |

# Plugin Framework
Do you want to create additional CIM commands?  Or do you want to create `before` and `after` hooks for any CIM command?  Or do you just want to create a new template?

There are two ways to contribute to CIM:
1. Add a new [Plugin](https://github.com/thestackshack/cim/tree/master/lib/plugins) and create a PR.
2. Create your own 3rd party CIM plugin.  Here is an [example](https://github.com/thestackshack/cim/tree/master/test/resources/3rd-party-plugin).  Install these plugins globally.  CIM searches the global npm directory for packages starting with `cim-` or `cim_`.

# Coming soon...
- Add cloudformation change set.  createChangeSet, executeChangeSet.
- Add additional cloudformation parameters to _cim.yml and the subsequent calls to createStack and updateStack (http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createStack-property).
- Add multiple CloudFormation scripts per package?  Maybe...
