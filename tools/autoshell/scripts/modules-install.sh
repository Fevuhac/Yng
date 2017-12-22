#!/usr/bin/expect

# 安装

if {$argc<3} {
puts stderr "Usage: $argv0 host user passwd installPath"
exit 1
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password  [ lindex $argv 2 ]
set installPath  [ lindex $argv 3 ]

set timeout 10 
spawn ssh ${user}@${host}

expect {
"*yes/no" { send "yes\r"}
"*password:" { send "$password\r" }
}

expect "*]#"
send "sudo -s\r"
expect "*]#"
send "cd ${installPath}\r"
expect "*]#"
send "npm install --production\r"
expect "*]#"
send "rm -rf ./node_modules/pomelo-logger/node_modules/log4js/\r"
send "exit\r"
expect eof
# interact
