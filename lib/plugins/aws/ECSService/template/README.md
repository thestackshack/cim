# AWS EC2 Docker Container Service Example
See the [Services Stack](https://github.com/thestackshack/services-stack) example to see how the VPC, ECR, ECS, and this Service example all fit together.
## Push Image
- [Registry Authentication](http://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html#registry_auth)
  - `aws ecr get-login --registry-ids <account-id>`
  - copy/past output to perform docker login,  also append `/services-stack/service1` to the repository url.
- Build Image
  - `docker build -t service1:<version> .`
- [Push Image](http://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html)
  - `docker tag service1:<version> <account-id>.dkr.ecr.<region>.amazonaws.com/services-stack/service1`
  - `docker tag service1:<version> <account-id>.dkr.ecr.<region>.amazonaws.com/services-stack/service1:<version>`
  - `docker push <account-id>.dkr.ecr.<region>.amazonaws.com/services-stack/service1`

## Update Version
Make sure the `Version` parameter, in _cim.yml, matches the `version` tag from above.  The ECS Task Definition will pull the image from ECR.

Once the `Version` is set you can use `cim stack-up` to update the stack with the new version.
