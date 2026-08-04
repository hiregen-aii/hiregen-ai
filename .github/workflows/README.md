# GitHub Actions (Module 4.4)

This module provides Continuous Integration (CI) workflows for the HireGen AI repository.

## Workflows

### 1. Lint

File:

```
.github/workflows/lint.yml
```

Checks backend and frontend code for linting issues.

Runs on:

- Pull Requests to `develop`
- Pushes to `develop`

---

### 2. Build Validation

File:

```
.github/workflows/build.yml
```

Verifies that both backend and frontend build successfully.

Runs on:

- Pull Requests to `develop`
- Pushes to `develop`

---

### 3. Docker Build Validation

File:

```
.github/workflows/docker-build.yml
```

Builds the backend and frontend Docker images to ensure the Dockerfiles remain valid.

Runs on:

- Pull Requests to `develop`
- Pushes to `develop`

---

## Purpose

These workflows help detect:

- Build failures
- Lint issues
- Docker configuration errors

before code is merged into the `develop` branch.