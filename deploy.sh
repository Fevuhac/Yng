#!/bin/sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
nvm install v8.9.0
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install

