"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScannedFile } from "@/lib/storage/lan";

type Tab = "upload" | "lan";
type LanMode = "copy" | "reference";
type LanSource = "local" | "webdav";

interface DirEntry {
  name: string;
  path: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    count: number;
    errors: { filename: string; error: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LAN state
  const [lanSource, setLanSource] = useState<LanSource>("local");
  const [lanPath, setLanPath] = useState("");
  const [currentDir, setCurrentDir] = useState("");
  const [dirs, setDirs] = useState<DirEntry[]>([]);
  const [browsing, setBrowsing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [lanMode, setLanMode] = useState<LanMode>("copy");
  const [importing, setImporting] = useState(false);
  const [lanResult, setLanResult] = useState<string | null>(null);

  // WebDAV state
  const [webdavUrl, setWebdavUrl] = useState("");
  const [webdavUser, setWebdavUser] = useState("");
  const [webdavPass, setWebdavPass] = useState("");
  const [webdavConnected, setWebdavConnected] = useState(false);

  useEffect(() => {
    fetch("/api/admin/albums")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAlbums(data);
      })
      .catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setUploadResult(null);
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      if (albumId) formData.append("albumId", albumId);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadResult({
        count: data.count ?? 0,
        errors: data.errors ?? [],
      });
      if (data.count > 0) {
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      }
    } finally {
      setUploading(false);
    }
  }

  function buildWebdavParams(extra?: Record<string, string>) {
    const params = new URLSearchParams({
      source: "webdav",
      webdavUrl,
      ...(webdavUser && { webdavUser }),
      ...(webdavPass && { webdavPass }),
      ...(extra ?? {}),
    });
    return params;
  }

  async function handleBrowse(targetPath?: string) {
    const path = targetPath ?? lanPath.trim();
    if (!path) return;
    setBrowsing(true);
    setScannedFiles([]);
    setSelectedFiles(new Set());
    setLanResult(null);
    try {
      const params =
        lanSource === "webdav"
          ? buildWebdavParams({ path, mode: "browse" })
          : new URLSearchParams({ path, mode: "browse" });
      const res = await fetch(`/api/admin/upload?${params}`);
      const data = await res.json();
      if (data.error) {
        setLanResult(data.error);
        setDirs([]);
        return;
      }
      setDirs(data.dirs ?? []);
      setCurrentDir(path);
      if (targetPath) setLanPath(targetPath);
      if (lanSource === "webdav") setWebdavConnected(true);
    } catch {
      setLanResult("连接失败，请检查路径和凭据");
      setDirs([]);
    } finally {
      setBrowsing(false);
    }
  }

  function handleBreadcrumb(targetPath: string) {
    handleBrowse(targetPath);
  }

  const breadcrumbParts = currentDir
    ? currentDir.split("/").filter(Boolean)
    : [];

  async function handleScan() {
    if (!currentDir) return;
    setScanning(true);
    setScannedFiles([]);
    setSelectedFiles(new Set());
    setLanResult(null);
    try {
      const params =
        lanSource === "webdav"
          ? buildWebdavParams({ path: currentDir })
          : new URLSearchParams({ path: currentDir });
      const res = await fetch(`/api/admin/upload?${params}`);
      const data = await res.json();
      if (data.error) {
        setLanResult(data.error);
        return;
      }
      setScannedFiles(data.files ?? []);
    } finally {
      setScanning(false);
    }
  }

