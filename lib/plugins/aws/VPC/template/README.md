# VPC
Modular and scalable virtual networking foundation on the AWS Cloud.

[![](quickstart-vpc-design-fullscreen.png)](quickstart-vpc-design-fullscreen.png)

More information about this VPC template can be found here:  https://aws.amazon.com/quickstart/architecture/vpc/  

## Setup
1. If you don't already have an AWS account, create one at http://aws.amazon.com by following the on-screen instructions. Part of the sign-up process involves receiving a phone call and entering a PIN using the phone keypad.
2. Open the AWS Console and select your Region.
3. Create a key pair in your preferred region. To do this, in the navigation pane of the Amazon EC2 console, choose Key Pairs, Create Key Pair, type a name, and then choose Create.
4. Populate the `_cim.yml` file with your key pair and availablity zones.
5. Launch your stack `cim stack-up`.