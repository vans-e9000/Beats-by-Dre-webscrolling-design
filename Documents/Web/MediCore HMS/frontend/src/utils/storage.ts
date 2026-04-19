import Dexie, { Table } from 'dexie';
import { OfflineRecord, Patient, Bill } from '@/types';

class MediCoreDB extends Dexie {
  patients!: Table<OfflineRecord<Patient>, string>;
  bills!: Table<OfflineRecord<Bill>, string>;
  syncQueue!: Table<OfflineRecord<unknown>, string>;

  constructor() {
    super('MediCoreDB');
    this.version(1).stores({
      patients: 'id, action, timestamp, synced',
      bills: 'id, action, timestamp, synced',
      syncQueue: 'id, action, timestamp, synced',
    });
  }
}

export const db = new MediCoreDB();

export const storage = {
  async savePatient(patient: Patient): Promise<void> {
    await db.patients.put({
      id: patient.id,
      data: patient,
      action: 'update',
      timestamp: Date.now(),
      synced: false,
    });
  },

  async getUnsyncedPatients(): Promise<OfflineRecord<Patient>[]> {
    return db.patients.where('synced').equals(0).toArray();
  },

  async deletePatient(id: string): Promise<void> {
    await db.patients.put({
      id,
      data: {} as Patient,
      action: 'delete',
      timestamp: Date.now(),
      synced: false,
    });
  },

  async markPatientSynced(id: string): Promise<void> {
    await db.patients.update(id, { synced: true });
  },

  async saveBill(bill: Bill): Promise<void> {
    await db.bills.put({
      id: bill.id,
      data: bill,
      action: 'update',
      timestamp: Date.now(),
      synced: false,
    });
  },

  async getUnsyncedBills(): Promise<OfflineRecord<Bill>[]> {
    return db.bills.where('synced').equals(0).toArray();
  },

  async deleteBill(id: string): Promise<void> {
    await db.bills.put({
      id,
      data: {} as Bill,
      action: 'delete',
      timestamp: Date.now(),
      synced: false,
    });
  },

  async markBillSynced(id: string): Promise<void> {
    await db.bills.update(id, { synced: true });
  },

  async getAllUnsynced(): Promise<{ patients: OfflineRecord<Patient>[]; bills: OfflineRecord<Bill>[] }> {
    const patients = await storage.getUnsyncedPatients();
    const bills = await storage.getUnsyncedBills();
    return { patients, bills };
  },

  async clearSynced(): Promise<void> {
    await Promise.all([
      db.patients.where('synced').equals(1).delete(),
      db.bills.where('synced').equals(1).delete(),
    ]);
  },
};