  function toggleFile(path: string) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function toggleAll() {
    if (selectedFiles.size === scannedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(scannedFiles.map((f) => f.path)));
    }
  }

  async function handleImport() {
    if (selectedFiles.size === 0) return;
    setImporting(true);
    setLanResult(null);
    try {
      let successCount = 0;
      const errors: string[] = [];
      for (const filePath of selectedFiles) {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lanPath: filePath,
            mode: lanSource === "webdav" ? "copy" : lanMode,
            albumId: albumId || undefined,
            source: lanSource,
            ...(lanSource === "webdav" && {
              webdavUrl,
              webdavUser: webdavUser || undefined,
              webdavPass: webdavPass || undefined,
            }),
          }),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        } else {
          errors.push(filePath);
        }
      }
      setLanResult(
        `导入完成: 成功 ${successCount} 张${
          errors.length > 0 ? `, 失败 ${errors.length} 张` : ""
        }`
      );
      if (successCount > 0) {
        setSelectedFiles(new Set());
        router.refresh();
      }
    } finally {
      setImporting(false);
    }
  }

  function handleSourceChange(source: LanSource) {
    setLanSource(source);
    setCurrentDir("");
    setDirs([]);
    setScannedFiles([]);
    setSelectedFiles(new Set());
    setLanResult(null);
    setWebdavConnected(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">上传照片</h1>
        <p className="text-dim mt-1 text-sm">批量上传或从局域网导入</p>
      </div>

      <div className="flex gap-2 border-b border-faint">
        <button
          onClick={() => setTab("upload")}
          className={cn(
            "px-4 py-2 text-sm border-b-2 -mb-px",
            tab === "upload"
              ? "border-ink text-ink"
              : "border-transparent text-dim hover:text-ink"
          )}
        >
          批量上传
        </button>
        <button
          onClick={() => setTab("lan")}
          className={cn(
            "px-4 py-2 text-sm border-b-2 -mb-px",
            tab === "lan"
              ? "border-ink text-ink"
              : "border-transparent text-dim hover:text-ink"
          )}
        >
          局域网导入
        </button>
      </div>

      {tab === "upload" ? (
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm text-dim mb-1">相册（可选）</label>
            <select
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
            >
              <option value="">无相册</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-faint rounded-lg p-8 text-center cursor-pointer hover:bg-dust/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-dim">
              {files.length > 0
                ? `已选择 ${files.length} 个文件`
                : "点击选择图片文件"}
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm text-dim px-3 py-1"
                >
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-faint">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="bg-ink text-bg px-4 py-2 rounded-md text-sm hover:bg-dim disabled:opacity-50"
          >
            {uploading ? "上传中..." : `上传 ${files.length} 张`}
          </button>

          {uploadResult && (
            <div className="space-y-2">
              {uploadResult.count > 0 && (
                <p className="text-sm text-ink">
                  上传成功 {uploadResult.count} 张{" "}
                  <Link
                    href="/admin/photos"
                    className="text-dim underline ml-2"
                  >
                    查看照片管理
                  </Link>
                </p>
              )}
              {uploadResult.errors.map((err, i) => (
                <p key={i} className="text-sm text-signal">
                  {err.filename}: {err.error}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {/* Source selector */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSourceChange("local")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md border",
                lanSource === "local"
                  ? "border-ink text-ink bg-paper"
                  : "border-faint text-dim hover:text-ink"
              )}
            >
              本地路径
            </button>
            <button
              onClick={() => handleSourceChange("webdav")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md border",
                lanSource === "webdav"
                  ? "border-ink text-ink bg-paper"
                  : "border-faint text-dim hover:text-ink"
              )}
            >
              WebDAV
            </button>
          </div>

          {/* WebDAV connection fields */}
          {lanSource === "webdav" && (
            <div className="space-y-3 p-4 border border-faint rounded-md bg-paper">
              <div>
                <label className="block text-sm text-dim mb-1">WebDAV 地址</label>
                <input
                  type="text"
                  value={webdavUrl}
                  onChange={(e) => { setWebdavUrl(e.target.value); setWebdavConnected(false); }}
                  placeholder="http://192.168.1.100:5005"
                  className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-dim mb-1">用户名（可选）</label>
                  <input
                    type="text"
                    value={webdavUser}
                    onChange={(e) => { setWebdavUser(e.target.value); setWebdavConnected(false); }}
                    className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dim mb-1">密码（可选）</label>
                  <input
                    type="password"
                    value={webdavPass}
                    onChange={(e) => { setWebdavPass(e.target.value); setWebdavConnected(false); }}
                    className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Path input */}
          <div>
            <label className="block text-sm text-dim mb-1">
              {lanSource === "webdav" ? "远程路径" : "NAS / 局域网路径"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={lanPath}
                onChange={(e) => setLanPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBrowse()}
                placeholder={lanSource === "webdav" ? "/" : "/mnt/nas/photos/"}
                className="flex-1 border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
              />
              <button
                onClick={() => handleBrowse()}
                disabled={!lanPath.trim() || browsing || (lanSource === "webdav" && !webdavUrl)}
                className="border border-faint text-dim px-4 py-2 rounded-md text-sm hover:bg-dust disabled:opacity-50"
              >
                {browsing ? "浏览中..." : "浏览"}
              </button>
            </div>
          </div>

          {/* Folder browser */}
          {currentDir && (
            <div className="border border-faint rounded-md overflow-hidden">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-faint bg-paper text-sm overflow-x-auto whitespace-nowrap">
                <button
                  onClick={() => handleBrowse("/")}
                  className="text-dim hover:text-ink shrink-0"
                >
                  /
                </button>
                {breadcrumbParts.map((part, i) => {
                  const fullPath = "/" + breadcrumbParts.slice(0, i + 1).join("/");
                  return (
                    <span key={fullPath} className="flex items-center gap-1 shrink-0">
                      <span className="text-faint">/</span>
                      <button
                        onClick={() => handleBreadcrumb(fullPath)}
                        className={cn(
                          "hover:text-ink",
                          i === breadcrumbParts.length - 1 ? "text-ink font-medium" : "text-dim"
                        )}
                      >
                        {part}
                      </button>
                    </span>
                  );
                })}
              </div>

              {/* Directory list */}
              <div className="max-h-64 overflow-y-auto">
                {browsing ? (
                  <div className="px-3 py-4 text-sm text-dim">加载中...</div>
                ) : dirs.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-faint">没有子文件夹</div>
                ) : (
                  dirs.map((dir) => (
                    <button
                      key={dir.path}
                      onClick={() => handleBrowse(dir.path)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-dust/20 text-left"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dim shrink-0">
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                      </svg>
                      <span className="truncate">{dir.name}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Scan button */}
              <div className="border-t border-faint px-3 py-2 bg-paper">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="text-sm text-ink hover:text-signal disabled:opacity-50"
                >
                  {scanning ? "扫描中..." : `扫描当前文件夹的图片`}
                </button>
              </div>
            </div>
          )}

          {/* Import mode — only for local source */}
          {lanSource === "local" && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={lanMode === "copy"}
                  onChange={() => setLanMode("copy")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-ink">复制到本地</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={lanMode === "reference"}
                  onChange={() => setLanMode("reference")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-ink">直接引用</span>
              </label>
            </div>
          )}

          {lanSource === "webdav" && (
            <p className="text-xs text-faint">WebDAV 导入为复制模式，文件会下载到服务器本地</p>
          )}

          {/* Scanned files */}
          {scannedFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-1.5 text-sm text-dim">
                <span>找到 {scannedFiles.length} 个图片文件</span>
                <button onClick={toggleAll} className="text-xs text-dim hover:text-ink underline">
                  {selectedFiles.size === scannedFiles.length ? "取消全选" : "全选"}
                </button>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {scannedFiles.map((file) => (
                  <label
                    key={file.path}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-dust/20 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.path)}
                      onChange={() => toggleFile(file.path)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-ink truncate flex-1">
                      {file.filename}
                    </span>
                    <span className="text-xs text-faint">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleImport}
                disabled={selectedFiles.size === 0 || importing}
                className="bg-ink text-bg px-4 py-2 rounded-md text-sm hover:bg-dim disabled:opacity-50"
              >
                {importing
                  ? "导入中..."
                  : `导入 ${selectedFiles.size} 个文件`}
              </button>
            </>
          )}

          {lanResult && (
            <p className="text-sm text-ink">{lanResult}</p>
          )}
        </div>
      )}
    </div>
  );
}
