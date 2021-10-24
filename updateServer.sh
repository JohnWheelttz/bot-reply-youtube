#!/usr/bin/bash

sudo ssh -i ~/Downloads/troll.pem admin@ec2-18-228-220-160.sa-east-1.compute.amazonaws.com << EOF
    cd
    rm -rf dist
EOF

sudo scp -i ~/Downloads/troll.pem -r dist admin@ec2-18-228-220-160.sa-east-1.compute.amazonaws.com:/home/admin

sudo ssh -i ~/Downloads/troll.pem admin@ec2-18-228-220-160.sa-east-1.compute.amazonaws.com << EOF
    cd
    cd ./dist
    npm i
EOF
