/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  StoreSettings,
  CartItem,
  Customer,
  Order,
  Supplier,
  Manufacturer,
  OrderStatus,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_SUPPLIERS,
  INITIAL_MANUFACTURERS,
} from './data/initialData';
import { OFFICIAL_BRAND_LOGO } from './constants/assets';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductBuilderModal } from './components/ProductBuilderModal';
import { TikTokHubSection } from './components/TikTokHubSection';
import { MarketplaceReviews } from './components/MarketplaceReviews';
import { FeaturesSection } from './components/FeaturesSection';
import { SecurityGuaranteesSection } from './components/SecurityGuaranteesSection';
import { SecurityGuaranteesModal } from './components/SecurityGuaranteesModal';
import { StockBanner } from './components/StockBanner';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CartDrawer } from './components/CartDrawer';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { DirectorAuthModal } from './components/DirectorAuthModal';
import { DirectorPanel } from './components/DirectorPanel';
import { QuickStockModal } from './components/QuickStockModal';
import { StockPage } from './pages/StockPage';
import { AdminPage } from './pages/AdminPage';
import { StaffLoginPage } from './components/StaffLoginPage';
import { StaffUser } from './types';
import {
  fetchStoreFromServer,
  initServerStore,
  syncSettingsToServer,
  syncProductsToServer,
  syncSuppliersToServer,
  syncManufacturersToServer,
  syncOrdersToServer,
  resetServerStore,
  fetchCustomersFromServer,
  saveCustomerToServer,
  anonymizeCustomerOnServer,
  deleteCustomerOnServer,
} from './services/storeApi';

const STORAGE_KEYS = {
  PRODUCTS: 'doidas_meias_products_v5',
  SETTINGS: 'doidas_meias_settings_v5',
  CART: 'doidas_meias_cart_v3',
  CUSTOMER: 'doidas_current_customer_v1',
  CUSTOMERS: 'doidas_store_customers_v1',
  ORDERS: 'doidas_store_orders_v2',
  DIRECTOR_SESSION: 'doidas_director_active_session',
  STAFF_UNLOCKED: 'doidas_staff_unlocked',
  SUPPLIERS: 'doidas_suppliers_db_v1',
  MANUFACTURERS: 'doidas_manufacturers_db_v1',
  STAFF_USER_SESSION: 'doidas_staff_user_session',
};

export type AppRoute = 'store' | 'stock' | 'admin' | 'staff-login';

function getInitialRoute(): { route: AppRoute; targetArea: 'admin' | 'estoque' } {
  try {
    const path = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const pageParam = search.get('page')?.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/estoque') || pageParam === 'estoque' || hash === '#estoque') {
      return { route: 'stock', targetArea: 'estoque' };
    }
    if (path.includes('/admin') || pageParam === 'admin' || hash === '#admin') {
      return { route: 'admin', targetArea: 'admin' };
    }
    if (path.includes('/login') || pageParam === 'login' || hash === '#login') {
      const area = search.get('area') === 'estoque' ? 'estoque' : 'admin';
      return { route: 'staff-login', targetArea: area };
    }
  } catch {}
  return { route: 'store', targetArea: 'admin' };
}

