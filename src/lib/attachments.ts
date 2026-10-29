const DB_NAME = "compass-portal-files";
const STORE = "results";

export type ResultAttachment = {
  visitId: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "visitId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function isPdfFile(file: File) {
  const name = file.name.toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf");
}

export async function saveResultFile(visitId: string, file: File): Promise<ResultAttachment> {
  const record: ResultAttachment = {
    visitId,
    name: file.name,
    type: file.type || "application/pdf",
    size: file.size,
    blob: file,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return record;
}

export async function getResultFile(visitId: string): Promise<ResultAttachment | null> {
  const db = await openDb();
  const record = await new Promise<ResultAttachment | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(visitId);
    req.onsuccess = () => resolve((req.result as ResultAttachment | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return record;
}

export async function clearResultFiles() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
