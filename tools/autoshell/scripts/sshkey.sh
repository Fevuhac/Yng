#!/usr/bin/expect

#ssh-key.sh
# ./ssh-key.sh 主机名 用户名 密码,在远程主机生成id_rsa

if {$argc<3} {
puts stderr "Usage: $argv0 host user passwd "
exit 1
}

set host [ lindex $argv 0 ]
set user [ lindex $argv 1 ]
set password [ lindex $argv 2 ]
	
set timeout 30

spawn ssh ${user}@${host} "ssh-keygen -t rsa"

expect {
"*yes/no" { send "yes\r"; exp_continue }
"*password:" { send "$password\r"; exp_continue }
"Enter file in which to save the key*" { send "\n\r"; exp_continue }
"Overwrite*" { send "y\n"; exp_continue }
"Enter passphrase (empty for no passphrase):" { send "\n\r"; exp_continue }
"Enter same passphrase again:" { send "\n\r" }
}
 
spawn ssh ${user}@${host} "cat ~/.ssh/id_rsa.pub"
 
expect {
"*yes/no" { send "yes\r"; exp_continue }
"*password:" { send "$password\r" }
}
expect eof

