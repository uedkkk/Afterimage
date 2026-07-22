"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { KoenigComposer, KoenigEditor } from "@tryghost/koenig-lexical";
import { isLexicalContent } from "@/lib/editor-utils";

function useFileUpload(_type = "") {
  const [progress, setProgress] = useState(100);
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fileName: string; message: string }[]>([]);
  const [filesNumber, setFilesNumber] = useState(0);

  async function upload(files: File[] = []) {
    setFilesNumber(files.length);
    setLoading(true);
    setProgress(30);

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/admin/editor-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setProgress(100);
      setLoading(false);

      if (data.errors?.length) {
        setErrors(data.errors);
        return null;
      }

      return (
        data.results?.map((r: { url: string; fileName: string }) => ({
          url: r.url,
          fileName: r.fileName,
        })) ?? null
      );
    } catch {
      setErrors([{ fileName: "upload", message: "上传失败" }]);
      setLoading(false);
      setProgress(100);
      return null;
    }
  }

  return { progress, isLoading, upload, errors, filesNumber };
}

const fileTypes = {
  image: {
    mimeTypes: ["image/gif", "image/jpg", "image/jpeg", "image/png", "image/svg+xml", "image/webp"],
    extensions: ["gif", "jpg", "jpeg", "png", "svg", "svgz", "webp"],
  },
  video: {
    mimeTypes: ["video/mp4", "video/webm", "video/ogg"],
    extensions: ["mp4", "webm", "ogv"],
  },
  audio: {
    mimeTypes: ["audio/mp3", "audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"],
    extensions: ["mp3", "wav", "ogg", "m4a"],
  },
  mediaThumbnail: {
    mimeTypes: ["image/gif", "image/jpg", "image/jpeg", "image/png", "image/webp"],
    extensions: ["gif", "jpg", "jpeg", "png", "webp"],
  },
  file: {
    mimeTypes: [],
    extensions: [],
  },
};

const fileUploader = { useFileUpload, fileTypes };

const cardConfig = {
  unsplash: null,
  klipy: null,
  fetchEmbed: async () => null,
  fetchAutocompleteLinks: async () => [],
  fetchLabels: async () => [],
  searchLinks: async () => [],
  siteTitle: "Afterimage",
  siteDescription: "光影的残像",
  siteUrl: "",
  membersEnabled: false,
  stripeEnabled: false,
  renderLabels: false,
  feature: { transistor: false },
};

interface KoenigEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
}

export function KoenigEditorWrapper({ value, onChange }: KoenigEditorWrapperProps) {
  const initialContent = useRef(
    isLexicalContent(value) ? value : undefined
  ).current;

  const handleChange = useCallback(
    (editorState: unknown) => {
      if (typeof editorState === "string") {
        onChange(editorState);
      } else if (editorState && typeof editorState === "object") {
        try {
          onChange(JSON.stringify(editorState));
        } catch {}
      }
    },
    [onChange]
  );

  const memoizedCardConfig = useMemo(() => ({
    ...cardConfig,
    siteUrl: typeof window !== "undefined" ? window.location.origin : "",
  }), []);

  const memoizedFileUploader = useMemo(() => fileUploader, []);

  return (
    <div
      className="koenig-lexical border border-faint rounded-md bg-paper overflow-hidden"
      style={{ minHeight: "420px" }}
    >
      <KoenigComposer
        cardConfig={memoizedCardConfig}
        darkMode={false}
        fileUploader={memoizedFileUploader}
        initialEditorState={initialContent}
        isTKEnabled={true}
      >
        <KoenigEditor onChange={handleChange} />
      </KoenigComposer>
    </div>
  );
}
