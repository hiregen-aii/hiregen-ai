# Docker Setup — Module 4.4

This folder has Dockerfiles for backend,frontend,n8n.Run everything fro reporoot.
Dockerfile need to see frontend,bakend and n8n workflow files.

## Before start
Copy dockerignore file to the root of repo:

cp docker/.dockerignore .dockerignore

## 1. Backend

docker build -f docker/backend.Dockerfile -t hiregen-backend:latest .
docker run --rm -p 4000:4000 --env-file backend/.env hiregen-backend:latest

Check if it is working with curl http://localhost:4000/health

## 2. Frontend 

docker build -f docker/frontend.Dockerfile --build-arg APP_DIR=frontend -t hiregen-frontend:latest .
docker run --rm -p 8080:80 hiregen-frontend:latest

Check if it is working with curl http://localhost:8080 in browser


## 3. n8n

docker build -f docker/n8n.Dockerfile -t hiregen-n8n:latest .
docker run --rm -p 5678:5678 -v n8n_data:/home/node/.n8n hiregen-n8n:latest

Open `http://localhost:5678` in browser.

## Notes: 
1. Backend and Frontend both use multistage builds. This means app is built in one stage and only reqired files arecopied to final image. It makes image smaller and help to remove unnecessary development dependencies.

2. n8n doesn't use multi-stage build bcuz it is based on official n8n image and does not need any build process.

3. Backend and Frontend (Nginx) run as non-root users for better security.

4. Health checks are:
       Backend checks existing health endpoint.
       Frontend and n8n use basic HTTP health checks to ensure services are running.

5. The frontend Dockerfile is generic for a vite and react application. Complete verification is pending because frontend source (including index.html and dependencies) was not available from frontend team.


