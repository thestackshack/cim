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

## TODO
- Add all lambda event triggers as templates
- Ability to add 3rd party plugins to extend CIM
