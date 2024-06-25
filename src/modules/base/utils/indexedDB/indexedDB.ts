import { openDB, IDBPDatabase } from 'idb';

interface StoreSchema {
    key: string;
    value: string;
}

interface ObjectStoreMeta {
    store: string;
    storeConfig: {
        keyPath: string;
        autoIncrement: boolean;
    };
    storeSchema: StoreSchema[];
}

interface DBConfig {
    name: string;
    version: number;
    objectStoresMeta: ObjectStoreMeta[];
}

let db: IDBPDatabase | null = null;

export const initDB = async (config: DBConfig): Promise<void> => {
    try {
        db = await openDB(config.name, config.version, {
            upgrade(db) {
                config.objectStoresMeta.forEach(meta => {
                    if (!db.objectStoreNames.contains(meta.store)) {
                        const store = db.createObjectStore(meta.store, meta.storeConfig);
                        meta.storeSchema.forEach(schema => {
                            store.createIndex(schema.key, schema.value);
                        });
                    }
                });
            },
        });
    } catch (err) {
        console.error('Failed to open db:', err);
    }
};

export const add = async (storeName: string, value: any): Promise<IDBValidKey | null> => {
    try {
        return db?.add(storeName, value) || null;
    } catch (err) {
        console.error('Failed to add:', err);
        return null;
    }
};

export const get = async (storeName: string, key: IDBValidKey): Promise<any | null> => {
    try {
        return db?.get(storeName, key) || null;
    } catch (err) {
        console.error('Failed to get:', err);
        return null;
    }
};

export const remove = async (storeName: string, key: IDBValidKey): Promise<void> => {
    try {
        db?.delete(storeName, key);
    } catch (err) {
        console.error('Failed to remove:', err);
    }
};

export const update = async (storeName: string, value: any): Promise<IDBValidKey | null> => {
    try {
        return db?.put(storeName, value) || null;
    } catch (err) {
        console.error('Failed to update:', err);
        return null;
    }
};

export const getAllKeys = async (storeName: string): Promise<IDBValidKey[] | null> => {
    try {
        const tx = db?.transaction(storeName, 'readonly');
        const store = tx?.objectStore(storeName);
        return store?.getAllKeys() || null;
    } catch (err) {
        console.error('Failed to get all keys:', err);
        return null;
    }
};

export const dbConfig: DBConfig = {
    name: "AIObot",
    version: 2,
    objectStoresMeta: [
        {
            store: "starkTransactions",
            storeConfig: { keyPath: "address", autoIncrement: false },
            storeSchema: [
                { key: "address", value: "address" },
                { key: "data", value: "data" },
            ],
        },
        {
            store: "zkTransactions",
            storeConfig: { keyPath: "address", autoIncrement: false },
            storeSchema: [
                { key: "address", value: "address" },
                { key: "data", value: "data" },
            ],
        },
        {
            store: "zkProtocol",
            storeConfig: { keyPath: "address", autoIncrement: false },
            storeSchema: [
                { key: "address", value: "address" },
                { key: "data", value: "data" },
            ],
        },
        {
            store: "WalletManage",
            storeConfig: { keyPath: "address", autoIncrement: false },
            storeSchema: [
                { key: "group", value: "group" },
                { key: "address", value: "address" },
                { key: "privateKey", value: "data" },
                { key: "token", value: "data" },
                { key: "settoken", value: "data" },
                { key: "data", value: "data" },
            ],
        },
        {
            store: "solWalletManage",
            storeConfig: { keyPath: "address", autoIncrement: false },
            storeSchema: [
                { key: "address", value: "address" },
                { key: "data", value: "data" },
            ],
        },
    ],
};
