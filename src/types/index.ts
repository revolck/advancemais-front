/**
 * Arquivo de definições de tipos para a aplicação
 */

// Auth
export interface User {
  id: string;
  name?: string;
  email: string;
  username: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface Session {
  user: User;
  expires: Date;
}

// Dashboard
export interface DashboardStats {
  totalSales: number;
  averageTicket: number;
  newCustomers: number;
  conversionRate: number;
  compareToLastPeriod: {
    totalSales: number;
    averageTicket: number;
    newCustomers: number;
    conversionRate: number;
  };
}

// Cliente
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  document?: string;
  type: "person" | "company";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// Produto
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  sku: string;
  stock: number;
  categories: string[];
  images: string[];
  status: "active" | "inactive" | "out_of_stock";
  attributes?: {
    [key: string]: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Pedido
export interface Order {
  id: string;
  code: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "processing" | "success" | "failed" | "refunded";
  paymentMethod: string;
  shippingMethod: string;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  attributes?: {
    [key: string]: string;
  };
}

// Campanha de Marketing
export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: "email" | "social" | "ad" | "other";
  status: "draft" | "scheduled" | "active" | "paused" | "completed";
  startDate: Date;
  endDate?: Date;
  budget?: number;
  target: {
    audience?: string[];
    demographics?: {
      ageRange?: [number, number];
      gender?: string[];
      location?: string[];
    };
  };
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    conversionRate?: number;
    cost?: number;
    cpc?: number;
    cpa?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Relatório Financeiro
export interface FinancialReport {
  id: string;
  type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    total: number;
    byCategory: {
      [category: string]: number;
    };
  };
  expenses: {
    total: number;
    byCategory: {
      [category: string]: number;
    };
  };
  profit: number;
  profitMargin: number;
  compareToPreviousPeriod: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Logs e Auditoria
export interface AuditLog {
  id: string;
  action: "create" | "update" | "delete" | "access" | "other";
  resourceType: string;
  resourceId: string;
  userId: string;
  user?: User;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Notificação
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: Date;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Paginação
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Filtros
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Resposta do log
export interface LogResponse {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

// Resposta de upload de arquivo
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalFilename: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: Date;
}

// Configurações do usuário
export interface UserSettings {
  userId: string;
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  dashboard: {
    layout: string;
    widgets: {
      id: string;
      position: number;
      visible: boolean;
    }[];
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

// Widget para dashboard
export interface DashboardWidget {
  id: string;
  type: "chart" | "stats" | "table" | "list" | "custom";
  title: string;
  size: "small" | "medium" | "large";
  refreshInterval?: number; // em segundos
  data?: any;
  config?: any;
}

// Webhook
export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
  status: "active" | "failing" | "disabled";
}

// Integração
export interface Integration {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  status: "active" | "inactive" | "error";
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Resposta de API de terceiros
export interface ThirdPartyApiResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  metadata?: any;
}

// Erro customizado para tratamento de exceções
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
