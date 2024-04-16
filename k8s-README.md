# Build Docker images

**NOTE**: Kubernetes does *not* build Docker images for you. Before deploying for the first time, or if you make any changes to your code, you *must* (re-)run the commands below to regenerate the images, and then re-deploy to Kubernetes.

## Game Server
```bash
cd server
docker build . -f Dockerfile.gameserver -t poker-gameserver
cd ..
```

## Site Server
```bash
cd server
docker build . -f Dockerfile.siteserver -t poker-siteserver
cd ..
```

## UI
```bash
docker build . -f Dockerfile.ui -t poker-ui
```

# Deploy on Kubernetes

```bash
kubectl create -f k8s-poker/
```

# Undeploy

Undeploy before re-deploying if you make a change to the app. Also remember to rebuild Docker images per the instructions earlier in this README.

```bash
kubectl delete -f k8s-poker/
```

# Do one-time Mongo setup

In one terminal:

```bash
kubectl port-forward service/db 27017:27017
```

In another terminal:

```bash
cd server
npm run setup
```


