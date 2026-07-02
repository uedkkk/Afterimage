import { createClient, type WebDAVClient } from "webdav";

export interface WebDAVConfig {
  url: string;
  username?: string;
  password?: string;
}

export interface WebDAVDirEntry {
  name: string;
  path: string;
}

export interface WebDAVScannedFile {
  filename: string;
  path: string;
  size: number;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".raw"];

function createWebDAVClient(config: WebDAVConfig): WebDAVClient {
  return createClient(config.url, {
    username: config.username,
    password: config.password,
  });
}

export async function testWebDAVConnection(
  config: WebDAVConfig
): Promise<boolean> {
  try {
    const client = createWebDAVClient(config);
    return await client.exists("/");
  } catch {
    return false;
  }
}

export async function listWebDAVDirectories(
  config: WebDAVConfig,
  dirPath: string
): Promise<WebDAVDirEntry[]> {
  const client = createWebDAVClient(config);
  const entries = await client.getDirectoryContents(dirPath);

  return entries
    .filter((entry) => entry.type === "directory")
    .map((entry) => ({
      name: entry.basename,
      path: entry.filename,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function scanWebDAVDirectory(
  config: WebDAVConfig,
  dirPath: string
): Promise<WebDAVScannedFile[]> {
  const client = createWebDAVClient(config);
  const results: WebDAVScannedFile[] = [];

  async function scan(path: string) {
    const entries = await client.getDirectoryContents(path);
    for (const entry of entries) {
      if (entry.type === "directory") {
        await scan(entry.filename);
      } else {
        const ext = "." + (entry.basename.split(".").pop() ?? "").toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          results.push({
            filename: entry.basename,
            path: entry.filename,
            size: entry.size || 0,
          });
        }
      }
    }
  }

  await scan(dirPath);
  return results;
}

export async function readWebDAVFile(
  config: WebDAVConfig,
  filePath: string
): Promise<Buffer> {
  const client = createWebDAVClient(config);
  const data = await client.getFileContents(filePath, { format: "binary" });
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  return Buffer.from(data as string);
}
