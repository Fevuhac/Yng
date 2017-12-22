#!/usr/bin/expect

# 部署nvm

if {$argc<3} {
puts stderr "Usage: $argv0 host user passwd"
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
send "curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash\r"
send "exit\r"
expect eof
# interact
