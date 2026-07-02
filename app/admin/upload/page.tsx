"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScannedFile } from "@/lib/storage/lan";

type Tab = "upload" | "lan";
type LanMode = "copy" | "reference";

export default function UploadPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    count: number;
    errors: { filename: string; error: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LAN state
  const [lanPath, setLanPath] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [lanMode, setLanMode] = useState<LanMode>("copy");
  const [importing, setImporting] = useState(false);
  const [lanResult, setLanResult] = useState<string | null>(null);

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

  async function handleScan() {
    if (!lanPath.trim()) return;
    setScanning(true);
    setScannedFiles([]);
    setSelectedFiles(new Set());
    setLanResult(null);
    try {
      const res = await fetch(
        `/api/admin/upload?path=${encodeURIComponent(lanPath)}`
      );
      const data = await res.json();
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
            mode: lanMode,
            albumId: albumId || undefined,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">上传照片</h1>
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
            <input
              type="text"
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              placeholder="输入相册 ID"
              className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
            />
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-faint rounded-lg p-8 text-center cursor-pointer hover:bg-faint/20"
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
                <p key={i} className="text-sm text-accent">
                  {err.filename}: {err.error}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm text-dim mb-1">NAS / 局域网路径</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={lanPath}
                onChange={(e) => setLanPath(e.target.value)}
                placeholder="/mnt/nas/photos/"
                className="flex-1 border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
              />
              <button
                onClick={handleScan}
                disabled={!lanPath.trim() || scanning}
                className="border border-faint text-dim px-4 py-2 rounded-md text-sm hover:bg-faint disabled:opacity-50"
              >
                {scanning ? "扫描中..." : "扫描"}
              </button>
            </div>
          </div>

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

          {scannedFiles.length > 0 && (
            <>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {scannedFiles.map((file) => (
                  <label
                    key={file.path}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-faint/20 rounded-md cursor-pointer"
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
