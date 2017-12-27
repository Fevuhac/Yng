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
# start
maps["balance_server"]="pm2 start server_balance/bin/fjb.js --name fjb,pm2 list"
maps["data_server"]="pm2 start data_server/bin/fjs.js --name fjs,pm2 list"
maps["fight_server"]="pomelo stop,pomelo start -d room/ -D,pomelo list"
maps["playerSync"]="pm2 start playerSync/app.js --name playerSync,pm2 list"
maps["chat_server"]="pm2 start chat_server/bin/fjl.js --name fjl,pm2 list"
maps["admin"]="npm start"

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