export default function App() {
  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : INITIAL_PRODUCTS;
      }
    } catch (e) {
      console.warn('Erro ao ler produtos locais:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Settings state
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const customLogo = localStorage.getItem('doidas_custom_logo');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          adminPin: parsed.adminPin === '1234' || !parsed.adminPin ? '649309' : parsed.adminPin,
          welcomeCouponCode: parsed.welcomeCouponCode || 'BEMVINDA10',
          welcomeCouponDiscountPercentage: parsed.welcomeCouponDiscountPercentage ?? 10,
          welcomeCouponMinOrder: parsed.welcomeCouponMinOrder ?? 150,
          freeShippingThreshold:
            parsed.freeShippingThreshold === 149 || parsed.freeShippingThreshold === 150 || !parsed.freeShippingThreshold
              ? 99
              : parsed.freeShippingThreshold,
          cardGatewayUrl:
            !parsed.cardGatewayUrl || parsed.cardGatewayUrl.includes('doidasemeias')
              ? 'https://link.mercadopago.com.br/ddemeias'
              : parsed.cardGatewayUrl,
          heroMascotUrl: customLogo || parsed.heroMascotUrl || OFFICIAL_BRAND_LOGO,
          shippingMethods:
            parsed.shippingMethods && Array.isArray(parsed.shippingMethods) && parsed.shippingMethods.length > 0
              ? parsed.shippingMethods.map((m: any) =>
                  m?.freeAbove === 149 || m?.freeAbove === 150 ? { ...m, freeAbove: 99 } : m
                )
              : INITIAL_SETTINGS.shippingMethods,
        };
      } else if (customLogo) {
        return {
          ...INITIAL_SETTINGS,
          heroMascotUrl: customLogo,
        };
      }
    } catch (e) {
      console.warn('Erro ao ler configurações locais:', e);
    }
    return INITIAL_SETTINGS;
  });

  // Suppliers state (Admin only DB)
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : INITIAL_SUPPLIERS;
      }
    } catch (e) {
      console.warn('Erro ao ler fornecedores:', e);
    }
    return INITIAL_SUPPLIERS;
  });

  // Manufacturers state (Admin only DB)
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANUFACTURERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : INITIAL_MANUFACTURERS;
      }
    } catch (e) {
      console.warn('Erro ao ler fabricantes:', e);
    }
    return INITIAL_MANUFACTURERS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
    } catch (e) {
      console.warn('Erro ao ler carrinho local:', e);
    }
    return [];
  });

  // Customer state (current active customer session)
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed === 'object' && parsed !== null ? parsed : null;
      }
    } catch {
      return null;
    }
    return null;
  });

  // Registered Customers List (Database from Server - LGPD Compliant)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
    } catch {
      return [];
    }
    return [];
  });

  // Orders state (Unified TikTok + Site + WhatsApp)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
    } catch {
      return [];
    }
    // Default initial mock orders showcasing TikTok and Site integration
    return [
      {
        id: 'ord-tt-1',
        orderNumber: 'TT-748921',
        origin: 'tiktok',
        customerName: 'Beatriz Almeida',
        customerPhone: '(11) 98765-4321',
        customerEmail: 'bia.almeida@gmail.com',
        deliveryAddress: 'Rua Augusta, 1420 - Consolação, São Paulo - SP - CEP 01304-001',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 2,
          },
        ],
        subtotal: 49.8,
        deliveryFee: 0,
        total: 49.8,
        status: 'shipped',
        paymentMethod: 'tiktok_shop',
        trackingCode: 'NL849201948BR',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'ord-site-1',
        orderNumber: 'DM-391820',
        origin: 'site',
        customerName: 'Lucas Ferreira',
        customerPhone: '(11) 97123-9988',
        customerEmail: 'lucas.ferreira@hotmail.com',
        deliveryAddress: 'Av. Paulista, 900 - Apto 51, Bela Vista, São Paulo - SP',
        items: [
          {
            product: INITIAL_PRODUCTS[1] || INITIAL_PRODUCTS[0],
            quantity: 1,
          },
          {
            product: INITIAL_PRODUCTS[2] || INITIAL_PRODUCTS[0],
            quantity: 1,
          },
        ],
        subtotal: 49.8,
        deliveryFee: 0,
        total: 49.8,
        status: 'paid',
        paymentMethod: 'pix',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];
  });

  // Staff / Admin user session
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUser | null>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEYS.STAFF_USER_SESSION) ||
        sessionStorage.getItem(STORAGE_KEYS.STAFF_USER_SESSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao restaurar sessão de staff:', e);
    }
    return null;
  });

  // Page routing state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getInitialRoute().route);
  const [loginTargetArea, setLoginTargetArea] = useState<'admin' | 'estoque'>(
    () => getInitialRoute().targetArea
  );

  const navigateTo = (newRoute: AppRoute, targetArea?: 'admin' | 'estoque') => {
    setCurrentRoute(newRoute);
    if (targetArea) {
      setLoginTargetArea(targetArea);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      let newPath = '/';
      if (newRoute === 'stock') newPath = '/estoque';
      else if (newRoute === 'admin') newPath = '/admin';
      else if (newRoute === 'staff-login')
        newPath = `/login${targetArea ? `?area=${targetArea}` : ''}`;

      window.history.pushState({ route: newRoute, targetArea }, '', newPath);
    } catch {}
  };

  useEffect(() => {
    const handlePopState = () => {
      const init = getInitialRoute();
      setCurrentRoute(init.route);
      setLoginTargetArea(init.targetArea);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Director / Admin session state
  const [isDirectorLoggedIn, setIsDirectorLoggedIn] = useState<boolean>(() => {
    try {
      const savedStaff = localStorage.getItem(STORAGE_KEYS.STAFF_USER_SESSION);
      if (savedStaff) {
        const u = JSON.parse(savedStaff);
        if (u && u.role === 'admin') return true;
      }
      return sessionStorage.getItem(STORAGE_KEYS.DIRECTOR_SESSION) === 'admin';
    } catch {
      return false;
    }
  });

  // Staff authorization for stock edits
  const [isStaffAuthorized, setIsStaffAuthorized] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.STAFF_UNLOCKED) === 'true';
    } catch {
      return false;
    }
  });

  // UI Modal visibility states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isGuaranteesModalOpen, setIsGuaranteesModalOpen] = useState(false);
  const [isDirectorAuthOpen, setIsDirectorAuthOpen] = useState(false);
  const [isDirectorPanelOpen, setIsDirectorPanelOpen] = useState(false);
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [builderProduct, setBuilderProduct] = useState<Product | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load centralized store data from server on startup so all visitors see the latest state
  useEffect(() => {
    async function loadServerData() {
      const serverData = await fetchStoreFromServer();
      if (serverData && serverData.initialized) {
        if (serverData.settings) {
          const s = serverData.settings;
          const normalizedSettings = {
            ...s,
            welcomeCouponCode: s.welcomeCouponCode || 'BEMVINDA10',
            welcomeCouponDiscountPercentage: s.welcomeCouponDiscountPercentage ?? 10,
            welcomeCouponMinOrder: s.welcomeCouponMinOrder ?? 150,
            freeShippingThreshold:
              s.freeShippingThreshold === 149 || s.freeShippingThreshold === 150 || !s.freeShippingThreshold
                ? 99
                : s.freeShippingThreshold,
            cardGatewayUrl:
              !s.cardGatewayUrl || s.cardGatewayUrl.includes('doidasemeias')
                ? 'https://link.mercadopago.com.br/ddemeias'
                : s.cardGatewayUrl,
            shippingMethods: Array.isArray(s.shippingMethods)
              ? s.shippingMethods.map((m: any) =>
                  m?.freeAbove === 149 || m?.freeAbove === 150 ? { ...m, freeAbove: 99 } : m
                )
              : s.shippingMethods,
          };
          setSettings((prev) => ({
            ...prev,
            ...normalizedSettings,
          }));
        }
        if (Array.isArray(serverData.products) && serverData.products.length > 0) {
          setProducts(serverData.products.filter(Boolean));
        }
        if (Array.isArray(serverData.suppliers) && serverData.suppliers.length > 0) {
          setSuppliers(serverData.suppliers.filter(Boolean));
        }
        if (Array.isArray(serverData.manufacturers) && serverData.manufacturers.length > 0) {
          setManufacturers(serverData.manufacturers.filter(Boolean));
        }
        if (Array.isArray(serverData.orders) && serverData.orders.length > 0) {
          setOrders(serverData.orders.filter(Boolean));
        }
        if (Array.isArray(serverData.customers) && serverData.customers.length > 0) {
          setCustomers(serverData.customers.filter(Boolean));
        } else {
          fetchCustomersFromServer().then((list) => {
            if (Array.isArray(list) && list.length > 0) setCustomers(list.filter(Boolean));
          });
        }
      } else {
        // Initialize server store with current state
        initServerStore({
          settings,
          products,
          suppliers,
          manufacturers,
          customers,
        });
      }
    }
    loadServerData();
  }, []);

  // Persist Products
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Erro ao salvar produtos no localStorage:', e);
    }
  }, [products]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Erro ao salvar configurações no localStorage:', e);
    }
  }, [settings]);

  // Persist Suppliers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Erro ao salvar fornecedores:', e);
    }
  }, [suppliers]);

  // Persist Manufacturers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(manufacturers));
    } catch (e) {
      console.warn('Erro ao salvar fabricantes:', e);
    }
  }, [manufacturers]);

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Erro ao salvar carrinho no localStorage:', e);
    }
  }, [cart]);

  // Persist Orders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Erro ao salvar pedidos no localStorage:', e);
    }
  }, [orders]);

  // Persist Customers (local cache)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.warn('Erro ao salvar clientes no localStorage:', e);
    }
  }, [customers]);

  // Customer handlers
  const refreshCustomers = async () => {
    const list = await fetchCustomersFromServer();
    setCustomers(list.filter(Boolean));
  };

  const handleAnonymizeCustomer = async (id: string) => {
    const res = await anonymizeCustomerOnServer(id);
    if (res.success) {
      await refreshCustomers();
      showToast('Dados anonimizados conforme a LGPD.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const res = await deleteCustomerOnServer(id);
    if (res.success) {
      await refreshCustomers();
      showToast('Cadastro de cliente excluído do banco de dados.');
    }
  };

  const handleLoginCustomer = async (newCustomer: Customer) => {
    setCustomer(newCustomer);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(newCustomer));
    } catch {}

    // Persist to server database immediately with LGPD compliance
    try {
      const res = await saveCustomerToServer(newCustomer);
      if (res.success && res.customer) {
        setCustomer(res.customer);
        try {
          localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(res.customer));
        } catch {}
      }
      await refreshCustomers();
    } catch (err) {
      console.warn('Erro ao salvar cliente no banco:', err);
    }

    showToast(`Conta salva! Bem-vindo(a), ${(newCustomer.name || '').split(' ')[0]}!`);
  };

  const handleLogoutCustomer = () => {
    setCustomer(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    } catch {}
    showToast('Sessão do cliente encerrada.');
  };

  // Order handlers
  const handlePlaceOrder = async (newOrder: Order) => {
    setOrders((prev) => {
      const updatedOrders = [newOrder, ...prev];
      syncOrdersToServer(updatedOrders);
      return updatedOrders;
    });

    // Give automatic inventory deduction
    newOrder.items.forEach((it) => {
      handleQuickDeductStock(it.product.id, it.quantity);
    });

    // Save/link customer to server database if customer details provided
    if (newOrder.customerName && newOrder.customerPhone) {
      try {
        await saveCustomerToServer({
          id: newOrder.customerId || customer?.id,
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          email: newOrder.customerEmail,
          password: newOrder.customerPassword,
          address: newOrder.deliveryAddress,
          cep: newOrder.cep,
          neighborhood: newOrder.neighborhood,
          city: newOrder.city,
          complement: newOrder.complement,
          emailMarketingConsent: newOrder.emailMarketingConsent !== undefined ? newOrder.emailMarketingConsent : true,
          emailMarketingConsentDate: newOrder.emailMarketingConsentDate || new Date().toISOString(),
          welcomeCoupon: 'BEMVINDA10',
          lgpdConsent: true,
          lgpdConsentDate: new Date().toISOString(),
          status: 'ativo',
        });
        await refreshCustomers();
      } catch (err) {
        console.warn('Erro ao salvar cliente no pedido:', err);
      }
    }

    showToast(`Pedido #${newOrder.orderNumber} realizado com sucesso!`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, trackingCode?: string) => {
    setOrders((prev) =>
      prev.map((o) => 
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              ...(trackingCode ? { trackingCode } : {}),
            }
          : o
      )
    );
    showToast(`Status do pedido atualizado para: ${newStatus.toUpperCase()}`);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) =>  (o.id === updatedOrder.id ? updatedOrder : o))
    );
    showToast(`Pedido #${updatedOrder.orderNumber} atualizado!`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) =>  o.id !== orderId));
    showToast('Pedido removido.');
  };

  const handleCreateManualOrder = (newOrder: Partial<Order>) => {
    setOrders((prev) => [newOrder as Order, ...prev]);
    showToast(`Pedido #${newOrder.orderNumber} registrado no sistema!`);
  };

  const handleQuickDeductStock = (productId: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newQty = Math.max(0, (p.stockQuantity || 0) - qty);
          return {
            ...p,
            stockQuantity: newQty,
            inStock: newQty > 0,
          };
        }
        return p;
      })
    );
  };

  // Supplier & Manufacturer handlers (Admin only)
  const handleSaveSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => {
      const exists = prev.some((s) => s.id === supplier.id);
      const updated = exists ? prev.map((s) => (s.id === supplier.id ? supplier : s)) : [supplier, ...prev];
      syncSuppliersToServer(updated);
      return updated;
    });
    showToast(`Fornecedor "${supplier.tradeName}" salvo!`);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      syncSuppliersToServer(updated);
      return updated;
    });
    showToast('Fornecedor removido do banco de dados.');
  };

  const handleSaveManufacturer = (mfg: Manufacturer) => {
    setManufacturers((prev) => {
      const exists = prev.some((m) => m.id === mfg.id);
      const updated = exists ? prev.map((m) => (m.id === mfg.id ? m : m)) : [mfg, ...prev];
      syncManufacturersToServer(updated);
      return updated;
    });
    showToast(`Fabricante "${mfg.name}" salvo!`);
  };

  const handleDeleteManufacturer = (id: string) => {
    setManufacturers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      syncManufacturersToServer(updated);
      return updated;
    });
    showToast('Fabricante removido do banco de dados.');
  };

  const handleUpdateProductStockDetails = (productId: string, details: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, ...details } : p));
      syncProductsToServer(updated);
      return updated;
    });
    showToast('Dados de estoque e fornecedor da peça atualizados!');
  };

  // Staff & Director session handlers
  const handleStaffLoginSuccess = (user: StaffUser) => {
    setCurrentStaffUser(user);
    setIsDirectorLoggedIn(user.role === 'admin');
    setIsStaffAuthorized(true);

    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_USER_SESSION, JSON.stringify(user));
      if (user.role === 'admin') {
        sessionStorage.setItem(STORAGE_KEYS.DIRECTOR_SESSION, 'admin');
      }
    } catch {}

    showToast(`Bem-vindo(a), ${user.name}!`);

    if (loginTargetArea === 'estoque') {
      navigateTo('stock');
    } else {
      if (user.role === 'admin') {
        navigateTo('admin');
      } else {
        navigateTo('stock');
      }
    }
  };

  const handleStaffLogout = () => {
    setCurrentStaffUser(null);
    setIsDirectorLoggedIn(false);
    setIsStaffAuthorized(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.STAFF_USER_SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.STAFF_USER_SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.DIRECTOR_SESSION);
      localStorage.removeItem(STORAGE_KEYS.STAFF_UNLOCKED);
    } catch {}
    showToast('Sessão da equipe encerrada.');
    navigateTo('store');
  };

  const handleLoginDirectorSuccess = () => {
    setIsDirectorLoggedIn(true);
    try {
      sessionStorage.setItem(STORAGE_KEYS.DIRECTOR_SESSION, 'admin');
    } catch {}
    setIsDirectorAuthOpen(false);
    navigateTo('admin');
    showToast('Acesso administrativo concedido à Direção!');
  };

  const handleLogoutDirector = () => {
    handleStaffLogout();
  };

  const handleOpenDirectorAuthOrPanel = () => {
    if (currentStaffUser?.role === 'admin' || isDirectorLoggedIn) {
      navigateTo('admin');
    } else {
      navigateTo('staff-login', 'admin');
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      showToast(`O produto "${product.name}" está esgotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product?.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          showToast(`Limite de estoque alcançado (${product.stockQuantity} un.)`);
          return prev;
        }
        return prev.map((item) =>
          item.product?.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    showToast(`"${product.name}" adicionado à sacola!`);
  };

  const handleAddCustomProductToCart = (item: CartItem) => {
    if (item.product.stockQuantity <= 0) {
      showToast(`O produto "${item.product.name}" está esgotado.`);
      return;
    }
    setCart((prev) => [...prev, item]);
    showToast(`"${item.product.name}" (Personalizado) adicionado à sacola!`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product?.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product?.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Quick Stock operations
  const handleAuthorizeStaff = () => {
    setIsStaffAuthorized(true);
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_UNLOCKED, 'true');
    } catch {}
    showToast('Acesso de equipe liberado para alterar estoque!');
  };

  const handleSaveStock = (productId: string, newStock: number) => {
    const updated = products.map((p) =>
      p.id === productId
        ? { ...p, stockQuantity: newStock, inStock: newStock > 0 }
        : p
    );
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch {}
    const p = products.find((x) => x.id === productId);
    showToast(`Estoque de "${p?.name || 'Peça'}" atualizado: ${newStock} un.`);
  };

  // Product image update handler (Apenas administradores logados)
  const handleUpdateProductImage = (productId: string, newImageUrl: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === productId ? { ...p, imageUrl: newImageUrl } : p
      );
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    const p = products.find((x) => x.id === productId);
    showToast(`Imagem de "${p?.name || 'Peça'}" atualizada com sucesso!`);
  };

  // Reset defaults
  const handleResetDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SETTINGS);
    setSuppliers(INITIAL_SUPPLIERS);
    setManufacturers(INITIAL_MANUFACTURERS);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.MANUFACTURERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    try {
      localStorage.removeItem('doidas_custom_logo');
    } catch {}
    resetServerStore();
    showToast('Catálogo, fornecedores e configurações restaurados para os padrões originais!');
  };

  const cartProductIds = useMemo(
    () => new Set(cart.map((item) => item.product?.id)),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cart]
  );

  const userOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter(
      (o) => 
        o.customerId === customer.id ||
        (customer.phone &&
          o.customerPhone && String(o.customerPhone).replace(/\D/g, '') === String(customer.phone).replace(/\D/g, '')) ||
        (customer.email &&
          o.customerEmail && String(o.customerEmail).toLowerCase() === String(customer.email).toLowerCase())
    );
  }, [orders, customer]);

  // Dedicated Page: Staff & Admin Login
  if (currentRoute === 'staff-login') {
    return (
      <StaffLoginPage
        onLoginSuccess={handleStaffLoginSuccess}
        onBackToStore={() => navigateTo('store')}
        targetArea={loginTargetArea}
      />
    );
  }

  // Dedicated Page: Integrated Stock Management
  if (currentRoute === 'stock') {
    if (!currentStaffUser) {
      return (
        <StaffLoginPage
          onLoginSuccess={handleStaffLoginSuccess}
          onBackToStore={() => navigateTo('store')}
          targetArea="estoque"
        />
      );
    }
    return (
      <StockPage
        currentUser={currentStaffUser}
        products={products}
        settings={settings}
        suppliers={suppliers}
        manufacturers={manufacturers}
        onSaveProducts={(newProducts) => {
          setProducts(newProducts);
          syncProductsToServer(newProducts);
        }}
        onSaveSupplier={handleSaveSupplier}
        onDeleteSupplier={handleDeleteSupplier}
        onSaveManufacturer={handleSaveManufacturer}
        onDeleteManufacturer={handleDeleteManufacturer}
        onUpdateProductStockDetails={handleUpdateProductStockDetails}
        onNavigateToAdmin={() => navigateTo('admin')}
        onNavigateToStore={() => navigateTo('store')}
        onLogout={handleStaffLogout}
      />
    );
  }

  // Dedicated Page: Store Administration & Settings
  if (currentRoute === 'admin') {
    return (
      <AdminPage
        currentUser={currentStaffUser}
        products={products}
        settings={settings}
        orders={orders}
        suppliers={suppliers}
        manufacturers={manufacturers}
        onSaveProducts={(newProducts) => {
          setProducts(newProducts);
          syncProductsToServer(newProducts);
        }}
        onSaveSettings={(newSettings) => {
          if (newSettings.heroMascotUrl) {
            try {
              localStorage.setItem('doidas_custom_logo', newSettings.heroMascotUrl);
            } catch (e) {
              console.warn('Erro ao salvar logo:', e);
            }
          }
          setSettings(newSettings);
          syncSettingsToServer(newSettings);
        }}
        onResetDefaults={handleResetDefaults}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrder={handleUpdateOrder}
        onSaveOrders={(newOrders) => {
          setOrders(newOrders);
          syncOrdersToServer(newOrders);
        }}
        onDeleteOrder={handleDeleteOrder}
        onLogoutDirector={handleStaffLogout}
        onSaveSupplier={handleSaveSupplier}
        onDeleteSupplier={handleDeleteSupplier}
        onSaveManufacturer={handleSaveManufacturer}
        onDeleteManufacturer={handleDeleteManufacturer}
        onUpdateProductStockDetails={handleUpdateProductStockDetails}
        onCreateManualOrder={handleCreateManualOrder}
        onQuickDeductStock={handleQuickDeductStock}
        customers={customers}
        onRefreshCustomers={refreshCustomers}
        onAnonymizeCustomer={handleAnonymizeCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onNavigateToStock={() => navigateTo('stock')}
        onNavigateToStore={() => navigateTo('store')}
        onOpenLogin={() => navigateTo('staff-login', 'admin')}
      />
    );
  }

  // Storefront Page (Clean Customer View - No stock/admin panels visible here)
  return (
    <div className="min-h-screen flex flex-col bg-[#190224] text-white selection:bg-[#ff007f] selection:text-white">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#16021e] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-pink-500/60 animate-slideDown text-xs sm:text-sm font-bold">
          <span className="text-xl">🧦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        settings={settings}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={customer}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        currentStaffUser={currentStaffUser}
        onNavigateToStock={() => navigateTo('stock')}
        onNavigateToAdmin={() => navigateTo('admin')}
        onLogoutStaff={handleStaffLogout}
        onOpenGuaranteesModal={() => setIsGuaranteesModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero
          settings={settings}
          onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
          isDirectorLoggedIn={currentStaffUser?.role === 'admin'}
          onOpenDirectorPanel={() => navigateTo('admin')}
        />

        {/* Subtle Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#ff007f]/40 to-transparent"></div>

        <ProductCatalog
          products={products}
          settings={settings}
          currentCategory={currentCategory}
          onCategoryChange={setCurrentCategory}
          onAddToCart={handleAddToCart}
          cartProductIds={cartProductIds}
          isAdminUnlocked={false}
          onOpenBuilder={setBuilderProduct}
        />

        {/* Foco no TikTok Hub */}
        <TikTokHubSection settings={settings} products={products} onAddToCart={handleAddToCart} />

        {/* Marketplace Real Reviews & Social Proof */}
        <MarketplaceReviews settings={settings} />

        <FeaturesSection settings={settings} />

        <StockBanner settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenDirectorAuth={handleOpenDirectorAuthOrPanel}
        isDirectorLoggedIn={currentStaffUser?.role === 'admin'}
        onLogoutDirector={handleStaffLogout}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        currentStaffUser={currentStaffUser}
        onNavigateToStock={() => navigateTo('stock')}
        onNavigateToAdmin={() => navigateTo('admin')}
        onLogoutStaff={handleStaffLogout}
        onOpenGuaranteesModal={() => setIsGuaranteesModalOpen(true)}
      />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp settings={settings} />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
        currentUser={customer}
        onOpenCustomerAuth={() => {
          setIsCartOpen(false);
          setIsCustomerAuthOpen(true);
        }}
        onPlaceOrder={handlePlaceOrder}
        onOpenGuaranteesModal={() => setIsGuaranteesModalOpen(true)}
      />

      {/* Customer Account & Order History Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        currentUser={customer}
        onLogin={handleLoginCustomer}
        onLogout={handleLogoutCustomer}
        userOrders={userOrders}
        settings={settings}
      />

      {/* Director / Admin Authentication Modal (if needed by quick PIN) */}
      <DirectorAuthModal
        isOpen={isDirectorAuthOpen}
        onClose={() => setIsDirectorAuthOpen(false)}
        onSuccess={handleLoginDirectorSuccess}
        correctPin={settings.adminPin}
      />

      {/* Product Builder Modal */}
      {builderProduct && (
        <ProductBuilderModal
          product={builderProduct}
          onClose={() => setBuilderProduct(null)}
          onAddToCart={handleAddCustomProductToCart}
        />
      )}

      {/* Modal Completo de Garantias e Segurança */}
      <SecurityGuaranteesModal
        isOpen={isGuaranteesModalOpen}
        onClose={() => setIsGuaranteesModalOpen(false)}
        settings={settings}
      />
    </div>
  );
}
