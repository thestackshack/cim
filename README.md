# Cloud Infrastructure Manager (CIM)
[![version](https://img.shields.io/npm/v/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![downloads](https://img.shields.io/npm/dt/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)
[![license](https://img.shields.io/npm/l/cim.svg?maxAge=360)](https://github.com/claudiajs/cim/blob/master/LICENSE)
[![dependencies](https://img.shields.io/david/thestackshack/cim.svg?maxAge=360)](https://www.npmjs.com/package/cim)

CIM takes the pain out of Infrastructure as Code and CloudFormation! 

The importance of IaC has increased, due to the rise in popularity of cloud functions, event driven architectures, and the number of AWS services offered.  
Logic has slowly been pulled out of our applications and into cloud service providers.  This is amazing and allows our applications to scale and be cost effective but it changes how they look and feel
Infrastructure as Code is just as important, or more important, than code itself.  
Implementing IaC at the onset of a new project is now a must.  But don't worry, CIM is here to help.  

Tell me more about CIM.
 - CIM makes it easy to create, update, delete stacks
 - CIM allows you to create nested stacks
 - CIM helps organize stack inputs (parameters)
 - CIM provides templates to help you get started
 - CIM has support for Lambda functions
 - CIM has an extensible Plugin framework

Easily create your stack, build and deploy your code, and view your logs.

Example usage:

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

## Setup
### Prerequisites
- [Configure your AWS keys](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html#getting-started-nodejs-configure-keys)
- [Install node and npm](https://nodejs.org/en/download/current/) 
### Install CIM
Use npm to install CIM globally.
```
npm install cim -g
```

## Commands
### create
Create a new CIM package based on a give [template](#Templates).
#### Usage
```
mkdir app
cd app
cim create --template=<template>
```
Where `<template>` is equal to one of the templates from `cim templates`.

#### Options
- `--template`: 

### templates
View all the available templates.  Templates are used in the `create` command.
```
cim templates
```
### stack-up
### stack-show
### stack-delete
### lambda-deploy
### lambda-logs
### help
View all the available commands.
```
cim help
```

## Templates

## Plugin Framework


## TODO
- Add all lambda event triggers as templates
- Ability to add 3rd party plugins to extend CIM
