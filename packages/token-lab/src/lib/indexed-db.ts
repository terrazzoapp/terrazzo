export async function getDB(
  name: string,
  {
    version = 1,
    onupgradeneeded,
  }: {
    version?: number;
    onupgradeneeded?: NonNullable<IDBOpenDBRequest['onupgradeneeded']>;
  } = {},
): Promise<IDBDatabase> {
  return await new Promise<IDBDatabase>((resolve, reject) => {
    const dbReq = window.indexedDB.open(name, version);
    dbReq.onerror = (evt) => {
      reject(`IndexedDB not supported. Unable to save tokens!\nError: ${(evt.target as IDBOpenDBRequest).error}`);
    };
    if (onupgradeneeded) {
      dbReq.onupgradeneeded = onupgradeneeded;
    }
    dbReq.onsuccess = () => {
      resolve(dbReq!.result);
    };
  });
}
