import React from 'react';
import {
  Product,
  StoreSettings,
  Order,
  Supplier,
  Manufacturer,
  OrderStatus,
  StaffUser,
  Customer,
} from '../types';
import { DirectorPanel } from '../components/DirectorPanel';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface AdminPageProps {
  currentUser: StaffUser | null;
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  customers?: Customer[];
  onRefreshCustomers?: () => void;
  onAnonymizeCustomer?: (id: string) => Promise<void>;
  onDeleteCustomer?: (id: string) => Promise<void>;
  onSaveProducts: (products: Product[]) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDefaults: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingCode?: string) => void;
  onUpdateOrder: (order: Order) => void;
  onSaveOrders: (orders: Order[]) => void;
  onDeleteOrder: (orderId: string) => void;
  onLogoutDirector: () => void;
  onSaveSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onSaveManufacturer: (manufacturer: Manufacturer) => void;
  onDeleteManufacturer: (id: string) => void;
  onUpdateProductStockDetails: (productId: string, details: Partial<Product>) => void;
  onCreateManualOrder: (newOrder: Partial<Order>) => void;
  onQuickDeductStock: (productId: string, qty: number) => void;
  onNavigateToStock: () => void;
  onNavigateToStore: () => void;
  onOpenLogin: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = (props) => {
  const { currentUser, onNavigateToStore, onOpenLogin } = props;

  // Protect Admin Page: only logged-in users with role === 'admin'
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#14011a] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#20032b] border-2 border-pink-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black font-fun tracking-wide text-white">
              Acesso Exclusivo da Administração
            </h2>
            <p className="text-xs text-purple-300/80 mt-2 leading-relaxed">
              {currentUser
                ? `Você está conectado como "${currentUser.name}", porém sua conta não tem nível de Administrador Geral para acessar este painel.`
                : 'Esta página é protegida. É necessário estar autenticado com login e senha de Administrador para gerenciar a loja, usuários e finanças.'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onOpenLogin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-sm shadow-lg hover:scale-102 transition-transform cursor-pointer"
            >
              Fazer Login como Administrador
            </button>
            <button
              onClick={onNavigateToStore}
              className="w-full py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Loja Virtual</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DirectorPanel
      isOpen={true}
      fullPage={true}
      onClose={props.onNavigateToStore}
      currentUser={currentUser}
      onNavigateToStock={props.onNavigateToStock}
      onNavigateToStore={props.onNavigateToStore}
      products={props.products}
      settings={props.settings}
      orders={props.orders}
      suppliers={props.suppliers}
      manufacturers={props.manufacturers}
      onSaveProducts={props.onSaveProducts}
      onSaveSettings={props.onSaveSettings}
      onResetDefaults={props.onResetDefaults}
      onUpdateOrderStatus={props.onUpdateOrderStatus}
      onUpdateOrder={props.onUpdateOrder}
      onSaveOrders={props.onSaveOrders}
      onDeleteOrder={props.onDeleteOrder}
      onLogoutDirector={props.onLogoutDirector}
      onSaveSupplier={props.onSaveSupplier}
      onDeleteSupplier={props.onDeleteSupplier}
      onSaveManufacturer={props.onSaveManufacturer}
      onDeleteManufacturer={props.onDeleteManufacturer}
      onUpdateProductStockDetails={props.onUpdateProductStockDetails}
      onCreateManualOrder={props.onCreateManualOrder}
      onQuickDeductStock={props.onQuickDeductStock}
      customers={props.customers}
      onRefreshCustomers={props.onRefreshCustomers}
      onAnonymizeCustomer={props.onAnonymizeCustomer}
      onDeleteCustomer={props.onDeleteCustomer}
    />
  );
};
