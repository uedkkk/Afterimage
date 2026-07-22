declare module "@tryghost/koenig-lexical" {
  import type { ComponentType, ReactNode } from "react";

  export interface KoenigComposerProps {
    cardConfig?: Record<string, unknown>;
    darkMode?: boolean;
    fileUploader?: {
      useFileUpload: (type?: string) => {
        progress: number;
        isLoading: boolean;
        upload: (files: File[], options?: Record<string, unknown>) => Promise<Array<{ url: string; fileName: string }> | null>;
        errors: Array<{ fileName: string; message: string }>;
        filesNumber: number;
      };
      fileTypes: Record<string, { mimeTypes: string[]; extensions: string[] }>;
    };
    initialEditorState?: string;
    isTKEnabled?: boolean;
    nodes?: unknown[];
    enableMultiplayer?: boolean;
    multiplayerEndpoint?: string;
    multiplayerDocId?: string;
    multiplayerUsername?: string;
    multiplayerDebug?: boolean;
    onError?: (error: Error) => void;
    children: ReactNode;
  }

  export const KoenigComposer: ComponentType<KoenigComposerProps>;

  export interface KoenigEditorProps {
    onChange?: (editorStateJSON: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    registerAPI?: (api: unknown) => void;
    cursorDidExitAtTop?: () => void;
    darkMode?: boolean;
    placeholder?: ReactNode;
    singleParagraph?: boolean;
    readOnly?: boolean;
    isDragEnabled?: boolean;
    isSnippetsEnabled?: boolean;
    children?: ReactNode;
  }

  export const KoenigEditor: ComponentType<KoenigEditorProps>;
  export const KoenigComposableEditor: ComponentType<KoenigEditorProps>;

  export const DEFAULT_NODES: unknown[];
  export const BASIC_NODES: unknown[];
  export const MINIMAL_NODES: unknown[];
  export const DEFAULT_TRANSFORMERS: unknown[];
  export const BASIC_TRANSFORMERS: unknown[];
  export const MINIMAL_TRANSFORMERS: unknown[];

  export const AllDefaultPlugins: ComponentType<{ children?: ReactNode }>;
  export const WordCountPlugin: ComponentType<{ onChange: (count: number) => void }>;
  export const TKCountPlugin: ComponentType<{ onChange: (count: number) => void }>;
}
