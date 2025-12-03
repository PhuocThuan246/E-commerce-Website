# E-commerce-Website
=====================================================================
1. PROJECT OVERVIEW
=====================================================================
E-Shop is a full-stack e-commerce website built with:
  - Backend: Node.js + Express + MongoDB
  - Frontend: React + Vite
  - Deployment: Docker Compose
  - Redis: for asynchronous task queue
  - Worker: for background email sending
  - Nginx: reverse proxy and load balancer
  - Realtime: Socket.IO
  - Authentication: JWT + Google OAuth

=====================================================================
2. HOW TO RUN (DOCKER COMPOSE)
=====================================================================
# Build images
docker compose build

# Start all containers
docker compose up -d

# Build and start in one command
docker compose up -d --build

# View running containers
docker ps

# Stop and remove containers
docker compose down

# Clean all unused images, volumes, and networks
docker compose down -v --rmi all
docker system prune -a --volumes -f
docker volume rm $(docker volume ls -q)

=====================================================================
3. TESTING FUNCTIONALITY
=====================================================================
# Check which port the app is running on
docker ps

# Access frontend at:
http://localhost

# Verify backend load balancing
docker logs -f ecommerce_api_1
docker logs -f ecommerce_api_2

# Verify asynchronous email worker
docker logs -f ecommerce_worker

=====================================================================
4. ACCESS INFORMATION
=====================================================================
Frontend: http://localhost
Backend API: http://localhost:5000/api/products
MongoDB: internal port 27017
Redis: internal port 6379

=====================================================================
5. ADMIN ACCOUNT
=====================================================================
Admin Email: admin@gmail.com
Password: 123456

=====================================================================
END OF FILE
=====================================================================
