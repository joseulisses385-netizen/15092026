const fs = require('fs');

const code = `
import { Product, StoreSettings, Supplier, Manufacturer, Order, StaffUser, Customer } from '../types';
import { db, collection, doc, getDocs, setDoc, getDoc, deleteDoc as fbDeleteDoc } from '../firebase';

export interface ServerStoreResponse {
  initialized: boolean;
  settings?: StoreSettings;
  products?: Product[];
  suppliers?: Supplier[];
  manufacturers?: Manufacturer[];
  orders?: Order[];
  staffUsers?: StaffUser[];
  customers?: Customer[];
  updatedAt?: string;
}

const SETTINGS_ID = 'main_settings';

async function fetchCollection<T>(collName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collName));
    return snap.docs.map(d => d.data() as T);
  } catch (e) {
    console.warn('Firestore get error:', e);
    return [];
  }
}

async function syncCollection<T extends { id: string }>(collName: string, items: T[]): Promise<boolean> {
  try {
    for (const item of items) {
      if (item.id) {
        await setDoc(doc(db, collName, item.id), item, { merge: true });
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchStoreFromServer(): Promise<ServerStoreResponse | null> {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', SETTINGS_ID));
    
    // Check if initialized
    if (!settingsSnap.exists()) {
      return null;
    }
    
    const settings = settingsSnap.data() as StoreSettings;
    const products = await fetchCollection<Product>('products');
    const orders = await fetchCollection<Order>('orders');
    const customers = await fetchCollection<Customer>('customers');
    const suppliers = await fetchCollection<Supplier>('suppliers');
    const manufacturers = await fetchCollection<Manufacturer>('manufacturers');
    const staffUsers = await fetchCollection<StaffUser>('staffUsers');
    
    return {
      initialized: true,
      settings,
      products,
      orders,
      customers,
      suppliers,
      manufacturers,
      staffUsers
    };
  } catch (err) {
    console.warn('[storeApi] Erro Firestore:', err);
    return null;
  }
}

export async function initServerStore(payload: any): Promise<boolean> {
  try {
    if (payload.settings) await syncSettingsToServer(payload.settings);
    if (payload.products) await syncProductsToServer(payload.products);
    if (payload.orders) await syncOrdersToServer(payload.orders);
    if (payload.customers) await syncCustomersToServer(payload.customers);
    if (payload.suppliers) await syncSuppliersToServer(payload.suppliers);
    if (payload.manufacturers) await syncManufacturersToServer(payload.manufacturers);
    return true;
  } catch {
    return false;
  }
}

export async function syncSettingsToServer(settings: StoreSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, 'settings', SETTINGS_ID), settings, { merge: true });
    return true;
  } catch { return false; }
}

export async function syncProductsToServer(products: Product[]): Promise<boolean> {
  return syncCollection('products', products);
}

export async function syncSuppliersToServer(suppliers: Supplier[]): Promise<boolean> {
  return syncCollection('suppliers', suppliers);
}

export async function syncManufacturersToServer(manufacturers: Manufacturer[]): Promise<boolean> {
  return syncCollection('manufacturers', manufacturers);
}

export async function syncOrdersToServer(orders: Order[]): Promise<boolean> {
  return syncCollection('orders', orders);
}

export async function syncCustomersToServer(customers: Customer[]): Promise<boolean> {
  return syncCollection('customers', customers);
}

export async function fetchCustomersFromServer(): Promise<Customer[]> {
  return fetchCollection<Customer>('customers');
}

export async function saveCustomerToServer(customer: Partial<Customer>) {
  try {
    const customers = await fetchCustomersFromServer();
    
    let existingIndex = customers.findIndex(c => c.id === customer.id || (c.cpf && c.cpf === customer.cpf) || (c.email && c.email === customer.email));
    
    let updatedCustomer = { ...customer } as Customer;
    if (existingIndex >= 0) {
      updatedCustomer = { ...customers[existingIndex], ...customer, updatedAt: new Date().toISOString() } as Customer;
    } else {
      updatedCustomer.createdAt = updatedCustomer.createdAt || new Date().toISOString();
    }
    
    // Fallback if no ID is present
    if (!updatedCustomer.id) {
      updatedCustomer.id = 'CUST-' + Math.random().toString(36).substr(2, 9);
    }
    
    await setDoc(doc(db, 'customers', updatedCustomer.id), updatedCustomer, { merge: true });
    return { success: true, customer: updatedCustomer };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function recoverCustomerOnServer(identifier: string) {
  const customers = await fetchCustomersFromServer();
  const found = customers.find(c => c.cpf === identifier || c.email === identifier || c.phone === identifier);
  if (found) return { success: true, found: true, customer: found };
  return { success: true, found: false };
}

export async function anonymizeCustomerOnServer(id: string) {
  try {
    const custRef = doc(db, 'customers', id);
    const snap = await getDoc(custRef);
    if (!snap.exists()) return { success: false, message: 'Não encontrado' };
    
    const anonymized = {
      ...snap.data(),
      name: 'Cliente Anonimizado',
      phone: '',
      email: '',
      cpf: '',
      address: '',
      cep: '',
      updatedAt: new Date().toISOString(),
      lgpdConsent: false
    };
    await setDoc(custRef, anonymized);
    return { success: true, customer: anonymized as Customer };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteCustomerOnServer(id: string) {
  try {
    await fbDeleteDoc(doc(db, 'customers', id));
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function syncCustomersFromOrdersOnServer() {
  return { success: true, message: 'Sincronizado via Firebase' };
}

export async function uploadLogoToServer(dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch('/api/store/upload-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.logoUrl || null;
  } catch { return null; }
}

export async function resetLogoOnServer(): Promise<string | null> {
  try {
    const res = await fetch('/api/store/reset-logo', { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.logoUrl || null;
  } catch { return null; }
}

export async function resetServerStore(): Promise<boolean> {
  // Can't easily drop all collections in client SDK. We will just delete settings to trigger re-init.
  try {
    await fbDeleteDoc(doc(db, 'settings', SETTINGS_ID));
    return true;
  } catch { return false; }
}

export async function loginStaffUser(username: string, password: string) {
  try {
    const res = await fetch('/api/store/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Erro de conexão' };
  }
}

export async function recoverAdminPassword(email: string) {
  try {
    const res = await fetch('/api/store/auth/recover-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Erro de conexão' };
  }
}

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  return fetchCollection<StaffUser>('staffUsers');
}

export async function saveStaffUsers(users: StaffUser[]): Promise<boolean> {
  return syncCollection('staffUsers', users);
}
`;

fs.writeFileSync('src/services/storeApi.ts', code);
