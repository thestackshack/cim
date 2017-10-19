# Cloud Infrastructure Manager (CIM)
[![version](https://img.shields.io/npm/v/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![downloads](https://img.shields.io/npm/dt/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![license](https://img.shields.io/npm/l/cim.svg?maxAge=360)](https://github.com/claudiajs/cim/blob/master/LICENSE)
[![dependencies](https://img.shields.io/david/thestackshack/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)

[![](https://nodei.co/npm/cim.svg?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/cim)

CIM takes the pain out of Infrastructure as Code and CloudFormation!

CIM is a simple command line utility that bootstraps your CloudFormation CRUD operations, making them easier to execute, repeatable, and less error-prone. CIM separates out the stack template (YAML file) from the stack configuration (CLI options) so both can be stored safely in your project and executed again-and-again for stack updates. 

CIM is not a CloudFormation abstraction. 

So what’s the problem? Why did you build CIM? The problem I was having with the AWS CloudFormation cli was remembering the exact cli options used in previous executions.  Plus I wanted support for things like nested stacks, variable resolution, environments, encryption, Lambda deployments, etc…

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
cim lambda-logs --function=<function-name> --tail=true

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
- [lambda-publish](#lambda-publish)
- [lambda-versions](#lambda-versions)
- [lambda-prune](#lambda-prune)
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
Deploy your Lambda functions.

If `alias` and `version` are used then `alias` is simply updated to point to the specified `version`.  Read more about Versions and Aliases [here](#versions-and-aliases).

If `alias` and `version` are omitted then a new version of the code is uploaded and the '$LATEST' alias is updated to point to this new version.

### Usage
```
cim lambda-deploy {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--recursive`: (optional) Recursively search for nested stacks to deploy.  Any nested directory with a valid [_cim.yml](#_cimyml) file.  Default is 'false'.
  - _ex. --recursive=true_
- `--function`: (optional) Restrict to a single Lambda function by its name.
  - _ex. --function=function1_
- `--alias`: (optional) Deploys the `version` to this `alias` below.
  - _ex. --alias=PROD_
- `--version`: (optional) Deploys this `version` to the `alias` above.
  - _ex. --version=2_
- `--prune`: (optional) Deletes all unused versions.  Defaults to 'false'.
  - _ex. --prune=true_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_

### Versions and Aliases
AWS recommends using Lambda [Versions and Aliases](http://docs.aws.amazon.com/lambda/latest/dg/versioning-aliases.html) in production.  This is not required though

Here is an example CloudFormation template that uses a Lambda version and alias.  The alias is then used by the S3 trigger.  

```
  #
  # Our Lambda function.
  #
  LambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: index.handler
      Timeout: 5
      Role:
        Fn::GetAtt:
          - IamRoleLambdaExecution
          - Arn
      Code:
        ZipFile: !Sub |
          'use strict';

          exports.handler = function(event, context) {
              console.log(JSON.stringify(event));
              context.succeed('Hello CIM!');
          };
      Runtime: nodejs6.10

  #
  # Version 1 of our function.
  #
  LambdaFunctionVersion:
    Type: AWS::Lambda::Version
    Properties:
      FunctionName: !Ref LambdaFunction

  #
  # 'PROD' Alias -> Version 1
  #
  LambdaFunctionAlias:
    Type: AWS::Lambda::Alias
    Properties:
      FunctionName: !Ref LambdaFunction
      FunctionVersion: !GetAtt LambdaFunctionVersion.Version
      Name: 'PROD'

  #
  # S3 bucket
  #
  S3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName:
        Fn::Join:
          - ''
          - - !Ref AWS::StackName
            - '-s3'
      AccessControl: 'Private'
      NotificationConfiguration:
        LambdaConfigurations:
          -
            Function: !Ref LambdaFunctionAlias
            Event: 's3:ObjectCreated:*'
            Filter:
              S3Key:
                Rules:
                  -
                    Name: suffix
                    Value: .jpg
```

Here is the [_cim.yml](#_cimyml) `lambda` section that uses the Alias:
```
lambda:
  functions:
    -
      function: ${stack.outputs.LambdaFunction}
      aliases:
        PROD: ${stack.outputs.LambdaFunctionAlias}
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

We can now deploy additional versions to our Lambda without affecting the `PROD` alias.  Once we have tested our code and are ready to go live we simply update the `PROD` alias to point to the new version.

Don't forget to `prune` your unused versions so you don't run out of space.

If you decide to use versions and aliases your deployment becomes two steps.

Deployment with versions and aliases:
- `cim lambda-publish`
- `cim lambda-deploy --alias=<alias> --version=<version>`

Deployment without versions and aliases:
- `cim lambda-deploy`

## lambda-publish
Publish a new `version` of this function.
### Usage
```
cim lambda-publish {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--function`: (optional) Restrict to a single Lambda function by its name.
  - _ex. --function=function1_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_

## lambda-versions
Show all the lambda function versions and associated aliases.
### Usage
```
cim lambda-versions {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--function`: (optional) Restrict to a single Lambda function by its name.
  - _ex. --function=function1_
- `--stage`: (optional) Create or update the stack(s) using the give [stage](#stage).
  - _ex. --stage=prod_
- `--profile`: (optional) Your [AWS credentials profile](https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/).
  - _ex. --profile=prod_aws_account_

## lambda-prune
Delete one or more unused `version`'s of this function.
### Usage
```
cim lambda-prune {OPTIONS}
```
### Options
- `--dir`: (optional) The directory to run this command in.  Defaults to the current directory.
  - _ex. --dir=/app_
- `--function`: (optional) Restrict to a single Lambda function by its name.
  - _ex. --function=function1_
- `--version`: (required) Deletes this `version`.  Set to 'all' to delete all unused versions.
  - _ex. --version=2 or --version=all_ 
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
- `--function`: Restrict to a single Lambda function by its name.
  - _ex. --function=function1_
- `--tail`: (optional) Tail the logs.  Default is false.
  - _ex. --tail=true_
- `--startTime`: (optional) Start fetching logs from this time.  Time in minutes.  Ex. '30s' minutes ago.  Default is '30s'.
  - _ex. --startTime=30s_
- `--internal`: (optional) Interval, in milliseconds, between calls to CloudWatch Logs when using 'tail'.  Default is 5000.
  - _ex. --internal=5000_
- `--filterPattern`: (optional) [CloudWatch Logs filter pattern](http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html).
  - _ex. --filterPattern=ERROR_
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

## Policy and PolicyDuringUpdate
CIM supports both the `Policy` and `PolicyDuringUpdate` CloudFormation params.
```
version: 0.1
stack:
  name: 'test'
  template:
    file: 'cloudformation.yml'
    bucket: 'test-bucket'
  policy:
    file: 'policy.json'
    bucket: 'test-bucket'
  policyDuringUpdate:
    file: 'policyDuringUpdat'
    bucket: 'test-bucket'
```

For more information about `Policy` and `PolicyDuringUpdate` see here: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/protect-stack-resources.html#protect-stack-resources-modifying

## All CloudFormation Params
All AWS SDK CloudFormation [createStack](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createStack-property) and [updateStack](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#updateStack-property) params are supported.  If you add them to your _cim.yml config file they will be used when creating and updating your stack.

- Capabilities
- RollbackConfiguration
- DisableRollback
- TimeoutInMinutes
- NotificationARNs
- ResourceTypes
- RoleARN
- OnFailure
- EnableTerminationProtection

## Stage
The `stage` object is used to override any part of the configuration file when that `--stage` is used as a command line option.  For example if we have the following dev stage:
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
You can reference any cli option and use it in a variable.

For example, we use the `profile` cli option in this command below: `cim stack-up --profile=bluefin`
```
version: 0.1
stack:
  name: 'base-prod'
  template:
    file: 'cloudformation.yml'
    bucket: 'base-templates'
  parameters:
    param1: '${opt.profile}'
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

In this example we have two Lambda functions.  The `function` will be an output param from our stack.  The `function` is used by the [lambda-deploy](#lambda-deploy) and [lambda-logs](#lambda-logs) commands to specify a single function.

The `deploy` section which is broken up into two parts is used by the [lambda-deploy](#lambda-deploy) command.
- `pre_deploy` Install any dependencies, run the tests, and package the Lambda zip for deployment.
- `post_deploy` Tear down any leftover artifacts from the `pre_deploy` phase.

The Lambda zip that is packaged in the `pre_deploy` phase must match the `zip_file` under each function.  When a function is deployed it uses the `zip_file` as the deployment artifact.
```
lambda:
  functions:
    -
      function: ${stack.outputs.LambdaFunction}
      zip_file: index.zip
    -
      function: ${stack.outputs.LambdaFunctionSecond}
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

Lambda versions and aliases are also supported.  If your cloudformation template includes an alias, you can include it in your `_cim.yml` file like so:

```
lambda:
  functions:
    -
      function: ${stack.outputs.LambdaFunction}
      aliases:
        PROD: ${stack.outputs.LambdaFunctionProdAlias}
      zip_file: index.zip
```

Use the [lambda-publish](#lambda-publish) and [lambda-unpublish](#lambda-unpublish) commands to upload and delete new versions.

The [lambda-deploy](#lambda-deploy) command can be used to deploy new versions, by updating the alias to point to the specified version.

# Templates
The templates are used when [creating](#create) a new package.
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
| [vpc](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/VPC/template) | VPC - Modular and scalable virtual networking foundation on the AWS Cloud. |
| [ecr](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/ECR/template) | ECR - AWS Docker Container Registry. |
| [ecs](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/ECS/template) | ECS - AWS EC2 Docker Container Service. |
| [ecs-service](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/ECSService/template) | Example ECS Service. |
| [ecs-service-ci](https://github.com/thestackshack/cim/tree/master/lib/plugins/aws/ECSService/template) | Example ECS Service with continuous integration. |

# Plugin Framework
Do you want to create additional CIM commands?  Or do you want to create `before` and `after` hooks for any CIM command?  Or do you just want to create a new template?

There are two ways to contribute to CIM:
1. Add a new [Plugin](https://github.com/thestackshack/cim/tree/master/lib/plugins) and create a PR.
2. Create your own 3rd party CIM plugin.  Here is an [example](https://github.com/thestackshack/cim/tree/master/test/resources/3rd-party-plugin).  Install these plugins globally.  CIM searches the global npm directory for packages starting with `cim-` or `cim_`.

# Coming soon...
- Add cloudformation change set.  createChangeSet, executeChangeSet.
- Add multiple CloudFormation scripts per package?  Maybe...
- Add genaric logs command to support all log groups, not just Lambda's.
