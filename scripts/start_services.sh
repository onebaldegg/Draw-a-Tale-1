#!/bin/bash

# Start MongoDB
service mongod start

# Wait for MongoDB to be ready
sleep 5

# Start supervisor services
supervisorctl reread
supervisorctl update
supervisorctl start all

echo "All services started successfully!"
echo "Backend running on: http://localhost:8001"
echo "Frontend running on: http://localhost:3000"
echo "API documentation: http://localhost:8001/docs"