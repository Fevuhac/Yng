@echo off
set user=root
set pwd=Fishjoy2016!YXL
set address=106.75.95.208
set svrPathC=/home/server/fjc/public/cfgs
set svrPathS=/home/server/fjs/cfgs
git pull
cd .\����������
WinRar a -r ../web.zip *.*

cd ..\
WinSCP /console /command "option batch continue" "option confirm off" "open sftp://%user%:%pwd%@%address%" "cd %svrPathC%" "bin" "put ����������\all_cfgs" "put ����������\all_merge" "cd %svrPathS%" "put web.zip" "call unzip -o web.zip" "rm web.zip" "bye"

del web.zip
pause
