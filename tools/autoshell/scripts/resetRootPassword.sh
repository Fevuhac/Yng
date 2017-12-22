#!/usr/bin/expect

# 安装运行环境

if {$argc<4} {
send_user "parameter except: $argv0 host user password cmd"
exit
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password  [ lindex $argv 2 ]
set afterPwd  [ lindex $argv 3 ]
puts stderr "Usage: $afterPwd host user password cmd"

set timeout 5 
spawn ssh ${user}@${host}

expect {
"*yes/no" { send "yes\r";}
"*password:" { send "$password\r";exp_continue}
}

set timeout 2
expect "*]#"
send "passwd root\r"
expect "New password:"
send "${afterPwd}\r"
expect "Retype new password:"
send "${afterPwd}\r"
send "exit\r"
expect eof
# interact
