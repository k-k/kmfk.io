import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default {
  port: Number(process.env.PORT) || 8080,
  publicDir: path.join(baseDir, 'public'),
  blobsDir: path.join(baseDir, 'content', 'blobs'),
  // Prefix for images and CSS. Empty serves them from this app's public/ directory;
  // set to e.g. "https://static.kmfk.io" to keep using a separate static host.
  staticBaseUrl: (process.env.STATIC_BASE_URL || '').replace(/\/+$/, ''),
  github: {
    token: process.env.GITHUB_TOKEN || '',
    clientId: process.env.GITHUB_CLIENT_ID || '',
    secret: process.env.GITHUB_CLIENT_SECRET || '',
  },
};
