#!/bin/sh

ssh root@database "pg_dump -U $POSTGRES_USER -h database -C --column-inserts" \
 >> /var/www/backups/backup_hamsa.sql