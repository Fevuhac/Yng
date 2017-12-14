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
maps["balance_server"]="pm2 stop all,pm2 start server_balance/bin/fjb.js -o ./logs/fjb_out.log -e ./logs/fjb_error.log,pm2 list"
maps["chat_server"]="pm2 stop all,pm2 start chat_server/bin/fjl.js -o ./logs/fjl_out.log -e ./logs/fjl_error.log,pm2 list"
maps["fight_server"]="pomelo stop,pomelo start -d room/ -D,pomelo list"
maps["data_server"]="pm2 stop all,pm2 start data_server/bin/fjs.js -o ./logs/fjs_out.log -e ./logs/fjs_error.log,pm2 list"
maps["resource_server"]="pm2 stop all,pm2 start resource_server/bin/fjc.js -o ./logs/fjc_out.log -e ./logs/fjc_error.log,pm2 list"

for line in `cat ip.list`
do
  host=`echo $line | cut -d \, -f 1`
  ip=`echo $line | cut -d \, -f 2`
  user=`echo $line | cut -d \, -f 3`
  password=`echo $line | cut -d \, -f 4`
  tag=`echo $line | cut -d \, -f 5`

echo 'tag:'$tag
# echo 'HONKONG:'$[$tag]


  echo 'maps:'${maps[@]}

 str=${maps["${tag}"]}
  # echo 'str:'${str}

  OLD_IFS="$IFS" 
  IFS="," 
  arr=(${str}) 
  echo 'arr0:'${arr[0]}
  echo 'arr1:'${arr[1]}
  IFS="$OLD_IFS" 
  echo 'arr len:'${#arr[@]}}

  for i in "${!arr[@]}";   
  do   
      printf "%s\t%s\n" "$i" "${arr[$i]}"  
      echo '服务器【'${hostname}':'${ip}'】启动服务...'
      scripts/serviceCtrl.sh $ip $user $password "${arr[$i]}" $INSTALL_DIR
      echo '服务器【'${hostname}':'${ip}'】启动服务完成'

  done  

done
