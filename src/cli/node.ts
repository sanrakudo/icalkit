import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { ICSChunk } from '../splitter/types.js';

/**
 * Write chunks to disk (Node.js only)
 * @param chunks - Array of ICS chunks to write
 * @param outputDir - Directory to write files to
 * @returns Array of file paths that were written
 */
export async function writeChunksToDirectory(
  chunks: ICSChunk[],
  outputDir: string,
): Promise<string[]> {
  // Create output directory if it doesn't exist
  await mkdir(outputDir, { recursive: true });

  const filePaths: string[] = [];

  for (const chunk of chunks) {
    const filePath = join(outputDir, chunk.fileName);
    await writeFile(filePath, chunk.content, 'utf-8');
    filePaths.push(filePath);
  }

  return filePaths;
}
