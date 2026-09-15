const fs = require('fs');

const code = `
import { Product, StoreSettings, Supplier, Manufacturer, Order, StaffUser, Customer } from '../types';
import { db, collection, doc, getDocs, setDoc, getDoc } from '../firebase';
import { deleteDoc } from 'firebase/firestore';

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

const GLOBAL_DOC_ID = 'global_store_state';
const STORE_COLL = 'store';

// We store everything in a single document for simplicity to mimic the existing storeApi JSON behavior
export async function fetchStoreFromServer(): Promise<ServerStoreResponse | null> {
  try {
    const snap = await getDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID));
    if (snap.exists()) {
      return snap.data() as ServerStoreResponse;
    }
    return null;
  } catch (err) {
    console.warn('[storeApi] Erro Firestore:', err);
    return null;
  }
}

export async function initServerStore(payload: any): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), {
      ...payload,
      initialized: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

export async function syncSettingsToServer(settings: StoreSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { settings }, { merge: true });
    return true;
  } catch { return false; }
}

export async function syncProductsToServer(products: Product[]): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { products }, { merge: true });
    return true;
  } catch { return false; }
}

export async function syncSuppliersToServer(suppliers: Supplier[]): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { suppliers }, { merge: true });
    return true;
  } catch { return false; }
}

export async function syncManufacturersToServer(manufacturers: Manufacturer[]): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { manufacturers }, { merge: true });
    return true;
  } catch { return false; }
}

export async function syncOrdersToServer(orders: Order[]): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { orders }, { merge: true });
    return true;
  } catch { return false; }
}

export async function syncCustomersToServer(customers: Customer[]): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { customers }, { merge: true });
    return true;
  } catch { return false; }
}

export async function fetchCustomersFromServer(): Promise<Customer[]> {
  const store = await fetchStoreFromServer();
  return store?.customers || [];
}

export async function saveCustomerToServer(customer: Partial<Customer>) {
  try {
    const store = await fetchStoreFromServer();
    let customers = store?.customers || [];
    
    // Check if exists
    let existingIndex = customers.findIndex(c => c.id === customer.id || (c.cpf && c.cpf === customer.cpf) || (c.email && c.email === customer.email));
    
    let updatedCustomer = { ...customer } as Customer;
    if (existingIndex >= 0) {
      updatedCustomer = { ...customers[existingIndex], ...customer, updatedAt: new Date().toISOString() } as Customer;
      customers[existingIndex] = updatedCustomer;
    } else {
      updatedCustomer.createdAt = updatedCustomer.createdAt || new Date().toISOString();
      customers.push(updatedCustomer);
    }
    
    await syncCustomersToServer(customers);
    return { success: true, customer: updatedCustomer, count: customers.length };
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
  const customers = await fetchCustomersFromServer();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return { success: false, message: 'Cliente não encontrado' };
  
  customers[idx] = {
    ...customers[idx],
    name: 'Cliente Anonimizado',
    phone: '',
    email: '',
    cpf: '',
    address: '',
    cep: '',
    updatedAt: new Date().toISOString(),
    lgpdConsent: false
  };
  
  await syncCustomersToServer(customers);
  return { success: true, customer: customers[idx] };
}

export async function deleteCustomerOnServer(id: string) {
  let customers = await fetchCustomersFromServer();
  customers = customers.filter(c => c.id !== id);
  await syncCustomersToServer(customers);
  return { success: true };
}

export async function syncCustomersFromOrdersOnServer() {
  return { success: true, message: 'Função automatizada via Frontend' };
}

export async function uploadLogoToServer(dataUrl: string): Promise<string | null> {
  // Use existing express endpoint because of file size / base64
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
  try {
    await deleteDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID));
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
  const store = await fetchStoreFromServer();
  return store?.staffUsers || [];
}

export async function saveStaffUsers(users: StaffUser[]): Promise<boolean> {
  try {
    await setDoc(doc(db, STORE_COLL, GLOBAL_DOC_ID), { staffUsers: users }, { merge: true });
    return true;
  } catch { return false; }
}
`;

fs.writeFileSync('src/services/storeApi.ts', code);
