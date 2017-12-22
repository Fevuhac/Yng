#!/bin/bash

while read line;
do
    eval "$line"
done < config.cfg

echo 'PACK_DIR:'$PACK_DIR
echo 'INSTALLER_ZIP:'$INSTALLER_ZIP
echo 'INSTALL_DIR:'$INSTALL_DIR

#部署服务器，安装nvm、node
for line in `cat ip.list`
do
 echo ${line}
  hostname=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`

#修改密码
echo '服务器【'${hostname}':'${ip}'】修改密码...'
scripts/resetRootPassword.sh $ip $user $password 'JYvdwVUZrEvwFkyTDYPx'
echo '服务器【'${hostname}':'${ip}'】修改密码完成'

done
