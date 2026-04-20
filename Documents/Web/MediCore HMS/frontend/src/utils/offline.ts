import { storage } from './storage';
import api from '@/services/api';

interface SyncItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
}

export const syncManager = {
  async syncAll(): Promise<{ success: number; failed: number }> {
    const unsynced = await storage.getAllUnsynced();
    let success = 0;
    let failed = 0;

    const syncItem = async (item: { id: string; action: string; data: unknown }, type: 'patients' | 'bills') => {
      try {
        const endpoint = type === 'patients' ? `/patients/${item.id}` : `/bills/${item.id}`;
        
        switch (item.action) {
          case 'create':
            await api.post(endpoint.replace(`/${item.id}`, ''), item.data);
            break;
          case 'update':
            await api.put(endpoint, item.data);
            break;
          case 'delete':
            await api.delete(endpoint);
            break;
        }
        
        if (type === 'patients') {
          await storage.markPatientSynced(item.id);
        } else {
          await storage.markBillSynced(item.id);
        }
        success++;
      } catch {
        failed++;
      }
    };

    await Promise.all([
      ...unsynced.patients.map((p) => syncItem(p, 'patients')),
      ...unsynced.bills.map((b) => syncItem(b, 'bills')),
    ]);

    return { success, failed };
  },

  async addToQueue(item: SyncItem): Promise<void> {
    await storage.savePatient({ id: item.id } as any);
  },

  async clearSynced(): Promise<void> {
    await storage.clearSynced();
  },

  isOnline(): boolean {
    return navigator.onLine;
  },
};

export const conflictResolution = {
  resolve(localData: unknown, remoteData: unknown, strategy: 'last-write-wins' | 'merge'): unknown {
    if (strategy === 'last-write-wins') {
      return remoteData;
    }
    return { ...(localData as Record<string, unknown>), ...(remoteData as Record<string, unknown>) };
  },
};