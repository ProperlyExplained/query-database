containerId=$(docker container run --rm -d -e MYSQL_ROOT_PASSWORD=root mysql)
wget https://downloads.mysql.com/docs/sakila-db.zip
unzip sakila-db.zip
echo 'Trying to connect to mysql docker container...'
until docker exec $containerId /bin/sh -c 'mysql -uroot -proot' > /dev/null 2>/dev/null; do sleep 1; done;
cat ./sakila-db/sakila-schema.sql | docker exec -i $containerId /bin/sh -c 'mysql -uroot -proot'
cat ./sakila-db/sakila-data.sql | docker exec -i $containerId /bin/sh -c 'mysql -uroot -proot'
rm sakila-db.zip
rm -r sakila-db