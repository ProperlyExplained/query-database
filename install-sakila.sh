#!/bin/bash
set -e
docker container run \
--name mysql \
--rm \
--detach \
--publish 3306:3306 \
--env MYSQL_ROOT_PASSWORD=root mysql
tempFolder=$(mktemp -d)
cd $tempFolder
wget https://downloads.mysql.com/docs/sakila-db.zip
unzip sakila-db.zip
echo 'Trying to connect to mysql docker container...'
until docker exec mysql /bin/sh -c 'mysql -uroot -proot' > /dev/null 2>/dev/null; do sleep 1; done;
cat ./sakila-db/sakila-schema.sql | docker exec -i mysql /bin/sh -c 'mysql -uroot -proot'
cat ./sakila-db/sakila-data.sql | docker exec -i mysql /bin/sh -c 'mysql -uroot -proot'
rm -r $tempFolder