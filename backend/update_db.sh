#!/bin/bash

docker exec  backend_api_1 /bin/sh -c "php /var/www/html/tools/synchronize-db.php"