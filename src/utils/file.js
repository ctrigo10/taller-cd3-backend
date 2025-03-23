import fs from 'fs';
import { createHash } from 'crypto'

export const getFileBase64 = (path) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = fs.createReadStream(path);

    stream.on('error', reject);
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('base64'));
    });
  });
};

export const sha256 = (base64) => {
  return createHash('sha256').update(base64).digest('hex')
}