#!/bin/sh

cd /var/www/html
php tools/synchronize-db.php >> /var/www/html/import.log