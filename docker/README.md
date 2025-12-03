# Docker Deployment Guide

This directory contains Docker configuration files for deploying the Command Builder application.

## Overview

The Command Builder is a static Angular application served via nginx. It can be run in a Docker container with custom command configurations mounted from the host system.

## Files

- **Dockerfile**: Multi-stage build configuration for creating the application image
- **docker-compose.yml**: Compose configuration for easy deployment
- **README.md**: This file

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose V2 (optional, for using docker-compose.yml)


## Running with Docker Run

### Basic Usage

```bash
docker run -d \
  --name command-builder \
  -p 8080:80 \
  -v $(pwd)/public/commands.json:/usr/share/nginx/html/commands.json:ro \
  ghcr.io/danielraab/command-builder:latest
```
ensure that the `commands.json` file exists. remove the mount if you want use the commands.json from the repository (https://github.com/danielraab/command-builder/blob/master/public/commands.json).

### With Custom Commands File

If you have a custom `commands.json` file in a different location:

```bash
docker run -d \
  --name command-builder \
  -p 8080:80 \
  -v /path/to/your/commands.json:/usr/share/nginx/html/commands.json:ro \
  ghcr.io/danielraab/command-builder:latest
```

### Options Explained

- `-d`: Run container in detached mode (background)
- `--name command-builder`: Assign a name to the container
- `-p 8080:80`: Map port 80 from container to host port 8080
- `-v`: Mount the commands.json file (`:ro` means read-only)
- `ghcr.io/danielraab/command-builder:latest`: The image to use

## Running with Docker Compose

From the `docker` directory:

```bash
docker-compose up -d
```

To stop the application:

```bash
docker-compose down
```

To view logs:

```bash
docker-compose logs -f
```

## Configuration

### Commands File Mount

The `commands.json` file is mounted as a read-only volume from the host system. This allows you to:

- Customize available commands without rebuilding the image
- Share command configurations across multiple deployments
- Update commands by simply restarting the container

**Mount Path**: `/usr/share/nginx/html/commands.json`

### Environment Variables

No environment variables are required for the static application. The nginx server runs on port 80 by default.

### Port Configuration

By default, nginx serves on port 80. To use a different port on the host:

```bash
docker run -d \
  --name command-builder \
  -p 3000:80 \
  -v $(pwd)/public/commands.json:/usr/share/nginx/html/commands.json:ro \
  ghcr.io/danielraab/command-builder:latest
```

Then access the application at `http://localhost:3000`

## Accessing the Application

Once the container is running, open your browser and navigate to:

```
http://localhost:8080
```

## Docker Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Builder Stage**: Compiles the Angular application with all dev dependencies
2. **Production Stage**: Serves static files using nginx:alpine

This approach results in a smaller, more secure final image optimized for serving static content.

### Image Size

The final image is based on `nginx:alpine`, providing a minimal footprint optimized for serving static files.

## Troubleshooting

### File mount error: "not a directory"

If you see an error like:
```
docker: Error response from daemon: failed to create task for container: OCI runtime create failed: 
unable to start container process: error mounting "/path/to/commands.json" to rootfs: not a directory
```

**Cause**: Docker requires that the source file exists on the host before mounting. If the file doesn't exist, Docker creates a directory instead, causing the mount to fail.

**Solution**: Ensure the `public/commands.json` file exists before starting the container:

```bash
# From the project root
ls -la public/commands.json

# If the file doesn't exist, copy it from the repository
# Or create it with proper content
```

When running from a different directory, use absolute paths:

```bash
docker run -d \
  --name command-builder \
  -p 8080:80 \
  -v /absolute/path/to/public/commands.json:/usr/share/nginx/html/commands.json:ro \
  ghcr.io/danielraab/command-builder:latest
```

### Container won't start

Check the logs:
```bash
docker logs command-builder
```

### Port already in use

Change the host port mapping:
```bash
docker run -d \
  --name command-builder \
  -p 8081:80 \
  -v $(pwd)/public/commands.json:/usr/share/nginx/html/commands.json:ro \
  ghcr.io/danielraab/command-builder:latest
```

### Commands not loading

Verify the volume mount path is correct:
```bash
docker inspect command-builder | grep -A 5 Mounts
```

Ensure `commands.json` exists and is readable:
```bash
ls -la public/commands.json
```

### Updating commands.json

After modifying `commands.json`, restart the container:
```bash
docker restart command-builder
```

Or with docker-compose:
```bash
docker-compose restart
```

## Production Recommendations

1. **Use specific version tags** instead of `latest` for reproducible deployments
2. **Set resource limits** to prevent resource exhaustion:
   ```bash
   docker run -d \
     --name command-builder \
     --memory="256m" \
     --cpus="0.5" \
     -p 8080:80 \
     -v $(pwd)/public/commands.json:/usr/share/nginx/html/commands.json:ro \
     ghcr.io/danielraab/command-builder:latest
   ```
3. **Use a reverse proxy** (nginx, Traefik) for SSL/TLS termination
4. **Enable health checks** in production environments
5. **Back up** your custom `commands.json` file regularly

## Building and Pushing to Registry

### GitHub Container Registry (Default)

```bash
# Build
docker build -f docker/Dockerfile -t ghcr.io/danielraab/command-builder:0.1.0 .

# Tag as latest
docker tag ghcr.io/danielraab/command-builder:0.1.0 ghcr.io/danielraab/command-builder:latest

# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u danielraab --password-stdin

# Push
docker push ghcr.io/danielraab/command-builder:0.1.0
docker push ghcr.io/danielraab/command-builder:latest
```

### Docker Hub (Alternative)

```bash
# Build
docker build -f docker/Dockerfile -t danielraab/command-builder:0.1.0 .

# Tag as latest
docker tag danielraab/command-builder:0.1.0 danielraab/command-builder:latest

# Push
docker push danielraab/command-builder:0.1.0
docker push danielraab/command-builder:latest
```

## License

This Docker configuration is part of the Command Builder project and follows the same license.
