#!/usr/bin/expect

# 安装运行环境

if {$argc<3} {
puts stderr "Usage: $argv0 host user password cmd"
exit 1
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password  [ lindex $argv 2 ]
set cmd  [ lindex $argv 3 ]
set installPath  [ lindex $argv 4 ]

puts stderr "Usage: $cmd host user password cmd"

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
send "${cmd}\r"
send "exit\r"
expect eof
# interact
