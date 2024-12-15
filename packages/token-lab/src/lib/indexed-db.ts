let dbReq: IDBOpenDBRequest | undefined;
let dbReqFuture: Promise<IDBDatabase> | undefined;
let dbReqResult: IDBDatabase | undefined;

/** Connect to DB, using singletons to dedupe connections across hooks */
export async function getDB(
  name: string,
  {
    version = 1,
    onupgradeneeded,
  }: { version?: number; onupgradeneeded?: NonNullable<IDBOpenDBRequest['onupgradeneeded']> } = {},
): Promise<IDBDatabase> {
  console.time('IndexedDB init');
  if (dbReqResult) {
    return dbReqResult;
  }
  if (!dbReq) {
    dbReq = window.indexedDB.open(name, version);
  }
  if (dbReqFuture) {
    return await dbReqFuture;
  }
  dbReqFuture = new Promise<IDBDatabase>((resolve, reject) => {
    dbReq!.onerror = (evt) => {
      reject(`IndexedDB not supported. Unable to save tokens!\nError: ${(evt.target as IDBOpenDBRequest).error}`);
    };
    if (onupgradeneeded) {
      dbReq!.onupgradeneeded = onupgradeneeded;
    }
    dbReq!.onsuccess = () => {
      console.timeEnd('IndexedDB init');
      dbReqResult = dbReq!.result;
      resolve(dbReq!.result);
    };
  });
  return await dbReqFuture;
}
