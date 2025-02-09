/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WSL_PYTHON_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
