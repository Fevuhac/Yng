#!/bin/bash
for line in `cat ip.list`
do
 echo ${line}
  host=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`

 echo '部署服务器'${host} ${ip} ${user} ${password}
/home/vietnam/sshdeploy.sh $ip $user $password
 echo '部署服务器完成'

echo '拷贝服务器代码'
 /home/vietnam/noscp.sh /home/vietnam $ip:/home/vietnam $user $password
 echo '拷贝服务器代码完成'
# /home/vietnam/sshkey.sh $ip $user $password | grep ssh-rsa >> ~/.ssh/authorized_keys
 # /home/vietnam/noscp.sh ~/.ssh/authorized_keys $ip:~/.ssh $user $password

done
