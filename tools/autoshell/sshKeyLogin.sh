#!/bin/bash
#ssh免密登陆key生成
for line in `cat ip.list`
do
  echo ${line}
  host=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`

  echo '服务器【'${hostname}':'${ip}'】生成授权sshkey...'
  scripts/sshkey.sh $ip $user $password | grep ssh-rsa >> ~/.ssh/authorized_keys
  scripts/scp.sh ~/.ssh/authorized_keys $ip:~/.ssh $user $password
  echo '服务器【'${hostname}':'${ip}'】生成授权sshkey完成'

done

