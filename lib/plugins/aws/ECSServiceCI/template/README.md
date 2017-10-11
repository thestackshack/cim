# ECS Service with Continuous Integration
Use this template to add continuous integration to your ECS service.

When you push your commits CodePipeline and CodeBuild will build and deploy a new image to your ECR docker registry.

You can then deploy that new version to your service.

This project should be in its own GitHub repo.

## Setup
See the [Services Stack](https://github.com/thestackshack/services-stack) for setup instructions.

Before you `stack-up` this stack you need to push an image to your ECR.

## Stack Up
```
cim stack-up --profile=bluefin --env="version=<first-version>"
```

## Deploy new version
After you push your commits, a new image will be built and pushed to your ECR repo.  To deploy that new version to your ECS service, run the `stack-up` command with the new version.
```
cim stack-up --profile=bluefin --env="version=<new-version>"
```

## Build Notifications
You can enable build notification via the `NotificationEmail` and/or `NotificationSMS` input params.  You also need to un-comment the `sns publish` command in the buildspec.yml.

When set you will receive a notification when your new ECR images are ready.