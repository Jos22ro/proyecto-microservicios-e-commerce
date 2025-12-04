#!/bin/bash

# Wait for database connection
echo "Waiting for database connection..."
until nc -z -v -w30 products_db 5432
do
  echo "Waiting for database connection..."
  sleep 5
done
echo "Database connected!"

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start server
echo "Starting server..."
php artisan serve --host=0.0.0.0 --port=8003
