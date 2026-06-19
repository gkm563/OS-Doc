# GKM Open Source Journey 🚀

"GKM Open Source Journey" is a production-grade, zero-cost, permanent tracking platform designed to document, organize, visualize, and preserve the complete open-source contribution memory of Gautam Kumar Maurya (GKM563).

It spans platforms like GitHub, GitLab, Gerrit, Wikimedia/Wikipedia, and Phabricator, providing a public portfolio alongside an admin-managed CMS that writes updates directly back to Git.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Caching**: TanStack Query
- **Routing**: React Router v6 (HashRouter for static subdirectory routing)
- **Build tool**: Vite
- **Database**: Versioned JSON files stored locally under `/data/*.json` (Git-as-a-Database pattern)

---

## ⚡ Free Production Deployment (GitHub Pages)

The system is configured to deploy directly to GitHub Pages for free using GitHub Actions. Whenever you push to the `main` branch (either via local git, or directly from the Admin CMS), the site is automatically built and deployed.

### Step-by-Step Deploy Guide

1. **Deploy Workflow**:
   - The repository contains a GitHub Actions workflow in [.github/workflows/deploy.yml](file:///c:/Users/Lenovo/OneDrive/Desktop/OS/.github/workflows/deploy.yml).
   - Once pushed, GitHub automatically triggers this action to build the project and push the compiled files to the `gh-pages` branch.

2. **Enable GitHub Pages**:
   - Go to your repository settings page: `https://github.com/gkm563/OS-Doc/settings`.
   - On the left sidebar under **Code and automation**, click **Pages**.
   - Under **Build and deployment**:
     - Set **Source** to **Deploy from a branch**.
     - Set **Branch** to **`gh-pages`** and `/ (root)`.
     - Click **Save**.

3. **Access Your Public Link**:
   - Your site will be live at: **`https://gkm563.github.io/OS-Doc/`**

4. **Production Admin CMS Write Access**:
   - Navigate to the Admin Portal on your live site: `https://gkm563.github.io/OS-Doc/#/admin`.
   - In the **Username** field, enter `GKM563`.
   - In the **Password** field, paste a **GitHub Personal Access Token (PAT)** with `repo` read/write scopes.
   - The system stores this token securely in your browser's `localStorage` and will write commits directly to the `data/` folder in your repository via the GitHub REST API! This triggers the auto-deploy action and updates your live portfolio in 1-2 minutes.
   - Click **Logout** to clear the token session from the browser.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. CMS write pipeline in development
In local development, the Vite dev server uses a custom filesystem middleware (configured in [vite.config.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/OS/vite.config.ts)) that writes additions and edits directly to the local `/data` files when you make updates in the Admin Portal.

### 4. Admin Portal Login
- **URL**: Go to `/admin` route or click **Admin Portal** in the sidebar.
- **Default Username**: `GKM563`
- **Default Password**: `gkm563`
*(Auth credentials can be modified in [Admin.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/OS/src/pages/Admin.tsx#L37))*
