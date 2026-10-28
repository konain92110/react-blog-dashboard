# Fieldnotes Blog

A small full-stack blog built with Express, static JSON data, and React. The API serves paginated posts and individual posts by slug; the frontend provides a journal index and article pages with loading and error states.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173). The Express API runs on http://localhost:3001.

## API

- `GET /api/posts?page=1&limit=4` returns `{ data, pagination }`.
- `GET /api/posts/:slug` returns `{ data }` or a `404` error.
- Page and limit must be positive integers; limit is capped at 20.

The source data lives in `server/data/posts.json`.

## Production build

```sh
npm run build
npm start
```

## Publish to GitHub

Create an empty repository on GitHub, then run these commands from this project folder:

```sh
git init
git add .
git commit -m "Build Fieldnotes blog and posts API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
