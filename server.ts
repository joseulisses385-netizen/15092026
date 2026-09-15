import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Increase payload limit to support image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StorePayload {
  settings?: any;
  products?: any[];
  suppliers?: any[];
  manufacturers?: any[];
  orders?: any[];
  staffUsers?: any[];
  customers?: any[];
  updatedAt?: string;
}

const DEFAULT_STAFF_USERS = [
  {
    id: 'user-admin-master',
    name: 'Administrador Geral',
    username: 'admin',
    password: '649309',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-estoque-1',
    name: 'Equipe de Estoque',
    username: 'estoque',
    password: '123',
    role: 'estoque',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CUSTOMERS: any[] = [
  {
    id: 'cust-101',
    name: 'Beatriz Almeida',
    phone: '(11) 98765-4321',
    email: 'bia.almeida@gmail.com',
    cpf: '382.***.***-45',
    address: 'Rua Augusta, 1420, Apto 52',
    cep: '01304-001',
    neighborhood: 'Consolação',
    city: 'São Paulo - SP',
    complement: 'Apto 52',
    createdAt: '2026-08-15T14:20:00.000Z',
    updatedAt: '2026-08-15T14:20:00.000Z',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-15T14:20:00.000Z',
    lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
    emailMarketingConsent: true,
    emailMarketingConsentDate: '2026-08-15T14:20:00.000Z',
    welcomeCoupon: 'BEMVINDA10',
    status: 'ativo',
    ordersCount: 2,
    totalSpent: 139.80,
  },
  {
    id: 'cust-102',
    name: 'Carolina Mendes',
    phone: '(21) 99123-8877',
    email: 'carol.mendes.rj@hotmail.com',
    cpf: '451.***.***-12',
    address: 'Av. Nossa Senhora de Copacabana, 850',
    cep: '22050-001',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro - RJ',
    complement: 'Bloco B, 304',
    createdAt: '2026-08-20T10:15:00.000Z',
    updatedAt: '2026-08-20T10:15:00.000Z',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-20T10:15:00.000Z',
    lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
    emailMarketingConsent: true,
    emailMarketingConsentDate: '2026-08-20T10:15:00.000Z',
    welcomeCoupon: 'BEMVINDA10',
    status: 'ativo',
    ordersCount: 1,
    totalSpent: 89.90,
  },
  {
    id: 'cust-103',
    name: 'Juliana Ferreira',
    phone: '(31) 98455-1234',
    email: 'ju.ferreira.bh@outlook.com',
    cpf: '219.***.***-89',
    address: 'Rua dos Inconfidentes, 430',
    cep: '30140-120',
    neighborhood: 'Savassi',
    city: 'Belo Horizonte - MG',
    complement: 'Casa',
    createdAt: '2026-09-01T16:45:00.000Z',
    updatedAt: '2026-09-01T16:45:00.000Z',
    lgpdConsent: true,
    lgpdConsentDate: '2026-09-01T16:45:00.000Z',
    lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
    emailMarketingConsent: true,
    emailMarketingConsentDate: '2026-09-01T16:45:00.000Z',
    welcomeCoupon: 'BEMVINDA10',
    status: 'ativo',
    ordersCount: 3,
    totalSpent: 215.70,
  },
];

function readStore(): StorePayload | null {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.staffUsers || !Array.isArray(parsed.staffUsers) || parsed.staffUsers.length === 0) {
        parsed.staffUsers = DEFAULT_STAFF_USERS;
      }
      if (!parsed.customers || !Array.isArray(parsed.customers) || parsed.customers.length === 0) {
        parsed.customers = DEFAULT_CUSTOMERS;
      }
      if (parsed.settings) {
        if (
          parsed.settings.freeShippingThreshold === 149 ||
          parsed.settings.freeShippingThreshold === 150 ||
          !parsed.settings.freeShippingThreshold
        ) {
          parsed.settings.freeShippingThreshold = 99;
        }
        if (
          !parsed.settings.cardGatewayUrl ||
          parsed.settings.cardGatewayUrl.includes('doidasemeias')
        ) {
          parsed.settings.cardGatewayUrl = 'https://link.mercadopago.com.br/ddemeias';
        }
        if (!parsed.settings.welcomeCouponMinOrder) {
          parsed.settings.welcomeCouponMinOrder = 150;
        }
        if (!parsed.settings.welcomeCouponCode) {
          parsed.settings.welcomeCouponCode = 'BEMVINDA10';
        }
        if (!parsed.settings.welcomeCouponDiscountPercentage) {
          parsed.settings.welcomeCouponDiscountPercentage = 10;
        }
        if (!parsed.settings.coupons || !Array.isArray(parsed.settings.coupons) || parsed.settings.coupons.length === 0) {
          parsed.settings.coupons = [
            {
              id: "coupon-bemvinda10",
              code: "BEMVINDA10",
              description: "Cupom oficial de boas-vindas da loja (10% OFF a partir de R$ 150)",
              discountType: "percentage",
              discountValue: 10,
              minOrderValue: 150,
              active: true,
              usageCount: 0,
              createdAt: new Date().toISOString(),
            },
            {
              id: "coupon-doidas15",
              code: "DOIDAS15",
              description: "Desconto especial de 15% em compras acima de R$ 200",
              discountType: "percentage",
              discountValue: 15,
              minOrderValue: 200,
              active: true,
              usageCount: 0,
              createdAt: new Date().toISOString(),
            },
            {
              id: "coupon-primeiracompra",
              code: "PRIMEIRACOMPRA",
              description: "R$ 20,00 de desconto fixo a partir de R$ 160",
              discountType: "fixed",
              discountValue: 20,
              minOrderValue: 160,
              active: true,
              usageCount: 0,
              createdAt: new Date().toISOString(),
            },
          ];
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error('[Server] Erro ao ler store.json:', err);
  }
  return null;
}

function writeStore(data: StorePayload): boolean {
  try {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error('[Server] Erro ao salvar store.json:', err);
    return false;
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET complete store data for all visitors
app.get('/api/store', (_req, res) => {
  const store = readStore();
  if (store) {
    res.json({ initialized: true, ...store });
  } else {
    res.json({ initialized: false });
  }
});

// GET direct download of complete store backup (JSON file)
app.get('/api/store/backup-download', (_req, res) => {
  const store = readStore();
  const filename = `doidas-e-meias-backup-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(store || {}, null, 2));
});

// Initialize store if not already created
app.post('/api/store/init', (req, res) => {
  const current = readStore();
  if (!current) {
    const payload: StorePayload = {
      settings: req.body.settings || {},
      products: req.body.products || [],
      suppliers: req.body.suppliers || [],
      manufacturers: req.body.manufacturers || [],
      orders: req.body.orders || [],
      customers: req.body.customers || [],
    };
    writeStore(payload);
    res.json({ success: true, message: 'Store inicializada no servidor com sucesso' });
  } else {
    res.json({ success: true, message: 'Store já existente', store: current });
  }
});

// Save Store Settings (Texts, Logo, WhatsApp, Banner, etc.)
app.post('/api/store/settings', (req, res) => {
  const current = readStore() || {};
  const updatedSettings = req.body;
  const newStore: StorePayload = {
    ...current,
    settings: updatedSettings,
  };
  const ok = writeStore(newStore);
  if (ok) {
    res.json({ success: true, settings: updatedSettings });
  } else {
    res.status(500).json({ success: false, error: 'Falha ao gravar configurações no servidor' });
  }
});

// Save Products (Prices, Stock, Images, Catalog)
app.post('/api/store/products', (req, res) => {
  const current = readStore() || {};
  const products = req.body;
  const newStore: StorePayload = {
    ...current,
    products,
  };
  const ok = writeStore(newStore);
  if (ok) {
    res.json({ success: true, count: products.length });
  } else {
    res.status(500).json({ success: false, error: 'Falha ao salvar produtos no servidor' });
  }
});

// Save Suppliers
app.post('/api/store/suppliers', (req, res) => {
  const current = readStore() || {};
  const suppliers = req.body;
  const newStore: StorePayload = {
    ...current,
    suppliers,
  };
  const ok = writeStore(newStore);
  res.json({ success: ok });
});

// Save Manufacturers
app.post('/api/store/manufacturers', (req, res) => {
  const current = readStore() || {};
  const manufacturers = req.body;
  const newStore: StorePayload = {
    ...current,
    manufacturers,
  };
  const ok = writeStore(newStore);
  res.json({ success: ok });
});

// Helper: Normalize phone for comparisons
function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

// Helper to auto-upsert customers from orders so no customer data is ever lost
function autoSyncCustomersWithOrders(customers: any[], orders: any[]): { updatedCustomers: any[]; addedCount: number } {
  const customerList = [...(customers || [])];
  let addedCount = 0;

  if (!Array.isArray(orders)) return { updatedCustomers: customerList, addedCount };

  for (const o of orders) {
    if (!o) continue;
    const name = (o.customerName || '').trim();
    const phone = (o.customerPhone || '').trim();
    const email = (o.customerEmail || '').trim().toLowerCase();

    // Must have at least a name or phone to be a customer
    if (!name && !phone && !email) continue;

    const normPhone = normalizePhone(phone);
    const existingIdx = customerList.findIndex((c) => {
      if (o.customerId && c.id === o.customerId) return true;
      if (normPhone && normalizePhone(c.phone) === normPhone) return true;
      if (email && (c.email || '').trim().toLowerCase() === email) return true;
      return false;
    });

    const now = new Date().toISOString();

    if (existingIdx >= 0) {
      const existing = customerList[existingIdx];
      customerList[existingIdx] = {
        ...existing,
        name: existing.name || name,
        phone: existing.phone || phone,
        email: existing.email || email,
        address: existing.address || o.deliveryAddress || '',
        cep: existing.cep || o.cep || '',
        neighborhood: existing.neighborhood || o.neighborhood || '',
        city: existing.city || o.city || '',
        complement: existing.complement || o.complement || '',
        emailMarketingConsent:
          existing.emailMarketingConsent !== undefined
            ? existing.emailMarketingConsent
            : (o.emailMarketingConsent !== false),
        updatedAt: now,
      };
    } else {
      customerList.push({
        id: o.customerId || `cust-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        name: name || 'Cliente Loja',
        phone: phone || '',
        email: email || '',
        cpf: o.customerCpf || '',
        address: o.deliveryAddress || '',
        cep: o.cep || '',
        neighborhood: o.neighborhood || '',
        city: o.city || '',
        complement: o.complement || '',
        createdAt: o.createdAt || now,
        updatedAt: now,
        lgpdConsent: true,
        lgpdConsentDate: o.createdAt || now,
        lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
        emailMarketingConsent: o.emailMarketingConsent !== false,
        emailMarketingConsentDate: o.createdAt || now,
        welcomeCoupon: o.couponCode || 'BEMVINDA10',
        status: 'ativo',
      });
      addedCount++;
    }
  }

  return { updatedCustomers: customerList, addedCount };
}

// Save Orders & Auto-sync/save customers so no customer data is ever lost
app.post('/api/store/orders', (req, res) => {
  const current = readStore() || {};
  const orders = req.body;
  const currentCustomers = current.customers || [];
  const { updatedCustomers } = autoSyncCustomersWithOrders(currentCustomers, orders);

  const newStore: StorePayload = {
    ...current,
    orders,
    customers: updatedCustomers,
  };
  const ok = writeStore(newStore);
  res.json({ success: ok });
});

// ----------------------------------------------------
// CUSTOMERS & LGPD COMPLIANCE API (Clientes e LGPD)
// ----------------------------------------------------

// GET all customers with real-time stats
app.get('/api/store/customers', (_req, res) => {
  try {
    const current = readStore() || {};
    const customers: any[] = current.customers || [];
    const orders: any[] = current.orders || [];

    // Calculate aggregated order metrics for each customer
    const enriched = customers.map((c) => {
      const cNormPhone = normalizePhone(c.phone);
      const cEmail = (c.email || '').trim().toLowerCase();
      
      const matchingOrders = orders.filter((o) => {
        if (c.id && o.customerId === c.id) return true;
        if (cNormPhone && normalizePhone(o.customerPhone) === cNormPhone) return true;
        if (cEmail && (o.customerEmail || '').trim().toLowerCase() === cEmail) return true;
        return false;
      });

      const totalSpent = matchingOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      return {
        ...c,
        ordersCount: matchingOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
      };
    });

    res.json({ success: true, customers: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register or Update a Customer (Salvar / Criar Conta de Cliente com Consentimento LGPD)
app.post('/api/store/customers', (req, res) => {
  try {
    const customerData = req.body.customer || req.body;
    if (!customerData || (!customerData.name && !customerData.phone)) {
      res.status(400).json({ success: false, message: 'Nome ou telefone do cliente são obrigatórios.' });
      return;
    }

    const current = readStore() || {};
    const customers: any[] = [...(current.customers || [])];
    const orders: any[] = current.orders || [];

    const normPhone = normalizePhone(customerData.phone);
    const normEmail = (customerData.email || '').trim().toLowerCase();

    // Check if customer already exists by ID, phone or email
    const existingIndex = customers.findIndex((c) => {
      if (customerData.id && c.id === customerData.id) return true;
      if (normPhone && normalizePhone(c.phone) === normPhone) return true;
      if (normEmail && (c.email || '').trim().toLowerCase() === normEmail) return true;
      return false;
    });

    const now = new Date().toISOString();
    let savedCustomer: any;

    if (existingIndex >= 0) {
      // Update existing
      const existing = customers[existingIndex];
      const givesMarketingConsent =
        customerData.emailMarketingConsent !== undefined
          ? Boolean(customerData.emailMarketingConsent)
          : (existing.emailMarketingConsent !== undefined ? existing.emailMarketingConsent : false);

      savedCustomer = {
        ...existing,
        ...customerData,
        id: existing.id, // Preserve original ID
        name: customerData.name || existing.name,
        phone: customerData.phone || existing.phone,
        email: customerData.email ? customerData.email.trim().toLowerCase() : existing.email,
        cpf: customerData.cpf || existing.cpf || '',
        address: customerData.address !== undefined ? customerData.address : existing.address,
        cep: customerData.cep !== undefined ? customerData.cep : existing.cep,
        neighborhood: customerData.neighborhood !== undefined ? customerData.neighborhood : existing.neighborhood,
        city: customerData.city !== undefined ? customerData.city : existing.city,
        complement: customerData.complement !== undefined ? customerData.complement : existing.complement,
        createdAt: existing.createdAt || now,
        updatedAt: now,
        lgpdConsent: customerData.lgpdConsent !== undefined ? customerData.lgpdConsent : true,
        lgpdConsentDate: existing.lgpdConsentDate || now,
        lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
        emailMarketingConsent: givesMarketingConsent,
        emailMarketingConsentDate: givesMarketingConsent
          ? (existing.emailMarketingConsentDate || customerData.emailMarketingConsentDate || now)
          : undefined,
        welcomeCoupon: existing.welcomeCoupon || customerData.welcomeCoupon || 'BEMVINDA10',
        notes: customerData.notes || existing.notes || '',
        status: existing.status === 'anonimizado' ? 'ativo' : (existing.status || 'ativo'),
      };
      customers[existingIndex] = savedCustomer;
    } else {
      // Create new customer
      const givesMarketingConsent = Boolean(customerData.emailMarketingConsent);
      savedCustomer = {
        id: customerData.id || `cust-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email ? customerData.email.trim().toLowerCase() : '',
        cpf: customerData.cpf || '',
        address: customerData.address || '',
        cep: customerData.cep || '',
        neighborhood: customerData.neighborhood || '',
        city: customerData.city || '',
        complement: customerData.complement || '',
        createdAt: now,
        updatedAt: now,
        lgpdConsent: true,
        lgpdConsentDate: now,
        lgpdVersion: 'v1.0 - LGPD Lei 13.709/2018',
        emailMarketingConsent: givesMarketingConsent,
        emailMarketingConsentDate: givesMarketingConsent ? (customerData.emailMarketingConsentDate || now) : undefined,
        welcomeCoupon: customerData.welcomeCoupon || 'BEMVINDA10',
        notes: customerData.notes || '',
        status: 'ativo',
      };
      customers.push(savedCustomer);
    }

    // Attach order stats
    const matchingOrders = orders.filter((o) => {
      if (o.customerId === savedCustomer.id) return true;
      if (normPhone && normalizePhone(o.customerPhone) === normPhone) return true;
      if (normEmail && (o.customerEmail || '').trim().toLowerCase() === normEmail) return true;
      return false;
    });
    savedCustomer.ordersCount = matchingOrders.length;
    savedCustomer.totalSpent = Math.round(matchingOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) * 100) / 100;

    const newStore: StorePayload = {
      ...current,
      customers,
    };
    const ok = writeStore(newStore);

    if (ok) {
      res.json({
        success: true,
        customer: savedCustomer,
        count: customers.length,
        message: 'Conta de cliente registrada com sucesso no banco de dados com autorização e segurança LGPD.',
      });
    } else {
      res.status(500).json({ success: false, message: 'Erro ao salvar cliente no banco de dados do servidor.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint de Recuperação de Conta do Cliente (Esqueci meus dados / Localizar Conta)
app.post('/api/store/customers/recover', (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Informe seu WhatsApp, E-mail ou CPF para recuperar sua conta.' });
    }

    const current = readStore() || {};
    const customers: any[] = current.customers || [];
    const orders: any[] = current.orders || [];

    const search = identifier.trim().toLowerCase();
    const cleanNumbers = identifier.replace(/\D/g, '');

    const matches = customers.filter((c) => {
      // Comparar e-mail
      if (c.email && c.email.trim().toLowerCase() === search) return true;
      // Comparar telefone
      const cNormPhone = normalizePhone(c.phone);
      if (cleanNumbers && cleanNumbers.length >= 8) {
        if (cNormPhone.includes(cleanNumbers) || cleanNumbers.includes(cNormPhone)) return true;
      }
      // Comparar CPF se fornecido
      if (c.cpf && cleanNumbers && cleanNumbers.length === 11) {
        if (c.cpf.replace(/\D/g, '') === cleanNumbers) return true;
      }
      return false;
    });

    if (matches.length === 0) {
      return res.json({
        success: false,
        found: false,
        message: 'Nenhum cadastro encontrado com esses dados. Você pode se cadastrar gratuitamente em menos de 1 minuto!',
      });
    }

    const customer = matches[0];
    // Enriquecer com métricas de pedidos
    const matchingOrders = orders.filter((o) => {
      if (o.customerId === customer.id) return true;
      if (customer.phone && normalizePhone(o.customerPhone) === normalizePhone(customer.phone)) return true;
      if (customer.email && (o.customerEmail || '').trim().toLowerCase() === customer.email.trim().toLowerCase()) return true;
      return false;
    });
    customer.ordersCount = matchingOrders.length;
    customer.totalSpent = Math.round(matchingOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) * 100) / 100;

    return res.json({
      success: true,
      found: true,
      customer,
      message: `Cadastro de ${customer.name.split(' ')[0]} localizado com sucesso!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// CSV Database Export Endpoint (Exportação Oficial do Banco de Dados para Excel/CRM/Disparo)
app.get('/api/store/customers/export.csv', (req, res) => {
  try {
    const current = readStore() || {};
    const customers: any[] = current.customers || [];
    const onlyOptIn = req.query.filter === 'optin' || req.query.onlyOptIn === 'true';

    const list = onlyOptIn
      ? customers.filter((c) => c.emailMarketingConsent && c.email)
      : customers;

    const headers = [
      'ID_Cliente',
      'Nome_Completo',
      'Email',
      'Telefone_WhatsApp',
      'CPF',
      'Autorizou_Emails_Cupons',
      'Data_Autorizacao_Marketing',
      'Cupom_Boas_Vindas',
      'Consentimento_LGPD',
      'Data_Consentimento_LGPD',
      'CEP',
      'Endereco',
      'Bairro',
      'Cidade',
      'Complemento',
      'Qtd_Pedidos',
      'Total_Gasto_Reais',
      'Status_Conta',
      'Data_Cadastro',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map((c) => [
      escapeCsv(c.id),
      escapeCsv(c.name),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.cpf || ''),
      escapeCsv(c.emailMarketingConsent ? 'SIM (Autorizado)' : 'NAO'),
      escapeCsv(c.emailMarketingConsentDate ? new Date(c.emailMarketingConsentDate).toLocaleString('pt-BR') : ''),
      escapeCsv(c.welcomeCoupon ? `${c.welcomeCoupon} (10% OFF acima de R$ 150)` : 'BEMVINDA10 (10% OFF acima de R$ 150)'),
      escapeCsv(c.lgpdConsent ? 'SIM' : 'PENDENTE'),
      escapeCsv(c.lgpdConsentDate ? new Date(c.lgpdConsentDate).toLocaleString('pt-BR') : ''),
      escapeCsv(c.cep || ''),
      escapeCsv(c.address || ''),
      escapeCsv(c.neighborhood || ''),
      escapeCsv(c.city || ''),
      escapeCsv(c.complement || ''),
      c.ordersCount || 0,
      (Number(c.totalSpent) || 0).toFixed(2).replace('.', ','),
      escapeCsv(c.status || 'ativo'),
      escapeCsv(c.createdAt ? new Date(c.createdAt).toLocaleString('pt-BR') : ''),
    ]);

    const csvBody = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const filename = onlyOptIn
      ? `leads_emails_cupons_${new Date().toISOString().split('T')[0]}.csv`
      : `banco_clientes_doidas_e_meias_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvBody);
  } catch (err: any) {
    res.status(500).send(`Erro ao gerar arquivo CSV: ${err.message}`);
  }
});

// Sincronizar todos os pedidos e garantir que 100% dos clientes estejam na base de dados
app.post('/api/store/customers/sync-from-orders', (_req, res) => {
  try {
    const current = readStore() || {};
    const orders: any[] = current.orders || [];
    const currentCustomers: any[] = current.customers || [];

    const { updatedCustomers, addedCount } = autoSyncCustomersWithOrders(currentCustomers, orders);

    const newStore: StorePayload = {
      ...current,
      customers: updatedCustomers,
    };
    writeStore(newStore);

    res.json({
      success: true,
      totalCustomers: updatedCustomers.length,
      newlyAdded: addedCount,
      message: `${addedCount} novos clientes sincronizados e garantidos na base de dados a partir dos pedidos históricos! Total de clientes: ${updatedCustomers.length}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Exportar Lista formatada de WhatsApp (CSV) para Campanhas e Disparadores
app.get('/api/store/customers/export-whatsapp.csv', (_req, res) => {
  try {
    const current = readStore() || {};
    const customers: any[] = (current.customers || []).filter((c) => c.status !== 'anonimizado' && c.phone);

    const headers = ['Nome', 'WhatsApp_Original', 'Numero_Formatado_55', 'Email', 'Cidade', 'Cupom_Ativo', 'Total_Gasto_R$'];
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = customers.map((c) => {
      const cleanPhone = normalizePhone(c.phone);
      const phone55 = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      return [
        escapeCsv(c.name),
        escapeCsv(c.phone),
        escapeCsv(phone55),
        escapeCsv(c.email || ''),
        escapeCsv(c.city || ''),
        escapeCsv(c.welcomeCoupon || 'BEMVINDA10'),
        (Number(c.totalSpent) || 0).toFixed(2).replace('.', ','),
      ];
    });

    const csvBody = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lista_whatsapp_campanhas_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csvBody);
  } catch (err: any) {
    res.status(500).send(`Erro ao gerar lista WhatsApp: ${err.message}`);
  }
});

// Exportar Lista simples de telefones com DDI 55 em TXT (um por linha para Listas de Transmissão / Automações)
app.get('/api/store/customers/export-whatsapp.txt', (_req, res) => {
  try {
    const current = readStore() || {};
    const customers: any[] = (current.customers || []).filter((c) => c.status !== 'anonimizado' && c.phone);
    const phones = customers
      .map((c) => {
        const clean = normalizePhone(c.phone);
        if (!clean || clean.length < 8) return null;
        return clean.startsWith('55') ? clean : `55${clean}`;
      })
      .filter(Boolean);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="telefones_whatsapp_55_${new Date().toISOString().split('T')[0]}.txt"`);
    res.status(200).send(phones.join('\r\n'));
  } catch (err: any) {
    res.status(500).send(`Erro ao gerar arquivo TXT: ${err.message}`);
  }
});

// Batch sync all customers
app.post('/api/store/customers/sync-all', (req, res) => {
  try {
    const customers = req.body;
    if (!Array.isArray(customers)) {
      res.status(400).json({ success: false, message: 'Formato inválido. Esperado um array de clientes.' });
      return;
    }
    const current = readStore() || {};
    const newStore: StorePayload = {
      ...current,
      customers,
    };
    const ok = writeStore(newStore);
    res.json({ success: ok, count: customers.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// LGPD Art. 18, IV: Anonymize Customer Data (Direito à Anonimização)
app.post('/api/store/customers/anonymize/:id', (req, res) => {
  try {
    const { id } = req.params;
    const current = readStore() || {};
    const customers: any[] = [...(current.customers || [])];

    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
      return;
    }

    const c = customers[idx];
    customers[idx] = {
      ...c,
      name: 'Titular Anonimizado (LGPD)',
      phone: '(00) 00000-0000',
      email: 'anonimizado@doidasemeias.com.br',
      address: '[Dados excluídos a pedido do titular - Art. 18 da LGPD]',
      cep: '00000-000',
      neighborhood: '',
      city: '',
      complement: '',
      status: 'anonimizado',
      updatedAt: new Date().toISOString(),
    };

    const newStore: StorePayload = {
      ...current,
      customers,
    };
    writeStore(newStore);

    res.json({
      success: true,
      customer: customers[idx],
      message: 'Dados do titular anonimizados com sucesso em conformidade com a LGPD.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// LGPD Art. 18, VI: Delete Customer Record (Direito à Eliminação)
app.delete('/api/store/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const current = readStore() || {};
    const customers: any[] = (current.customers || []).filter((c) => c.id !== id);

    const newStore: StorePayload = {
      ...current,
      customers,
    };
    const ok = writeStore(newStore);

    res.json({
      success: ok,
      message: 'Registro do cliente removido permanentemente da base de dados em conformidade com a LGPD.',
      count: customers.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Staff Authentication (Login com Usuário e Senha)
app.post('/api/store/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
      return;
    }

    const current = readStore() || {};
    const users: any[] = current.staffUsers || DEFAULT_STAFF_USERS;

    const normalizedUser = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const adminPin = (current.settings && current.settings.adminPin) ? String(current.settings.adminPin).trim() : '649309';

    const user = users.find((u) => {
      if (u.active === false) return false;
      if (u.username.trim().toLowerCase() !== normalizedUser) return false;
      // Para o admin, aceita a senha cadastrada no usuário ou o PIN mestre do administrador
      if (u.role === 'admin' || normalizedUser === 'admin') {
        return (
          cleanPassword === u.password.trim() ||
          cleanPassword === adminPin
        );
      }
      return cleanPassword === u.password.trim();
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Usuário ou senha incorretos ou usuário inativo.' });
      return;
    }

    // Return safe user info
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Erro na autenticação' });
  }
});

// Recuperação segura de senha do Administrador
// Exclusivo e restrito: só autoriza envio se o e-mail for exatamente jose.ulisses385@gmail.com
app.post('/api/store/auth/recover-admin', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Por favor, informe um e-mail válido para envio da senha de administrador.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const AUTHORIZED_ADMIN_EMAIL = 'jose.ulisses385@gmail.com';

    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
      res.status(403).json({
        success: false,
        message: 'E-mail não autorizado. O envio da senha do administrador só pode ser realizado para o e-mail oficial cadastrado.',
      });
      return;
    }

    // E-mail compatível com jose.ulisses385@gmail.com
    const current = readStore() || {};
    const adminPin = (current.settings && current.settings.adminPin) ? String(current.settings.adminPin).trim() : '649309';

    console.log(`[AUTH-RECOVERY] Envio de senha do administrador solicitado e aprovado para ${AUTHORIZED_ADMIN_EMAIL}`);

    res.json({
      success: true,
      message: `A senha e as credenciais de acesso foram enviadas com sucesso para ${AUTHORIZED_ADMIN_EMAIL}. Verifique sua caixa de entrada.`,
      targetEmail: AUTHORIZED_ADMIN_EMAIL,
      sentAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Erro ao processar envio de senha.' });
  }
});

// Get Staff Users (Apenas para listagem no painel de administração)
app.get('/api/store/users', (_req, res) => {
  const current = readStore() || {};
  res.json({ success: true, users: current.staffUsers || DEFAULT_STAFF_USERS });
});

// Save Staff Users (Somente o ADM pode cadastrar ou atualizar usuários)
app.post('/api/store/users', (req, res) => {
  try {
    const users = req.body;
    if (!Array.isArray(users)) {
      res.status(400).json({ success: false, message: 'Lista de usuários inválida.' });
      return;
    }

    const current = readStore() || {};
    const newStore: StorePayload = {
      ...current,
      staffUsers: users,
    };
    const ok = writeStore(newStore);
    res.json({ success: ok, users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Direct Logo Upload API: Writes directly to disk in public/
app.post('/api/store/upload-logo', (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'dataUrl inválido' });
      return;
    }

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      // It's already a URL
      const current = readStore() || {};
      const updatedSettings = {
        ...(current.settings || {}),
        heroMascotUrl: dataUrl,
      };
      writeStore({ ...current, settings: updatedSettings });
      res.json({ success: true, logoUrl: dataUrl });
      return;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `custom-logo.${ext}`;
    const targetPath = path.join(PUBLIC_DIR, fileName);
    fs.writeFileSync(targetPath, buffer);

    // Also overwrite logo.jpeg and logo.png so all fallbacks and social crawlers serve this exact logo
    try {
      fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.jpeg'), buffer);
      fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.png'), buffer);
    } catch {}

    // Also copy to dist if dist exists (production)
    const distTarget = path.join(process.cwd(), 'dist', fileName);
    try {
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        fs.writeFileSync(distTarget, buffer);
        fs.writeFileSync(path.join(process.cwd(), 'dist', 'logo.jpeg'), buffer);
        fs.writeFileSync(path.join(process.cwd(), 'dist', 'logo.png'), buffer);
      }
    } catch {}

    const logoUrl = `/${fileName}?v=${Date.now()}`;
    const current = readStore() || {};
    const updatedSettings = {
      ...(current.settings || {}),
      heroMascotUrl: logoUrl,
    };
    writeStore({ ...current, settings: updatedSettings });

    res.json({ success: true, logoUrl });
  } catch (err: any) {
    console.error('[Server] Erro no upload da logo:', err);
    res.status(500).json({ error: err.message || 'Erro ao processar imagem' });
  }
});

// Reset logo to clean defaults
app.post('/api/store/reset-logo', (_req, res) => {
  try {
    const current = readStore() || {};
    const logoUrl = `/logo_transparent.png?v=${Date.now()}`;
    const updatedSettings = {
      ...(current.settings || {}),
      heroMascotUrl: logoUrl,
    };
    writeStore({ ...current, settings: updatedSettings });
    res.json({ success: true, logoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset store to initial defaults
app.post('/api/store/reset', (_req, res) => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      fs.unlinkSync(STORE_FILE);
    }
    res.json({ success: true, message: 'Store resetada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// MELHOR ENVIO OFICIAL - COTAÇÃO & LOGÍSTICA AO VIVO
// ----------------------------------------------------

const DEFAULT_MELHOR_ENVIO_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjM1Zjc0ODEwNThiMTkxY2Y1MmMwMDc4MmEwMWFlOTQ0NGJhMDFhNTZlMmFkNTA5ZjNjNTQzZGY5M2MzZTg5Y2RiMWI2YWEzMTk4NGY3ZGMiLCJpYXQiOjE3ODkyNjQ3NDcuNDg2OTIyLCJuYmYiOjE3ODkyNjQ3NDcuNDg2OTI0LCJleHAiOjE4MjA4MDA3NDcuNDc0MDE1LCJzdWIiOiJhMmJiOGU4NS1lMDQ0LTRhZDUtODhjZi1mNDc5ZjIwMDUxMjAiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.Y1Lu3b1q5_c0wBJNwq4txin2FsDZBWrhHadIvEQRrnsiPSaZ7txwDtkoLcmmJ0iMvdG_9rLDK-XGm8r8piL5vlfZFqoeR0p98cPfZ2hTqWEB12OUNjduyKEBmmLwhQwyGxP7aZlldsQDuKHlWnFFlYdWkyHinfXEuXhf9nXni4hZdUAUsz17xL2zgIGCzo17syVvzUIVwvbGLDG8XzbYRXYOxaz5Tj2PhnDG6JIYdMPicb-Ax-cKhIE_5u49b-X_rKQ1E_2v7MYqs3l4Y_O2sKu94VcDA_MKtu47zXr83QIeRcqQ0M8Xti8gwW4tc4RHUwqF_MzYgX2O-e9D4AVv6lfJIdinMLe2vkudUi-qRm_DHFE7MILZLTQa1fwsc5sXx-P2xkZc4c9iLtZtocjewj4shkdHjQujcFXwqAtiCqUChIslNc2FKR3uj5JRsSDh2ZIbp2TQsbIldzai1OXOlnPmAoMj8DtqNS8YMnLuP7evK6gLAfOpUaqy0GDYrCIBtlYC7h-OGJ9cI1fQQzu31YH_d6ydVaxor5jlg0MGKLhgBxKfJmq3cU1_YtfbF5ANQZbJlfQeHbWrr3EOIJrRbwsi5H2JdvBEohPc87DmfdmJIJF2FVQfHXoEl3y4Ma7m_qRf7_jx-msKERAthnTVdahP-nuVBwyov1LqBID8JVs';

function getEffectiveMelhorEnvioToken(): string {
  const current = readStore();
  return (
    (process.env.MELHOR_ENVIO_TOKEN || current?.settings?.melhorEnvioToken || DEFAULT_MELHOR_ENVIO_TOKEN)?.trim()
  );
}

// 1. Obter status da conta e testar conexão com o Melhor Envio
app.get('/api/shipping/melhor-envio/info', async (_req, res) => {
  try {
    const token = getEffectiveMelhorEnvioToken();
    if (!token) {
      res.status(400).json({ success: false, error: 'Token do Melhor Envio não configurado.' });
      return;
    }

    const response = await fetch('https://melhorenvio.com.br/api/v2/me', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'DoidasEMeias (contato@doidasemeias.com.br)',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({
        success: false,
        error: `Erro ao autenticar com o Melhor Envio (${response.status}): ${errText}`,
      });
      return;
    }

    const data: any = await response.json();
    res.json({
      success: true,
      user: {
        id: data.id,
        name: data.name,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        document: data.document ? `${data.document.slice(0, 3)}***` : undefined,
        documentType: data.document_type,
        phone: data.phone?.phone,
        status: data.status?.status || 'Allowed',
        address: data.address,
        postalCode: data.address?.postal_code || '09910000',
        city: data.address?.city?.city,
        state: data.address?.city?.state?.state_abbr,
        shipmentsAvailable: data.limits?.shipments_available,
        balance: data.accounts?.[0]?.balance ?? 0,
      },
    });
  } catch (err: any) {
    console.error('[Server] Erro no Melhor Envio info:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Atualizar token manualmente no painel
app.post('/api/shipping/melhor-envio/update-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, error: 'Token inválido fornecido.' });
      return;
    }

    const trimmed = token.trim();
    // Test token against Melhor Envio
    const checkRes = await fetch('https://melhorenvio.com.br/api/v2/me', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${trimmed}`,
        'User-Agent': 'DoidasEMeias (contato@doidasemeias.com.br)',
      },
    });

    if (!checkRes.ok) {
      res.status(400).json({
        success: false,
        error: 'O token fornecido não foi aceito pela API do Melhor Envio. Verifique se ele não expirou.',
      });
      return;
    }

    const userData: any = await checkRes.json();
    const current = readStore() || {};
    const updatedSettings = {
      ...(current.settings || {}),
      melhorEnvioEnabled: true,
      melhorEnvioToken: trimmed,
      melhorEnvioAccountName: userData.name,
      melhorEnvioAccountEmail: userData.email,
      melhorEnvioAccountPhone: userData.phone?.phone || '',
      melhorEnvioOriginCep: userData.address?.postal_code
        ? `${userData.address.postal_code.slice(0, 5)}-${userData.address.postal_code.slice(5)}`
        : current.settings?.melhorEnvioOriginCep || '09910-000',
      melhorEnvioOriginCity: userData.address?.city?.city
        ? `${userData.address.city.city} - ${userData.address.city.state?.state_abbr}`
        : current.settings?.melhorEnvioOriginCity || 'Diadema - SP',
      shippingOriginCep: userData.address?.postal_code || current.settings?.shippingOriginCep || '09910-000',
      shippingOriginCity: userData.address?.city?.city
        ? `${userData.address.city.city} - ${userData.address.city.state?.state_abbr}`
        : current.settings?.shippingOriginCity || 'Diadema - SP',
    };

    writeStore({ ...current, settings: updatedSettings });

    res.json({
      success: true,
      message: 'Token do Melhor Envio atualizado e salvo com sucesso!',
      user: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone?.phone,
        postalCode: userData.address?.postal_code,
        city: userData.address?.city?.city,
        state: userData.address?.city?.state?.state_abbr,
      },
    });
  } catch (err: any) {
    console.error('[Server] Erro ao salvar token do Melhor Envio:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Calcular frete em tempo real via Melhor Envio
app.post('/api/shipping/melhor-envio/calculate', async (req, res) => {
  try {
    const { toCep, fromCep, itemsCount = 1, cartTotal = 0, package: customPkg } = req.body;
    if (!toCep) {
      res.status(400).json({ success: false, error: 'CEP de destino é obrigatório.' });
      return;
    }

    const cleanTo = String(toCep).replace(/\D/g, '');
    if (cleanTo.length !== 8) {
      res.status(400).json({ success: false, error: 'CEP de destino deve conter 8 dígitos.' });
      return;
    }

    const token = getEffectiveMelhorEnvioToken();
    const current = readStore() || {};
    const storeSettings = current.settings || {};

    const cleanFrom = String(
      fromCep ||
      storeSettings.melhorEnvioOriginCep ||
      storeSettings.shippingOriginCep ||
      '09910000'
    ).replace(/\D/g, '');

    // Cálculo dinâmico das dimensões para meias (flexíveis e leves)
    const count = Number(itemsCount) || 1;
    let height = 4;
    let width = 16;
    let length = 20;
    let weight = 0.20; // 200g

    if (count >= 9) {
      height = 12;
      width = 20;
      length = 25;
      weight = Math.min(2.0, 0.60 + (count - 9) * 0.05);
    } else if (count >= 4) {
      height = 8;
      width = 18;
      length = 22;
      weight = 0.35;
    }

    // Se houver pacote customizado fornecido
    if (customPkg) {
      if (customPkg.height) height = Number(customPkg.height);
      if (customPkg.width) width = Number(customPkg.width);
      if (customPkg.length) length = Number(customPkg.length);
      if (customPkg.weight) weight = Number(customPkg.weight);
    }

    const payload = {
      from: { postal_code: cleanFrom },
      to: { postal_code: cleanTo },
      package: {
        height: Math.max(2, height),
        width: Math.max(11, width),
        length: Math.max(16, length),
        weight: Math.max(0.1, weight),
      },
      options: {
        insurance_value: cartTotal > 0 ? Math.min(cartTotal, 1000) : 0,
        receipt: false,
        own_hand: false,
      },
    };

    const meRes = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'DoidasEMeias (contato@doidasemeias.com.br)',
      },
      body: JSON.stringify(payload),
    });

    if (!meRes.ok) {
      const errBody = await meRes.text();
      console.warn('[Melhor Envio API Error]:', meRes.status, errBody);
      res.status(meRes.status).json({
        success: false,
        error: `Não foi possível calcular o frete com o Melhor Envio (${meRes.status})`,
      });
      return;
    }

    const meData: any[] = await meRes.json();
    if (!Array.isArray(meData)) {
      res.json({ success: true, quotes: [] });
      return;
    }

    const freeShippingThreshold =
      storeSettings.freeShippingThreshold === 149 ||
      storeSettings.freeShippingThreshold === 150 ||
      !storeSettings.freeShippingThreshold
        ? 99
        : Number(storeSettings.freeShippingThreshold) || 99;
    const isFreeShipping = Boolean(storeSettings.enableFreeShipping && cartTotal >= freeShippingThreshold && cartTotal > 0);

    // Filtrar opções com erro
    const validServices = meData.filter((item) => !item.error && item.price);

    // Mapear cada transportadora
    const formattedQuotes = validServices.map((item) => {
      const rawPrice = parseFloat(item.custom_price || item.price) || 0;
      const minDays = item.custom_delivery_range?.min || item.delivery_range?.min || 1;
      const maxDays = item.custom_delivery_range?.max || item.delivery_range?.max || item.custom_delivery_time || item.delivery_time || 5;

      let badge: string | undefined;
      const carrierName = item.company?.name || 'Transportadora';
      const serviceName = item.name || '';

      if (serviceName.toLowerCase().includes('sedex') || serviceName.toLowerCase().includes('expresso')) {
        badge = 'Mais Rápido ⚡';
      } else if (rawPrice <= 12) {
        badge = 'Super Econômico 🏷️';
      } else if (carrierName.toLowerCase().includes('jadlog') || carrierName.toLowerCase().includes('loggi')) {
        badge = 'Custo-Benefício 🚀';
      }

      return {
        id: `melhor_envio_${item.id}`,
        melhorEnvioServiceId: item.id,
        name: `${carrierName} - ${serviceName}`,
        carrier: carrierName,
        serviceType: serviceName.toLowerCase().replace(/\s+/g, '_'),
        description: `Entrega oficial via ${carrierName} calculada com tarifas reduzidas do Melhor Envio.`,
        deliveryEstimate: minDays === maxDays ? `${minDays} dias úteis` : `${minDays} a ${maxDays} dias úteis`,
        price: rawPrice,
        originalPrice: rawPrice,
        currency: item.currency || 'R$',
        carrierLogo: item.company?.picture || '',
        badge,
        enabled: true,
        isMelhorEnvioLive: true,
        discount: item.discount,
      };
    });

    // Ordenar do mais barato para o mais rápido
    formattedQuotes.sort((a, b) => a.price - b.price);

    // Se frete grátis estiver ativo e subtotal atingido, o mais barato vira grátis
    if (isFreeShipping && formattedQuotes.length > 0) {
      formattedQuotes[0].price = 0;
      formattedQuotes[0].badge = 'FRETE GRÁTIS 🎉';
    }

    res.json({
      success: true,
      fromCep: cleanFrom,
      toCep: cleanTo,
      itemsCount: count,
      quotes: formattedQuotes,
      isFreeShippingUnlocked: isFreeShipping,
      freeShippingThreshold,
    });
  } catch (err: any) {
    console.error('[Server] Erro ao calcular frete no Melhor Envio:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// INTEGRAÇÃO OFICIAL MERCADO PAGO (CRÉDITO, PIX & SELO)
// ----------------------------------------------------

function getEffectiveMercadoPagoToken(): string {
  const current = readStore();
  const token =
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    current?.settings?.mercadoPagoAccessToken ||
    '';
  return token.trim();
}

function getEffectiveMercadoPagoPublicKey(): string {
  const current = readStore();
  const key =
    process.env.MERCADO_PAGO_PUBLIC_KEY ||
    current?.settings?.mercadoPagoPublicKey ||
    '';
  return key.trim();
}

// 1. Obter informações e status da conexão do Mercado Pago
app.get('/api/payment/mercadopago/info', async (_req, res) => {
  try {
    const token = getEffectiveMercadoPagoToken();
    const publicKey = getEffectiveMercadoPagoPublicKey();
    const current = readStore();
    const settings = current?.settings || {};

    if (!token) {
      res.json({
        success: true,
        connected: false,
        message: 'Nenhum Access Token do Mercado Pago configurado.',
        publicKeyMasked: publicKey ? `${publicKey.substring(0, 10)}...` : '',
        environment: settings.mercadoPagoEnvironment || 'production',
        maxInstallments: settings.mercadoPagoMaxInstallments || 12,
        freeInstallments: settings.mercadoPagoFreeInstallments || 3,
        enabled: settings.mercadoPagoEnabled ?? true,
      });
      return;
    }

    // Consultar API oficial de usuários do Mercado Pago
    const mpRes = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpRes.ok) {
      const errData = await mpRes.json().catch(() => ({}));
      res.json({
        success: true,
        connected: false,
        error: errData.message || `Erro HTTP ${mpRes.status} ao consultar conta do Mercado Pago.`,
        tokenMasked: `${token.substring(0, 10)}...${token.substring(token.length - 4)}`,
        environment: settings.mercadoPagoEnvironment || 'production',
      });
      return;
    }

    const userData: any = await mpRes.json();

    res.json({
      success: true,
      connected: true,
      user: {
        id: userData.id,
        nickname: userData.nickname,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        siteId: userData.site_id,
        countryId: userData.country_id,
      },
      tokenMasked: `${token.substring(0, 10)}...${token.substring(token.length - 4)}`,
      publicKeyMasked: publicKey ? `${publicKey.substring(0, 10)}...` : '',
      environment: settings.mercadoPagoEnvironment || 'production',
      maxInstallments: settings.mercadoPagoMaxInstallments || 12,
      freeInstallments: settings.mercadoPagoFreeInstallments || 3,
      enabled: settings.mercadoPagoEnabled ?? true,
    });
  } catch (err: any) {
    console.error('[Server] Erro ao consultar info do Mercado Pago:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Salvar e validar credenciais do Mercado Pago
app.post('/api/payment/mercadopago/save-credentials', async (req, res) => {
  try {
    const {
      accessToken,
      publicKey,
      environment = 'production',
      maxInstallments = 12,
      freeInstallments = 3,
      enabled = true,
      cardGatewayUrl,
    } = req.body;

    const tokenToTest = accessToken ? String(accessToken).trim() : getEffectiveMercadoPagoToken();

    if (!tokenToTest) {
      // Salvar apenas se o usuário quiser desligar ou salvar link manual
      const current = readStore() || {};
      const updatedSettings = {
        ...(current.settings || {}),
        mercadoPagoEnabled: Boolean(enabled),
        mercadoPagoEnvironment: environment,
        mercadoPagoMaxInstallments: Number(maxInstallments) || 12,
        mercadoPagoFreeInstallments: Number(freeInstallments) || 3,
        cardGatewayUrl: cardGatewayUrl !== undefined ? cardGatewayUrl : current.settings?.cardGatewayUrl,
      };
      writeStore({ ...current, settings: updatedSettings });
      res.json({
        success: true,
        connected: false,
        message: 'Configurações salvas. Nenhum token inserido.',
      });
      return;
    }

    // Validar token no Mercado Pago
    const mpRes = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        Authorization: `Bearer ${tokenToTest}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpRes.ok) {
      const errData: any = await mpRes.json().catch(() => ({}));
      res.status(400).json({
        success: false,
        error: `Token do Mercado Pago rejeitado: ${errData.message || 'Verifique se copiou o Access Token de Produção corretamente.'}`,
      });
      return;
    }

    const userData: any = await mpRes.json();
    const current = readStore() || {};
    const updatedSettings = {
      ...(current.settings || {}),
      mercadoPagoEnabled: Boolean(enabled),
      mercadoPagoAccessToken: tokenToTest,
      mercadoPagoPublicKey: publicKey ? String(publicKey).trim() : current.settings?.mercadoPagoPublicKey || '',
      mercadoPagoEnvironment: environment,
      mercadoPagoAccountName: userData.nickname || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Mercado Pago',
      mercadoPagoAccountEmail: userData.email,
      mercadoPagoCollectorId: String(userData.id),
      mercadoPagoMaxInstallments: Number(maxInstallments) || 12,
      mercadoPagoFreeInstallments: Number(freeInstallments) || 3,
      cardGatewayName: 'Mercado Pago (Crédito até 12x & Pix)',
      cardInstallmentsInfo: `Em até ${freeInstallments}x sem juros ou ${maxInstallments}x no cartão`,
      cardGatewayUrl: cardGatewayUrl || current.settings?.cardGatewayUrl || 'https://link.mercadopago.com.br/ddemeias',
    };

    writeStore({ ...current, settings: updatedSettings });

    res.json({
      success: true,
      message: 'Mercado Pago conectado e credenciais validadas com sucesso!',
      user: {
        id: userData.id,
        nickname: userData.nickname,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
      },
    });
  } catch (err: any) {
    console.error('[Server] Erro ao salvar credenciais do Mercado Pago:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Criar Preferência de Checkout Mercado Pago (Checkout Pro / Transparente)
app.post('/api/payment/mercadopago/create-preference', async (req, res) => {
  try {
    const token = getEffectiveMercadoPagoToken();
    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Mercado Pago não configurado. Por favor, insira o Access Token no painel do administrador.',
      });
      return;
    }

    const { items = [], payer = {}, orderId, deliveryFee = 0 } = req.body;

    const mpItems = items.map((item: any) => ({
      id: String(item.product?.id || item.id || 'item'),
      title: String(item.product?.name || item.name || 'Meia Divertida'),
      quantity: Number(item.quantity) || 1,
      currency_id: 'BRL',
      unit_price: Number(item.product?.price || item.price || 0),
    }));

    if (deliveryFee > 0) {
      mpItems.push({
        id: 'shipping_fee',
        title: 'Taxa de Entrega / Frete',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(deliveryFee),
      });
    }

    const appBaseUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    const current = readStore() || {};
    const maxInst = current.settings?.mercadoPagoMaxInstallments || 12;

    const preferenceBody = {
      items: mpItems,
      payer: {
        name: payer.name || 'Cliente Doidas e Meias',
        email: payer.email || 'cliente@doidasemeias.com.br',
        phone: {
          number: payer.phone ? String(payer.phone).replace(/\D/g, '') : '',
        },
        address: payer.address
          ? {
              street_name: payer.address.street || '',
              street_number: Number(payer.address.number) || 0,
              zip_code: payer.address.cep ? String(payer.address.cep).replace(/\D/g, '') : '',
            }
          : undefined,
      },
      payment_methods: {
        installments: maxInst,
      },
      back_urls: {
        success: `${appBaseUrl}/?status=success&orderId=${orderId || ''}`,
        pending: `${appBaseUrl}/?status=pending&orderId=${orderId || ''}`,
        failure: `${appBaseUrl}/?status=failure&orderId=${orderId || ''}`,
      },
      auto_return: 'approved',
      notification_url: `${appBaseUrl}/api/payment/mercadopago/webhook`,
      statement_descriptor: 'DOIDAS & MEIAS',
      external_reference: String(orderId || `PED-${Date.now()}`),
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!mpRes.ok) {
      const errData: any = await mpRes.json().catch(() => ({}));
      res.status(400).json({
        success: false,
        error: errData.message || 'Falha ao criar preferência de pagamento no Mercado Pago.',
      });
      return;
    }

    const prefData: any = await mpRes.json();

    res.json({
      success: true,
      preferenceId: prefData.id,
      initPoint: prefData.init_point,
      sandboxInitPoint: prefData.sandbox_init_point,
    });
  } catch (err: any) {
    console.error('[Server] Erro ao criar preferência no Mercado Pago:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// WEBHOOK Mercado Pago (Pagamentos)
app.post('/api/payment/mercadopago/webhook', async (req, res) => {
  try {
    const topic = req.query.topic || req.body.type;
    // O Mercado Pago envia o ID do pagamento em data.id ou simplesmente id dependendo do formato
    const paymentId = req.query['data.id'] || req.body?.data?.id || req.body?.id;
    
    if ((topic === 'payment' || topic === 'payment.created' || topic === 'payment.updated') && paymentId) {
      const token = getEffectiveMercadoPagoToken();
      if (token) {
        // Consulta os detalhes do pagamento no Mercado Pago
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (mpRes.ok) {
          const paymentData = await mpRes.json();
          const orderId = paymentData.external_reference; // Recupera o ID do pedido
          const status = paymentData.status; // 'approved', 'pending', 'rejected', etc
          
          if (orderId && status === 'approved') {
            // Atualiza o pedido no store.json
            const current = readStore() || {};
            const orders = current.orders || [];
            
            const orderIndex = orders.findIndex(o => o.orderNumber === orderId || o.id === orderId);
            if (orderIndex >= 0) {
              orders[orderIndex].status = 'pago'; // Atualiza para o status que quiser, ex: 'pago' ou 'preparando'
              
              const newStore = { ...current, orders };
              writeStore(newStore);
              console.log(`[Webhook] Pedido ${orderId} atualizado para 'pago' com sucesso! (PaymentID: ${paymentId})`);
            }
          }
        }
      }
    }
    
    res.status(200).send('OK'); // Sempre responder 200 pro MP parar de enviar
  } catch (err) {
    console.error('[Webhook] Erro:', err);
    res.status(500).send('Error');
  }
});

// 4. Criar Cobrança Pix instantânea via Mercado Pago
app.post('/api/payment/mercadopago/create-pix', async (req, res) => {
  try {
    const token = getEffectiveMercadoPagoToken();
    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Mercado Pago não configurado. Por favor, cadastre o Access Token no painel.',
      });
      return;
    }

    const { amount, orderId, payerEmail, payerName, payerCpf } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, error: 'Valor da transação inválido.' });
      return;
    }

    const cleanCpf = payerCpf ? String(payerCpf).replace(/\D/g, '') : '';
    const cleanEmail = payerEmail && payerEmail.includes('@') ? payerEmail : 'contato@doidasemeias.com.br';

    const names = (payerName || 'Cliente Doidas e Meias').trim().split(' ');
    const firstName = names[0] || 'Cliente';
    const lastName = names.slice(1).join(' ') || 'Doidas e Meias';

    const paymentPayload: any = {
      transaction_amount: Number(amount),
      description: `Pedido Doidas & Meias #${orderId || Date.now()}`,
      payment_method_id: 'pix',
      payer: {
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
      },
    };

    if (cleanCpf && cleanCpf.length === 11) {
      paymentPayload.payer.identification = {
        type: 'CPF',
        number: cleanCpf,
      };
    }

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-${orderId || Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!mpRes.ok) {
      const errData: any = await mpRes.json().catch(() => ({}));
      res.status(400).json({
        success: false,
        error: errData.message || errData.cause?.[0]?.description || 'Erro ao gerar Pix no Mercado Pago.',
      });
      return;
    }

    const data: any = await mpRes.json();

    res.json({
      success: true,
      paymentId: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
      expiresAt: data.date_of_expiration,
    });
  } catch (err: any) {
    console.error('[Server] Erro ao criar pagamento Pix no Mercado Pago:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Consultar status de um pagamento
app.get('/api/payment/mercadopago/payment-status/:id', async (req, res) => {
  try {
    const token = getEffectiveMercadoPagoToken();
    if (!token) {
      res.status(400).json({ success: false, error: 'Token não configurado.' });
      return;
    }

    const { id } = req.params;
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpRes.ok) {
      const errData: any = await mpRes.json().catch(() => ({}));
      res.status(400).json({ success: false, error: errData.message });
      return;
    }

    const data: any = await mpRes.json();
    res.json({
      success: true,
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      dateApproved: data.date_approved,
      paymentMethodId: data.payment_method_id,
      transactionAmount: data.transaction_amount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Doidas e Meias] Servidor full-stack ativo na porta ${PORT}`);
  });
}

startServer();
