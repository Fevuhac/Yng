#!/usr/bin/expect

# 部署nvm,安装node

if {$argc<4} {
puts stderr "Usage: $argv0 host user passwd "
exit 1
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password  [ lindex $argv 2 ]
set node_version [lindex $argv 2]

set timeout 10 
spawn ssh ${user}@${host}

expect {
"*yes/no" { send "yes\r"}
"*password:" { send "$password\r" }
}