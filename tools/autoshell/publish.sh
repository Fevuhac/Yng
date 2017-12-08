#!/bin/bash

SHELL_DIR=/Users/linyng/develop/game/project/yng-fishjoy/tools/work_doc/vietnam
SOURCE_DIR=$SHELL_DIR
INSTALL_PATH=/home/fishjoy

#部署服务器，安装nvm、node
for line in `cat ip.list`
do
 echo ${line}
  hostname=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`


#更新项目package.json
echo '服务器【'${hostname}':'${ip}'】更新package.json...'
 $SHELL_DIR/scp.sh $SOURCE_DIR/package.json $ip:$INSTALL_PATH $user $password
echo '服务器【'${hostname}':'${ip}'】更新package.json完成'

#更新项目node_modules
echo '服务器【'${hostname}':'${ip}'】更新项目node_modules...'
 $SHELL_DIR/modules-install.sh $ip $user $password
echo '服务器【'${hostname}':'${ip}'】更新项目node_modules完成'

# echo '服务器'${hostname}'#'${ip}'#发布程序包...'
#  $SHELL_DIR/scp.sh $SOURCE_DIR $ip:$INSTALL_PATH $user $password
# echo '服务器'${hostname}'#'${ip}'#发布程序包完成'

# /home/vietnam/sshkey.sh $ip $user $password | grep ssh-rsa >> ~/.ssh/authorized_keys
 # /home/vietnam/noscp.sh ~/.ssh/authorized_keys $ip:~/.ssh $user $password

done
