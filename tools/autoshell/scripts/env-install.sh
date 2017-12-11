#!/usr/bin/expect

# 安装运行环境

if {$argc<3} {
puts stderr "Usage: $argv0 host user password"
exit 1
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password  [ lindex $argv 2 ]

set timeout 10 
spawn ssh ${user}@${host}

expect {
"*yes/no" { send "yes\r"}
"*password:" { send "$password\r" }
}

expect "*]#"
send "npm install pm2 -g\r"
expect '*]#'
send "npm install pomelo -g\r"
expect '*]#'
send "yum -y install sysstat\r"
expect '*]#'
send "yum -y install unzip\r"
send "exit\r"
expect eof
# interact
