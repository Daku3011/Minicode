# 🚆 MiniCode Railway Deployment Guide

This guide explains how to deploy the **MiniCode** backend and frontend on **Railway**, using **Supabase** as the PostgreSQL database.

---

## 🏗️ Architecture Overview

- **Database**: Supabase (PostgreSQL)
- **Backend**: Railway (FastAPI + Docker)
- **Frontend**: Railway (Next.js + Docker)

---

## 1️⃣ Set Up Supabase (Database)

1.  **Create Project**: Go to [Supabase](https://supabase.com/) and create a new project named `minicode`.
2.  **Get Connection String**: 
    - Go to **Project Settings → Database**.
    - Copy the **URI** connection string (select the **Transaction** pooler on port `6543`).
    - Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
    - Replace `[PASSWORD]` with your database password.

---

## 2️⃣ Deploy Backend on Railway

1.  **Login to Railway**: Go to [Railway.app](https://railway.app/).
2.  **Create New Project**: Click **New Project** → **Deploy from GitHub repo**.
3.  **Select Repository**: Choose your `Minicode` repository.
4.  **Configure Service**:
    - **Root Directory**: `backend`
    - Railway will automatically detect the `Dockerfile` in the `backend` folder.
5.  **Add Variables**: Go to the **Variables** tab and add:
    - `DATABASE_URL`: Your Supabase connection string (Step 1).
    - `GEMINI_API_KEY`: Your Google Gemini API key.
    - `GITHUB_CLIENT_ID`: From your GitHub OAuth App.
    - `GITHUB_CLIENT_SECRET`: From your GitHub OAuth App.
    - `GITHUB_TOKEN`: Your GitHub Personal Access Token.
    - `JWT_SECRET`: A long random string.
    - `CORS_ORIGINS`: `*` (or your frontend Railway URL once deployed).
    - `PORT`: `8000` (Railway will map this automatically).
6.  **Pre-deploy Command (Database Tables)**: 
    - Unlike Render, Railway doesn't have a dedicated "Pre-deploy" field. 
    - To create your tables, go to the **Shell** tab of your backend service on Railway and run:
      ```bash
      CREATE_TABLES=1 python main.py
      ```
    - Alternatively, you can temporarily set the start command to `CREATE_TABLES=1 python main.py && gunicorn...` but the shell method is safer.
7.  **Deploy**: Railway will build the Docker image and deploy. Note your **Backend URL** (e.g., `https://backend-production.up.railway.app`).

---

## 3️⃣ Deploy Frontend on Railway

1.  **New Service**: In the same Railway project, click **New** → **GitHub Repo**.
2.  **Select Repository**: Choose the same `Minicode` repository.
3.  **Configure Service**:
    - **Root Directory**: `frontend`
    - Railway will detect the `frontend/Dockerfile`.
4.  **Add Variables**:
    - `NEXT_PUBLIC_API_URL`: Your **Backend URL** from Step 2.
    - `NEXT_PUBLIC_GITHUB_CLIENT_ID`: Your GitHub Client ID.
5.  **Build Customization**: Since Next.js variables are needed at **build time**, ensure they are set in the Railway UI *before* the first build.
6.  **Deploy**: Wait for the build to finish. Get your **Frontend URL**.

---

## 4️⃣ Final Configuration

1.  **GitHub OAuth**: Update your GitHub OAuth App's **Callback URL** to:
    `https://YOUR_FRONTEND_RAILWAY_URL/auth/callback`
2.  **Seed Database**: 
    - Open the Railway **Dashboard** for the backend service.
    - Go to the **Shell** tab or run locally:
      ```bash
      DATABASE_URL="your_supabase_url" python backend/seed.py
      ```

---

## 🚀 Scaling & Performance

- **Memory**: Railway's free tier is generous (512MB+), but the frontend Next.js build might need more. Monitor the build logs.
- **Port**: Ensure the `PORT` variable in Railway matches the `EXPOSE` port in your Dockerfiles.
- **Networking**: For better security, you can use Railway's **Internal Networking** so the frontend talks to the backend privately.
