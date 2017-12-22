#!/usr/bin/expect

# 安装

if {$argc<3} {
puts stderr "Usage: $argv0 host user passwd zipInstaller installPath"
exit 1
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password  [ lindex $argv 2 ]
set zipInstaller  [ lindex $argv 3 ]
set installPath  [ lindex $argv 4 ]

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
send "unzip -o ${zipInstaller} -d ${installPath}\r"
expect "*]#"
send "npm install --production\r"
send "exit\r"
expect eof
# interact