# ECR
Creates the ECR repository for each service.

For each `service` you will need to create a `AWS::ECR::Repository` within the cloudformation.yml.

The `Service1RepositoryUrl` output parameter is used when uploading docker images.  An image is required prior to deploying the `ecs` stack.

You also need to update the `policy` for each Repository.  Give permission to only those users who need it.

See the [Services Stack](https://github.com/thestackshack/services-stack) example to see how the VPC, ECR, ECS, and this Service example all fit together.
