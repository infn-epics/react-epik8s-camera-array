# EPIK8s Backend

Kubernetes & ArgoCD API proxy for the EPIK8s Dashboard.  
Runs inside the beamline namespace and uses an in-cluster ServiceAccount to proxy requests.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/healthz` | Health check |
| GET | `/api/v1/namespace` | Namespace info (status, pod/service count) |
| GET | `/api/v1/applications` | List ArgoCD applications (filtered by project) |
| GET | `/api/v1/applications/:name` | Get single ArgoCD application |
| POST | `/api/v1/applications/:name/sync` | Trigger ArgoCD sync |
| POST | `/api/v1/applications/:name/restart` | Rolling restart of app deployments |
| DELETE | `/api/v1/applications/:name` | Delete ArgoCD application |
| GET | `/api/v1/pods` | List pods in namespace |
| GET | `/api/v1/pods/:name/logs` | Pod logs (`?container=&tailLines=200`) |
| DELETE | `/api/v1/pods/:name` | Delete a pod |
| GET | `/api/v1/services` | List services |
| GET | `/api/v1/configmaps` | List config maps |
| GET | `/api/v1/deployments` | List deployments |
| POST | `/api/v1/deployments/:name/scale` | Scale deployment (`{"replicas": N}`) |
| GET | `/api/v1/statefulsets` | List stateful sets |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Listen port |
| `NAMESPACE` | auto-detected | Target K8s namespace |
| `ARGOCD_URL` | `https://argocd-server.argocd.svc` | ArgoCD server URL |
| `ARGOCD_TOKEN` | SA token | ArgoCD API bearer token |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS origins |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `1` | Set to `0` for self-signed ArgoCD certs |

## Local Development

```bash
cd k8s-backend
npm install
# Point to a local or port-forwarded cluster
export KUBECONFIG=~/.kube/config
export NAMESPACE=sparc
export ARGOCD_URL=https://localhost:8443
npm run dev
```

## Build & Push Image

```bash
docker build -t your-registry/epik8s-backend:latest .
docker push your-registry/epik8s-backend:latest
```

## Deploy to Kubernetes

All manifests are in the `k8s/` directory. Apply them to the beamline namespace:

```bash
NAMESPACE=sparc

# Edit k8s/ingress.yaml to set the correct host
# Edit k8s/deployment.yaml to set the correct image

kubectl apply -n $NAMESPACE -f k8s/rbac.yaml
kubectl apply -n $NAMESPACE -f k8s/configmap.yaml
kubectl apply -n $NAMESPACE -f k8s/deployment.yaml
kubectl apply -n $NAMESPACE -f k8s/service.yaml
kubectl apply -n $NAMESPACE -f k8s/ingress.yaml
```

### ArgoCD Token (optional)

If the ServiceAccount doesn't have ArgoCD access, create a secret with an ArgoCD API token:

```bash
kubectl create secret generic epik8s-backend-secret \
  --from-literal=argocd-token=YOUR_TOKEN \
  -n $NAMESPACE
```

## Architecture

```
Dashboard (browser)
    │
    ▼
epik8s-backend (this service, in beamline namespace)
    │
    ├──► K8s API (via ServiceAccount + in-cluster config)
    │     pods, services, deployments, statefulsets, configmaps, logs
    │
    └──► ArgoCD API (argocd-server.argocd.svc)
          applications: list, sync, restart, delete
```
