# Deploy to GitHub & Vercel

## GitHub (already done)

- **Repo:** https://github.com/webbman2025/candy_crush_test  
- **Branch pushed:** `CNewYear` (with UI icons and hole cell changes)

To push future changes:

```bash
git add .
git commit -m "Your message"
git push origin CNewYear
```

To deploy from `main` instead, merge and push:

```bash
git checkout main
git merge CNewYear
git push origin main
```

---

## Vercel

### 1. Sign in

- Go to [vercel.com](https://vercel.com) and sign in (use **Continue with GitHub**).

### 2. Import the repo

- Click **Add New…** → **Project**.
- Under **Import Git Repository**, select **webbman2025/candy_crush_test** (or paste the repo URL).
- Click **Import**.

### 3. Configure the project

- **Framework Preset:** Next.js (should be auto-detected).
- **Root Directory:** Leave as `.` (project root).
- **Build Command:** `next build` (default).
- **Output Directory:** leave default (Vercel uses Next.js output automatically).
- **Install Command:** `npm install` (default).

### 4. Branch to deploy

- **Production Branch:** Choose `main` or `CNewYear` (the branch you want each production deploy to use).
- Click **Deploy**.

### 5. After deploy

- Vercel will build and give you a URL like `https://candy-crush-test-xxx.vercel.app`.
- For every push to the connected branch, Vercel will redeploy automatically.

### Optional: env variables

If the app needs env vars (e.g. API keys):

- Open your project on Vercel → **Settings** → **Environment Variables**.
- Add names and values, then redeploy.

---

## Quick reference

| Step              | Where / Command                    |
|-------------------|------------------------------------|
| Push code         | `git push origin CNewYear` (or `main`) |
| Repo              | https://github.com/webbman2025/candy_crush_test |
| Deploy dashboard  | https://vercel.com/dashboard       |
| Connect repo      | Vercel → Add New → Project → Import from GitHub |
