# Cloud Infrastructure Manager (CIM)
CIM is your AWS Cloud Infrastructure Manager.  

Easily create your stack, build and deploy your code, monitor performance, and view logs.

BETA - Still under active development.

```
# Install CIM
npm install cim -g

# Create your first stack using the lambda template
mkdir app
cim create --template=lambda-nodejs

# Deploy your stack
cim stackup

# Deploy your code
cim deploy

# Delete you stack
cim delete
```

## Templates
 - stack, Default CloudFormation setup.
 - lambda-nodejs, Node.js Lambda example setup.

 More stacks will be created.
