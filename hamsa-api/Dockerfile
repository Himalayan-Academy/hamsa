FROM alpine:3.6
LABEL Maintainer="Andre Alves Garzia <andre@andregarzia.com" \
      Description="Lightweight container with Nginx & PHP-FPM 7 based on Alpine Linux 3.6."

# Install packages from testing repo's
RUN apk --no-cache add curl-dev php7 php7-fpm php7-pgsql php7-pdo php7-pdo_pgsql php7-mcrypt php7-json \
    php7-openssl php7-curl php7-xmlwriter \
    php7-zlib php7-xml php7-phar php7-intl php7-dom php7-xmlreader php7-ctype php7-exif php7-tokenizer \
    php7-mbstring php7-gd php7-session libressl-dev exiftool pcre2-dev postgresql-dev wget nginx \
    nodejs-current nodejs-current-npm \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/main/ \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/

# Install packages from stable repo's
RUN apk --no-cache add supervisor curl tzdata

# Configure nginx
COPY config/nginx.conf /etc/nginx/nginx.conf

# Configure PHP-FPM
COPY config/fpm-pool.conf /etc/php7/php-fpm.d/zzz_custom.conf
COPY config/php.ini /etc/php7/php.ini

# Configure supervisord
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Configure cronjobs
COPY cronjobs/backup-db.sh /etc/periodic/daily/backup-db.sh
COPY cronjobs/synchronize-db.sh /etc/periodic/15min/synchronize-db.sh

# Add application
RUN mkdir -p /var/www/html
RUN mkdir -p /var/www/backups
RUN mkdir -p /var/www/images


WORKDIR /var/www/html

EXPOSE 80 443
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
