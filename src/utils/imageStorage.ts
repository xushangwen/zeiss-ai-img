// IndexedDB 图片存储工具
// 解决 localStorage 容量限制问题

const DB_NAME = 'zeiss-ai-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let db: IDBDatabase | null = null;

// 初始化数据库
export async function initImageDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// 保存图片到 IndexedDB
export async function saveImage(id: string, data: string): Promise<void> {
  const database = await initImageDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, data, savedAt: Date.now() });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// 从 IndexedDB 获取图片
export async function getImage(id: string): Promise<string | null> {
  const database = await initImageDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result?.data || null);
    };
  });
}

// 删除图片
export async function deleteImage(id: string): Promise<void> {
  const database = await initImageDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// 获取所有图片 ID
export async function getAllImageIds(): Promise<string[]> {
  const database = await initImageDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result as string[]);
    };
  });
}

// 清理不再使用的图片
export async function cleanupUnusedImages(usedIds: string[]): Promise<void> {
  const allIds = await getAllImageIds();
  const unusedIds = allIds.filter((id) => !usedIds.includes(id));

  for (const id of unusedIds) {
    await deleteImage(id);
  }
}
