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

#复制安装包
echo '服务器【'${hostname}':'${ip}'】创建安装目录...'
scripts/cmd.sh $ip $user $password 'mkdir -p '${INSTALL_DIR}
echo '服务器【'${hostname}':'${ip}'】创建安装目录'

#复制安装包
echo '服务器【'${hostname}':'${ip}'】安装包复制中...'
scripts/scp.sh $PACK_DIR$INSTALLER_ZIP $ip:$INSTALL_DIR $user $password
echo '服务器【'${hostname}':'${ip}'】安装包复制完成'

#解压安装程序
echo '服务器【'${hostname}':'${ip}'】安装包解压中...'
scripts/unzip-installer.sh $ip $user $password $INSTALLER_ZIP $INSTALL_DIR
echo '服务器【'${hostname}':'${ip}'】安装包解压完成'

#更新项目node_modules
echo '服务器【'${hostname}':'${ip}'】安装依赖...'
scripts/modules-install.sh $ip $user $password $INSTALL_DIR
echo '服务器【'${hostname}':'${ip}'】安装依赖完成'

#zip -r test.zip ./
#unzip -o -d /fishjoy



done
