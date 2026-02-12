declare module 'react-toastify/dist/ReactToastify.css'
declare module '@/styles/globals.css'
interface StorageResult {
  key: string
  value: string
  shared: boolean
}

interface ListResult {
  keys: string[]
  prefix?: string
  shared: boolean
}

interface Window {
  storage: {
    get(key: string, shared?: boolean): Promise<StorageResult | null>
    set(key: string, value: string, shared?: boolean): Promise<StorageResult | null>
    delete(key: string, shared?: boolean): Promise<{ key: string; deleted: boolean; shared: boolean } | null>
    list(prefix?: string, shared?: boolean): Promise<ListResult | null>
  }
  fs: {
    readFile(filepath: string, options?: { encoding?: string }): Promise<Uint8Array | string>
  }
}