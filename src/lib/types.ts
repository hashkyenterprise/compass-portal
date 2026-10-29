export type UserRole = "admin" | "staff";

export type ServiceType = string;

export type CatalogService = {
  id: string;
  name: string;
  price: number;
};

export type CatalogLocation = {
  id: string;
  name: string;
};

export type VisitServiceLine = {
  id: string;
  name: string;
  price: number;
};

export type ResultPath = "same_day" | "lab";

export type PaymentModel = "trigger" | "invoice" | "self_pay";

export type BillingStatus = "invoiced" | "overdue" | "payment_received" | "paid";

export type LabStatus =
  | "not_required"
  | "queued"
  | "shipped"
  | "expected"
  | "delivered"
  | "results_in";

export type ResultDeliveryStatus = "not_ready" | "attached" | "drafted" | "sent" | "blocked";

export type VisitStage =
  | "checked_in"
  | "in_service"
  | "same_day_complete"
  | "awaiting_lab"
  | "results_ready"
  | "results_delivered"
  | "closed";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  message: string;
};

export type Visit = {
  id: string;
  visitNumber: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  service: ServiceType;
  serviceOther?: string;
  serviceLines?: VisitServiceLine[];
  location: string;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  reasonNotes?: string;
  resultPath: ResultPath;
  paymentModel: PaymentModel;
  netTermsDays: number;
  dueDate: string;
  amount: number;
  billingStatus: BillingStatus;
  invoiceNumber?: string;
  paidAt?: string;
  quickbooksRef?: string;
  labStatus: LabStatus;
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  expectedDeliveryAt?: string;
  deliveredAt?: string;
  resultFileName?: string;
  resultFileStored?: boolean;
  resultFileSize?: number;
  resultAttachedAt?: string;
  resultDeliveryStatus: ResultDeliveryStatus;
  draftSubject?: string;
  draftBody?: string;
  draftedAt?: string;
  sentAt?: string;
  sentTo?: string;
  optInElectronic: boolean;
  thirdPartyAuth: boolean;
  identityAck: boolean;
  noDiagnosisAck: boolean;
  stage: VisitStage;
  audit: AuditEvent[];
};

export type Settings = {
  clinicName: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicAddress: string;
  timezone: string;
  emailFromName: string;
  emailFromAddress: string;
  emailReplyTo: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpConnected: boolean;
  resultsSubject: string;
  resultsBody: string;
  qbConnected: boolean;
  qbCompany: string;
  qbRealmId: string;
  qbLastSync: string | null;
  qbMatchBy: "visit" | "invoice" | "payer";
  services: CatalogService[];
  locations: CatalogLocation[];
};

export type AppState = {
  users: StaffUser[];
  currentUser: StaffUser | null;
  visits: Visit[];
  settings: Settings;
};
