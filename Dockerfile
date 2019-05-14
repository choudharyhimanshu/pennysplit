FROM php:7.3.5-apache

MAINTAINER Himanshu Choudhary

ENV PORT 80

COPY . /srv/app

COPY vhost.conf /etc/apache2/sites-available/000-default.conf

RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

RUN chown -R www-data:www-data /srv/app

CMD sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf \
  && a2enmod rewrite && docker-php-entrypoint apache2-foreground
