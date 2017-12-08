#!/usr/bin/expect

#scp.sh
#远程拷贝文件
# ./scp.sh 本地文件 远程路径 远程用户密码
 
if {$argc<4} {
puts stderr "Usage: $argv0 localfile remotefile user password "
exit 1
}
 
set localfile [ lindex $argv 0 ]
set remotefile [ lindex $argv 1 ]
set user [ lindex $argv 2 ]
set password [ lindex $argv 3 ]
 
set timeout 30

spawn scp -r ${localfile} ${user}@${remotefile}     

expect {
"*yes/no" { send "yes\r"}
"*password:" { send "$password\r" }
}
 
expect '*]#'
send "exit\r"
