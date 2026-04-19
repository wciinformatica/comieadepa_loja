"use client";

import { useState, useEffect } from "react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Plus,
  Check,
  Loader2,
  ShoppingBag,
  User,
} from "lucide-react";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";

// ─── Types ─────────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
} | null;

export type SavedAddress = {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

type GuestForm = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
};

type AddressForm = {
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

const EMPTY_ADDRESS: AddressForm = {
  label: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

// ─── OrderSummary Sidebar ───────────────────────────────────────────────────

function OrderSummary({
  items,
  subtotal,
}: {
  items: CartItem[];
  subtotal: number;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 space-y-4 sticky top-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-blue-600" />
        Resumo do Pedido
      </h3>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
            <div className="relative h-14 w-14 rounded-lg overflow-hidden border bg-gray-50 shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              {item.variantLabel && (
                <p className="text-xs text-gray-500">{item.variantLabel}</p>
              )}
              <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Frete</span>
          <span className="text-green-600 font-medium">Grátis</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
          <span>Total</span>
          <span className="text-blue-600">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Identificação ──────────────────────────────────────────────────

function StepIdentification({
  user,
  guestForm,
  onChange,
  onNext,
}: {
  user: SessionUser;
  guestForm: GuestForm;
  onChange: (field: keyof GuestForm, value: string) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<GuestForm>>({});

  function validate() {
    if (user) return true;
    const e: Partial<GuestForm> = {};
    if (guestForm.name.trim().length < 3) e.name = "Nome obrigatório (mínimo 3 caracteres)";
    if (!/\S+@\S+\.\S+/.test(guestForm.email)) e.email = "E-mail inválido";
    if (guestForm.cpf.replace(/\D/g, "").length < 11) e.cpf = "CPF inválido";
    if (guestForm.phone.replace(/\D/g, "").length < 10) e.phone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-600" />
        Identificação
      </h2>

      {user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Não é você?{" "}
            <Link href="/api/auth/signout" className="text-blue-600 underline">
              Sair da conta
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
            <span>Tem conta?</span>
            <Link href="/login?callbackUrl=/checkout" className="text-blue-600 font-medium underline">
              Entrar agora
            </Link>
            <span className="text-gray-400">ou continue como visitante abaixo</span>
          </div>

          {(["name", "email", "cpf", "phone"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === "name" && "Nome completo *"}
                {field === "email" && "E-mail *"}
                {field === "cpf" && "CPF *"}
                {field === "phone" && "Telefone *"}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                value={guestForm[field]}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={
                  field === "cpf"
                    ? "000.000.000-00"
                    : field === "phone"
                    ? "(00) 00000-0000"
                    : ""
                }
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[field] ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors[field] && (
                <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Endereço ───────────────────────────────────────────────────────

function StepAddress({
  user,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  newAddressForm,
  onAddressChange,
  onBack,
  onNext,
}: {
  user: SessionUser;
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string | null) => void;
  newAddressForm: AddressForm;
  onAddressChange: (field: keyof AddressForm, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [showNewForm, setShowNewForm] = useState(!user || savedAddresses.length === 0);
  const [lookingUp, setLookingUp] = useState(false);
  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  async function lookupCep() {
    const cep = newAddressForm.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setLookingUp(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        onAddressChange("street", data.logradouro ?? "");
        onAddressChange("district", data.bairro ?? "");
        onAddressChange("city", data.localidade ?? "");
        onAddressChange("state", data.uf ?? "");
      }
    } catch {
      // silenciar
    } finally {
      setLookingUp(false);
    }
  }

  function validate() {
    if (selectedAddressId && !showNewForm) return true;
    const e: Partial<AddressForm> = {};
    if (!newAddressForm.zipCode) e.zipCode = "CEP obrigatório";
    if (!newAddressForm.street) e.street = "Rua obrigatória";
    if (!newAddressForm.number) e.number = "Número obrigatório";
    if (!newAddressForm.district) e.district = "Bairro obrigatório";
    if (!newAddressForm.city) e.city = "Cidade obrigatória";
    if (!newAddressForm.state) e.state = "Estado obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!showNewForm && selectedAddressId) {
      onNext();
      return;
    }
    if (validate()) {
      onSelectAddress(null); // new address will be sent inline
      onNext();
    }
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-blue-600" />
        Endereço de Entrega
      </h2>

      {/* Saved addresses (only for logged users) */}
      {user && savedAddresses.length > 0 && (
        <div className="space-y-2">
          {savedAddresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => {
                onSelectAddress(addr.id);
                setShowNewForm(false);
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                selectedAddressId === addr.id && !showNewForm
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  {addr.label && (
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                      {addr.label}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {addr.street}, {addr.number}
                    {addr.complement && ` - ${addr.complement}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {addr.district} — {addr.city}/{addr.state}
                  </p>
                  <p className="text-xs text-gray-400">CEP: {addr.zipCode}</p>
                </div>
                {selectedAddressId === addr.id && !showNewForm && (
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                )}
              </div>
            </button>
          ))}

          <button
            onClick={() => {
              setShowNewForm(!showNewForm);
              onSelectAddress(null);
            }}
            className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Usar outro endereço
          </button>
        </div>
      )}

      {/* New address form */}
      {showNewForm && (
        <div className="space-y-4">
          {user && savedAddresses.length > 0 && (
            <h3 className="text-sm font-semibold text-gray-700">Novo endereço</h3>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificação (ex: Casa, Trabalho)
            </label>
            <input
              value={newAddressForm.label}
              onChange={(e) => onAddressChange("label", e.target.value)}
              placeholder="Opcional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
            <div className="flex gap-2">
              <input
                value={newAddressForm.zipCode}
                onChange={(e) => onAddressChange("zipCode", e.target.value)}
                onBlur={lookupCep}
                placeholder="00000-000"
                maxLength={9}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.zipCode ? "border-red-400" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={lookupCep}
                disabled={lookingUp}
                className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </button>
            </div>
            {errors.zipCode && (
              <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro *</label>
              <input
                value={newAddressForm.street}
                onChange={(e) => onAddressChange("street", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.street ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                value={newAddressForm.number}
                onChange={(e) => onAddressChange("number", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.number ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                value={newAddressForm.complement}
                onChange={(e) => onAddressChange("complement", e.target.value)}
                placeholder="Apto, bloco..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input
                value={newAddressForm.district}
                onChange={(e) => onAddressChange("district", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.district ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.district && (
                <p className="text-red-500 text-xs mt-1">{errors.district}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input
                value={newAddressForm.city}
                onChange={(e) => onAddressChange("city", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
              <input
                value={newAddressForm.state}
                onChange={(e) => onAddressChange("state", e.target.value)}
                maxLength={2}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                  errors.state ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!showNewForm && !selectedAddressId}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Pagamento ──────────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  {
    value: "PIX" as const,
    label: "PIX",
    description: "Aprovação instantânea",
    icon: QrCode,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-500",
  },
  {
    value: "BOLETO" as const,
    label: "Boleto Bancário",
    description: "Vence em 3 dias úteis",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-500",
  },
  {
    value: "CREDIT_CARD" as const,
    label: "Cartão de Crédito",
    description: "Em até 3x sem juros",
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-500",
  },
];

function StepPayment({
  paymentMethod,
  onSetMethod,
  subtotal,
  selectedAddressId,
  savedAddresses,
  newAddressForm,
  user,
  guestForm,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: {
  paymentMethod: "PIX" | "BOLETO" | "CREDIT_CARD";
  onSetMethod: (m: "PIX" | "BOLETO" | "CREDIT_CARD") => void;
  subtotal: number;
  selectedAddressId: string | null;
  savedAddresses: SavedAddress[];
  newAddressForm: AddressForm;
  user: SessionUser;
  guestForm: GuestForm;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}) {
  const selectedAddr = selectedAddressId
    ? savedAddresses.find((a) => a.id === selectedAddressId)
    : null;

  return (
    <div className="space-y-5">
      {/* Resumo da identificação */}
      <div className="bg-white rounded-xl border p-5 space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm">Comprando como</h3>
        <p className="text-sm text-gray-700">{user?.name ?? guestForm.name}</p>
        <p className="text-sm text-gray-500">{user?.email ?? guestForm.email}</p>
      </div>

      {/* Resumo do endereço */}
      <div className="bg-white rounded-xl border p-5 space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm">Entregar em</h3>
        {selectedAddr ? (
          <div>
            <p className="text-sm text-gray-700">
              {selectedAddr.street}, {selectedAddr.number}
              {selectedAddr.complement && ` - ${selectedAddr.complement}`}
            </p>
            <p className="text-sm text-gray-500">
              {selectedAddr.district} — {selectedAddr.city}/{selectedAddr.state}
            </p>
            <p className="text-xs text-gray-400">CEP: {selectedAddr.zipCode}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700">
              {newAddressForm.street}, {newAddressForm.number}
              {newAddressForm.complement && ` - ${newAddressForm.complement}`}
            </p>
            <p className="text-sm text-gray-500">
              {newAddressForm.district} — {newAddressForm.city}/{newAddressForm.state}
            </p>
            <p className="text-xs text-gray-400">CEP: {newAddressForm.zipCode}</p>
          </div>
        )}
      </div>

      {/* Método de pagamento */}
      <div className="bg-white rounded-xl border p-5 space-y-3">
        <h3 className="font-semibold text-gray-900">Forma de Pagamento</h3>
        <div className="space-y-2">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = paymentMethod === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSetMethod(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  selected
                    ? `${opt.border} ${opt.bg}`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    selected ? opt.bg : "bg-gray-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${selected ? opt.color : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${selected ? "text-gray-900" : "text-gray-700"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500">{opt.description}</p>
                </div>
                {selected && <Check className={`h-5 w-5 ${opt.color}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Confirmar Pedido — {formatCurrency(subtotal)}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main CheckoutClient ─────────────────────────────────────────────────────

export default function CheckoutClient({
  user,
  savedAddresses,
}: {
  user: SessionUser;
  savedAddresses: SavedAddress[];
}) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const subtotal = totalPrice();

  const [step, setStep] = useState(1);
  const [guestForm, setGuestForm] = useState<GuestForm>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id ?? null
  );
  const [newAddressForm, setNewAddressForm] = useState<AddressForm>({ ...EMPTY_ADDRESS });
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "BOLETO" | "CREDIT_CARD">("PIX");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (items.length === 0) router.replace("/carrinho");
  }, [items.length, router]);

  if (items.length === 0) return null;

  function handleGuestChange(field: keyof GuestForm, value: string) {
    setGuestForm((f) => ({ ...f, [field]: value }));
  }

  function handleAddressChange(field: keyof AddressForm, value: string) {
    setNewAddressForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Record<string, unknown> = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        subtotal,
        total: subtotal,
        paymentMethod,
      };

      if (!user) {
        payload.customer = {
          name: guestForm.name,
          email: guestForm.email,
          cpf: guestForm.cpf.replace(/\D/g, ""),
          phone: guestForm.phone.replace(/\D/g, ""),
        };
      }

      if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.newAddress = newAddressForm;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Erro ao processar pedido");
      }

      const { orderId } = await res.json();
      clearCart();
      router.push(`/pedido/${orderId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro inesperado. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Finalizar Pedido</h1>

      <CheckoutSteps current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <StepIdentification
              user={user}
              guestForm={guestForm}
              onChange={handleGuestChange}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepAddress
              user={user}
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              newAddressForm={newAddressForm}
              onAddressChange={handleAddressChange}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepPayment
              paymentMethod={paymentMethod}
              onSetMethod={setPaymentMethod}
              subtotal={subtotal}
              selectedAddressId={selectedAddressId}
              savedAddresses={savedAddresses}
              newAddressForm={newAddressForm}
              user={user}
              guestForm={guestForm}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary items={items} subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
