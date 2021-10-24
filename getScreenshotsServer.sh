#!/usr/bin/bash

rm -rf ./screenshots/login_0.png ./screenshots/login_1.png

sudo scp -i ~/Downloads/troll.pem admin@ec2-18-228-220-160.sa-east-1.compute.amazonaws.com:/home/admin/dist/login_0.png admin@ec2-18-228-220-160.sa-east-1.compute.amazonaws.com:/home/admin/dist/login_1.png ./screenshots

sudo ssh -i ~/Downloads/troll.pem admin@ec2-18-228-220-160.sa-east-1.compute.amazonaws.com \ rm -rf dist/login_0.png dist/login_1.png
