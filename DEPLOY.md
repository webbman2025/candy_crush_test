# Deploy to GitHub and Vercel (Stable Flow)

This project should use a single production path:

- feature branch -> Pull Request -> `main` -> Vercel production deploy

Do not deploy production directly from feature branches.

## One-time setup (Vercel)

1. Open [Vercel Project Settings](https://vercel.com/dashboard).
2. In your project, go to **Settings -> Git**.
3. Connect repository: `webbman2025/candy_crush_test`.
4. Set **Production Branch** to `main`.
5. Confirm framework is **Next.js** and root directory is `.`.

If this is not set, pushing to GitHub will not update production.

## Every update (recommended)

### 1) Work on a feature branch

You’re on `feature/gameplay-enhancements` for new gameplay work. Keep `main` clean.

```bash
# Already done once: git checkout -b feature/gameplay-enhancements
# Make your code changes in the repo, then:
git add .
git commit -m "Describe your change"
git push -u origin feature/gameplay-enhancements
```

### 2) Validate before opening PR

```bash
npm run verify:release
```

### 3) Open PR to `main`

- Base: `main`
- Compare: `feature/your-change`
- Merge after checks pass

### 4) Production deploy

After merge to `main`, Vercel should auto-deploy.

If needed, trigger manually:
- Vercel -> Project -> Deployments -> latest `main` deployment -> **Redeploy**

## Feature-branch workflow (gameplay enhancements)

Use this so `main` stays safe and you can revert easily.

| Step | Command / action |
|------|-------------------|
| **Start** | You’re on `feature/gameplay-enhancements` (already created). |
| **Edit** | Change code as usual. Run `npm run dev` to test. |
| **Save** | `git add .` → `git commit -m "Your message"` |
| **If it works** | Merge into main (see “If enhancements work” below). |
| **If it breaks** | Throw away the branch (see “If enhancements break” below). |

**If enhancements work** — merge to main and deploy:
```bash
git checkout main
git merge feature/gameplay-enhancements
git push origin main
# Optional: keep branch for more work
git checkout feature/gameplay-enhancements
```

**If enhancements break** — go back to last good state:
```bash
git checkout main
git branch -D feature/gameplay-enhancements
# You’re back to main; no enhancement commits. To recreate the branch later:
git checkout -b feature/gameplay-enhancements
```

**Restore point:** Tag `restore-point-before-enhancements` = commit with Easter background. To reset main to that exact state: `git checkout main` then `git reset --hard restore-point-before-enhancements`.

---

## Quick troubleshooting

### New code in GitHub but not in Vercel

Check:
1. Is commit in `origin/main`?
   ```bash
   git fetch origin && git log --oneline -1 origin/main
   ```
2. Vercel **Settings -> Git** connected to correct repo?
3. Vercel **Production Branch** set to `main`?
4. Deployment status is **Ready** (not failed)?

### Wrong branch deployed

- Ensure only `main` is used for production.
- Keep feature branches for preview/testing only.

## Useful links

- GitHub repo: <https://github.com/webbman2025/candy_crush_test>
- Vercel dashboard: <https://vercel.com/dashboard>
