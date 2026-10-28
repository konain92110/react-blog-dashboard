import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 3001;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const postsPath = path.join(currentDirectory, 'data', 'posts.json');
const webDirectory = path.resolve(currentDirectory, '..', 'dist');

async function getPosts() {
  const contents = await readFile(postsPath, 'utf8');
  return JSON.parse(contents);
}

app.get('/api/posts', async (request, response, next) => {
  try {
    const posts = await getPosts();
    const page = Number.parseInt(request.query.page ?? '1', 10);
    const limit = Number.parseInt(request.query.limit ?? '4', 10);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 20) {
      return response.status(400).json({ error: 'Page must be positive and limit must be between 1 and 20.' });
    }

    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return response.json({
      data: posts.slice(start, start + limit),
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/posts/:slug', async (request, response, next) => {
  try {
    const posts = await getPosts();
    const post = posts.find((item) => item.slug === request.params.slug);

    if (!post) {
      return response.status(404).json({ error: 'Post not found.' });
    }

    return response.json({ data: post });
  } catch (error) {
    return next(error);
  }
});

app.use(express.static(webDirectory));
app.get(/^\/(?!api(?:\/|$)).*/, (request, response, next) => {
  response.sendFile(path.join(webDirectory, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Something went wrong while loading posts.' });
});

app.listen(port, () => {
  console.log(`Posts API listening on http://localhost:${port}`);
});
