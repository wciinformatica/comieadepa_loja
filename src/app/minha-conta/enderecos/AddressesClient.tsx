"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Check, X, Star } from "lucide-react";

type Address = {
  id: string;
  label: string | null;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
};

const EMPTY_FORM = {
  label: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  isDefault: false,
};

export default function AddressesClient({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function lookupCep() {
    const cep = form.zipCode.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setLookingUp(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          street: data.logradouro ?? f.street,
          district: data.bairro ?? f.district,
          city: data.localidade ?? f.city,
          state: data.uf ?? f.state,
        }));
      }
    } catch {
      // silenciar erro de lookup
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar");
      }
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este endereço?")) return;
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function setDefault(id: string) {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <PlusCircle className="w-4 h-4" />
        Novo Endereço
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Novo Endereço</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Identificação</label>
              <input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Ex.: Casa, Trabalho" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
              <input
                value={form.zipCode}
                onChange={(e) => set("zipCode", e.target.value)}
                onBlur={lookupCep}
                placeholder="00000-000"
                required
                maxLength={9}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              {lookingUp && <p className="text-xs text-gray-500 mt-1">Buscando...</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <input value={form.state} onChange={(e) => set("state", e.target.value)} required maxLength={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
              <input value={form.street} onChange={(e) => set("street", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input value={form.number} onChange={(e) => set("number", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input value={form.complement} onChange={(e) => set("complement", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input value={form.district} onChange={(e) => set("district", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="h-4 w-4" />
                Definir como endereço padrão
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              <Check className="w-4 h-4" />
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-gray-500">Nenhum endereço cadastrado.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className={`rounded-xl border p-4 ${addr.isDefault ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                {addr.label && <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{addr.label}</p>}
                <p className="text-sm text-gray-800">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                <p className="text-sm text-gray-700">{addr.district} — {addr.city}/{addr.state}</p>
                <p className="text-sm text-gray-500">CEP: {addr.zipCode}</p>
                {addr.isDefault && <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 font-medium"><Star className="w-3 h-3" /> Padrão</span>}
              </div>
              <div className="flex gap-1">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg" title="Definir como padrão">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
