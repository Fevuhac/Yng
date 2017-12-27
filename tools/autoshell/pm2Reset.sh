#!/bin/bash

#程序启动、停止、重启

while read line;
do
    eval "$line"
done < config.cfg



echo 'PACK_DIR:'$PACK_DIR
echo 'INSTALLER_ZIP:'$INSTALLER_ZIP
echo 'INSTALL_DIR:'$INSTALL_DIR

declare -A maps=()
maps["balance_server"]="pm2 delete all,pm2 list"
maps["chat_server"]="pm2 delete all,pm2 list"
maps["fight_server"]="pm2 delete all,pomelo stop,pomelo list"
maps["data_server"]="pm2 delete all,pm2 list"
maps["resource_server"]="pm2 delete all,pm2 list"
maps["admin"]="eggctl stop"
maps["playerSync"]="pm2 delete all,pm2 list"


for line in `cat ip.list`
do
  hostname=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`
  tag=`echo $line | cut -d \, -f 5`


echo '-----maps:'${maps[@]}

str=${maps["${tag}"]}
echo '-----tag:'$tag'value:'${str}

  OLD_IFS="$IFS" 
  IFS="," 
  arr=(${str}) 
  IFS="$OLD_IFS" 

  echo '-----arr len:'${#arr[@]}}

  for i in "${!arr[@]}";    
  do   
      printf "%s\t%s\n" "$i" "${arr[$i]}"  
      echo '服务器【'${hostname}':'${ip}'】启动服务...'
      scripts/serviceCtrl.sh $ip $user $password "${arr[$i]}" $INSTALL_DIR
      echo '服务器【'${hostname}':'${ip}'】启动服务完成'

  done  

done
