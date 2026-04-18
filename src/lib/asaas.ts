/**
 * Cliente HTTP para a API do ASAAS
 * Docs: https://docs.asaas.com
 */

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? "";

export interface AsaasCustomer {
  id?: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
}

export interface AsaasPaymentRequest {
  customer: string; // ID do cliente ASAAS
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
  value: number;
  dueDate: string; // "YYYY-MM-DD"
  description?: string;
  externalReference?: string; // ID do pedido no nosso sistema
}

export interface AsaasPaymentResponse {
  id: string;
  status: string;
  billingType: string;
  value: number;
  dueDate: string;
  invoiceUrl: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  bankSlipUrl?: string;
  barCode?: string;
}

async function asaasFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ASAAS_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `ASAAS API error ${response.status}: ${JSON.stringify(error)}`
    );
  }

  return response.json();
}

// ─── Clientes ────────────────────────────────

export async function createAsaasCustomer(
  data: AsaasCustomer
): Promise<{ id: string }> {
  return asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function findAsaasCustomerByCpf(cpfCnpj: string) {
  return asaasFetch<{ data: Array<{ id: string }> }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`
  );
}

// ─── Pagamentos ──────────────────────────────

export async function createAsaasPayment(
  data: AsaasPaymentRequest
): Promise<AsaasPaymentResponse> {
  return asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAsaasPayment(paymentId: string): Promise<AsaasPaymentResponse> {
  return asaasFetch(`/payments/${paymentId}`);
}

export async function getAsaasPixQrCode(paymentId: string) {
  return asaasFetch<{ encodedImage: string; payload: string }>(
    `/payments/${paymentId}/pixQrCode`
  );
}

export async function cancelAsaasPayment(paymentId: string) {
  return asaasFetch(`/payments/${paymentId}`, { method: "DELETE" });
}

// ─── Webhook — mapeamento de status ──────────

export function mapAsaasStatusToPaymentStatus(asaasStatus: string): string {
  const map: Record<string, string> = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    RECEIVED: "RECEIVED",
    OVERDUE: "OVERDUE",
    REFUNDED: "REFUNDED",
    CANCELLED: "CANCELLED",
    CHARGEBACK_REQUESTED: "CHARGEBACK_REQUESTED",
    CHARGEBACK_DISPUTE: "CHARGEBACK_DISPUTE",
    AWAITING_CHARGEBACK_REVERSAL: "AWAITING_CHARGEBACK_REVERSAL",
    DUNNING_REQUESTED: "DUNNING_REQUESTED",
    DUNNING_RECEIVED: "DUNNING_RECEIVED",
    AWAITING_RISK_ANALYSIS: "AWAITING_RISK_ANALYSIS",
  };
  return map[asaasStatus] ?? "PENDING";
}
