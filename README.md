# Cloud Infrastructure Manager (CIM)
CIM is your AWS Cloud Infrastructure Manager.  

Easily create your stack, build and deploy your code, monitor performance, and view logs.

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

## TODO
- Plugin framework
  - Internal core plugins
  - External 3rd party plugins
  - Extensions:
    - template
    - hooks
    - commands
- Add ability to see lambda logs.
- App performance
- CI/CD