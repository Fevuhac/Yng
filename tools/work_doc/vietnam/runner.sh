#!/bin/bash

#程序启动、停止、重启

NODE_VER = v8.9.0
SHELL_DIR = /Users/linyng/develop/game/project/yng-fishjoy/tools/work_doc/vietnam
INSTALL_PATH = /home/fishjoy

for line in `cat ip.list`
do
  host=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`

echo '服务器'${host}'#'${ip}'#安装nvm开始...'
$SHELL_DIR/env-install.sh $ip $user $password $INSTALL_PATH
echo '服务器'${host}'#'${ip}'#安装nvm完成'

echo '服务器'${host}'#'${ip}'#安装node开始...'
$SHELL_DIR/node-install.sh $ip $user $password $NODE_VER
echo '服务器'${host}'#'${ip}'#安装node完成'

# /home/vietnam/sshkey.sh $ip $user $password | grep ssh-rsa >> ~/.ssh/authorized_keys
 # /home/vietnam/noscp.sh ~/.ssh/authorized_keys $ip:~/.ssh $user $password

done
