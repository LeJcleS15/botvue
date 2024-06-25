import { dbConfig, get, initDB, remove } from './indexedDB.ts';

const deleteData = async (storeName: string, keys: IDBValidKey[]): Promise<void> => {
    try {
        await initDB(dbConfig);
        const promises = keys.map(async key => {
            const result = await get(storeName, key);
            console.log(result);
            if (result) {
                await remove(storeName, key);
            }
        });

        await Promise.all(promises);
    } catch (e) {
        console.error('Failed to delete data:', e);
    }
};

export { deleteData };
