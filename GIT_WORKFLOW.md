# Git workflow — verify before main

`main` is the **production** branch. Do not push day-to-day work there.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code only |
| `develop` | Staging / integration — push here after local verification |
| `feature/*` | One branch per task (recommended for larger changes) |

## Daily workflow

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create a feature branch (optional but recommended)
git checkout -b feature/inventory-adjustment

# 3. Make changes, then verify locally
npm run verify

# 4. Commit
git add .
git commit -m "Add inventory adjustment validation"

# 5. Push to a non-main branch
git push -u origin feature/inventory-adjustment
# or, for small changes directly on develop:
# git push origin develop
```

## Pull requests (verification gate)

1. **Feature → develop**  
   Open a PR on GitHub from `feature/...` into `develop`.  
   CI runs `npm run verify`. Use the PR checklist before merging.

2. **Develop → main (release)**  
   When `develop` is fully tested, open a PR from `develop` into `main`.  
   Merge only after manual verification and CI passing.

## Local safety hook

Install once per machine:

```bash
npm run install:git-hooks
```

This blocks `git push origin main` by accident.  
Emergency override: `ALLOW_MAIN_PUSH=1 git push origin main`

## GitHub settings (recommended)

In [github.com/BapamaEmma/naknaa-s-i-pos/settings](https://github.com/BapamaEmma/naknaa-s-i-pos/settings):

1. **Default branch** → set to `develop` (optional, keeps PRs off main by default)
2. **Branches → Add rule for `main`**:
   - Require a pull request before merging
   - Require status checks to pass (CI / verify)
   - Do not allow bypassing (optional)

## Quick reference

```bash
npm run verify              # lint + build (run before every PR)
npm run install:git-hooks   # block accidental main pushes
git checkout develop        # your default working branch
```
