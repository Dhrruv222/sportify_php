FROM php:8.3-fpm-alpine

# Install system deps
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    nginx \
    supervisor

# PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pcntl zip bcmath

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer manifests first for layer caching
COPY composer.json ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy full app
COPY . .

# Create storage dirs (must exist before autoload dump)
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Finish composer autoload
RUN composer dump-autoload --optimize --no-dev

# Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Supervisor config
COPY docker/supervisord.conf /etc/supervisord.conf

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
