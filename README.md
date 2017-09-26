# Cloud Infrastructure Manager (CIM)
CIM is your AWS Cloud Infrastructure Manager.  Easily manage your Infrastructure as Code (IaC).  

The importance of IaC has increased due to the rise in popularity of cloud functions, event driven architectures, and the number of AWS services offered.
Implementing IaC at the onset of a new project is now a requirement.

CIM takes the pain out of CloudFormation scripts by providing:
 - Nested CloudFormation script support
 - CloudFormation parameter management
 - CloudFormation templates to help you get started
 - Lambda Support

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
Create a new CIM package based on a give `template`.
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


## Plugin Framework


## TODO
- Add all lambda event triggers as templates
- Ability to add 3rd party plugins to extend CIM
