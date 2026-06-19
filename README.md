# GKM Open Source Journey 🚀

"GKM Open Source Journey" is a production-grade, zero-cost, permanent tracking platform designed to document, organize, visualize, and preserve the complete open-source contribution memory of Gautam Kumar Maurya (GKM563).

It spans platforms like GitHub, GitLab, Gerrit, Wikimedia/Wikipedia, and Phabricator, providing a public portfolio alongside an admin-managed CMS that writes updates directly back to Git.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Caching**: TanStack Query
- **Routing**: React Router v6
- **Build tool**: Vite
- **Serverless backend**: Netlify Functions (for admin git write/commit integrations)
- **Database**: Versioned JSON files stored locally under `/data/*.json` (Git-as-a-Database pattern)

---

## ⚡ Free Production Deployment (Netlify)

Since the system uses a **Git-as-a-Database** CMS architecture, it runs entirely on free-tier, serverless infrastructure forever, with no paid database locks.

### Step-by-Step Deploy Guide

1. **Sign Up / Log In**:
   - Go to [Netlify](https://www.netlify.com/) and log in using your GitHub account (`GKM563`).

2. **Add a New Site**:
   - Click **Add new site** -> **Import an existing project**.
   - Choose **GitHub** as the provider and authorize Netlify.
   - Search for and select your repository: **`OS-Doc`**.

3. **Deploy Settings**:
   - Netlify will automatically detect [netlify.toml](file:///c:/Users/Lenovo/OneDrive/Desktop/OS/netlify.toml) and configure:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist`
     - **Functions Directory**: `netlify/functions`
   - Click **Deploy Site**.

4. **Add Environment Secret** (Required for CMS write integration):
   - In Netlify, go to **Site configuration** -> **Environment variables**.
   - Click **Add a variable** and create:
     - **Key**: `GITHUB_TOKEN`
     - **Value**: *(Your GitHub Personal Access Token with repo/content scope)*
   - This allows the serverless function to write modifications directly back to `data/` in your repository when you save entries from the Admin Portal.

5. **Access Your Public Link**:
   - Netlify will generate a free public URL (e.g., `gkm-os-journey.netlify.app`). You can customize this subdomain for free or map a custom domain if desired.

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
