alias s="docker exec -it \$(docker container ls -q) /bin/sh"
alias m="docker exec -it \$(docker container ls -q) /bin/sh -c 'mysql -uroot -proot -D sakila'"