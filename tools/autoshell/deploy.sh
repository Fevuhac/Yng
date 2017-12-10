#!/bin/bash

#部署服务器，安装nvm、node

while read line;
do
    eval "$line"
done < config.cfg

echo 'NODE_VER:'$NODE_VER

for line in `cat ip.list`
do
  hostname=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`

  #安装nvm
  echo '服务器【'${hostname}':'${ip}'】安装nvm开始...'
  scripts/nvm-install.sh $ip $user $password
  echo '服务器【'${hostname}':'${ip}'】安装nvm完成'

  #安装node
  echo '服务器【'${hostname}':'${ip}'】安装node开始...'
  scripts/node-install.sh $ip $user $password $NODE_VER
  echo '服务器【'${hostname}':'${ip}'】安装node完成'

  #安装运行库
  echo '服务器【'${hostname}':'${ip}'】安装运行库开始...'
  scripts/env-install.sh $ip $user $password
  echo '服务器【'${hostname}':'${ip}'】安装运行库完成'

done
