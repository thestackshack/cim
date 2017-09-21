# Cloud Infrastructure Manager (CIM)
CIM is your AWS Cloud Infrastructure Manager.  

Easily create your stack, build and deploy your code, monitor performance, and view logs.

BETA - Still under active development.

```
# Install CIM
npm install cim -g

# See the available templates
cim templates

# Create your first stack using the lambda template
mkdir app
cim create --template=lambda-node

# Deploy your stack
cim stack-up

# Deploy your code
cim deploy-lambda

# Delete you stack
cim stack-delete
```

## Templates
 - stack, Default CloudFormation setup.
 - lambda-nodejs, Node.js Lambda example setup.

 More stacks will be created.
