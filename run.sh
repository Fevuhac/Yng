#!/bin/sh
#cd chat_server
#forever start -a -l /home/log/chat_forever.log -o chat_server.log -e chat_server_err.log bin/fjl
#cd ..
#cd server_balance
#forever start -a -l /home/log/balance_forever.log -o balance_server.log -e balance_server_err.log bin/fjb
#cd ..
#cd server_pool
#forever start -a -l /home/log/pool_forever.log -o pool_server.log -e pool_server_err.log bin/fje
#cd ..
#cd server_room
#forever start -a -l /home/log/room_forever.log -o room_server.log -e room_server_err.log bin/fjr
#cd ..
#cd data_server
#forever start -a -l /home/log/data_forever.log -o data_server.log -e data_server_err.log bin/fjs 
#cd ..
#cd dataSync
#forever start -a -l /home/log/dataSync_forever.log -o dataSync_server.log -e dataSync_server_err.log app.js
#cd ..
#cd resource_server
#forever start -a -l /home/log/resource_forever.log -o resource_server.log -e resource_server_err.log bin/fjc 

forever start bin/playerSync
