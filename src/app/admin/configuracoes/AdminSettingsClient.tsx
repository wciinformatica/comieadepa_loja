"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsClient() {
  const [storeName, setStoreName] = useState("COMIEADEPA — Loja Oficial");
  const [storeEmail, setStoreEmail] = useState("loja@comieadepa.com.br");
  const [asaasEnv, setAsaasEnv] = useState<"sandbox" | "production">("sandbox");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data.storeName) setStoreName(data.storeName);
        if (data.storeEmail) setStoreEmail(data.storeEmail);
        if (data.asaasEnv === "sandbox" || data.asaasEnv === "production") setAsaasEnv(data.asaasEnv);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, storeEmail, asaasEnv }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? "Erro ao salvar.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500 py-8 text-center">Carregando configurações...</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Informações da Loja</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Contato</label>
          <input
            type="email"
            value={storeEmail}
            onChange={(e) => setStoreEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Integração ASAAS</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="asaasEnv"
                value="sandbox"
                checked={asaasEnv === "sandbox"}
                onChange={() => setAsaasEnv("sandbox")}
                className="h-4 w-4 text-blue-600"
              />
              Sandbox (testes)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="asaasEnv"
                value="production"
                checked={asaasEnv === "production"}
                onChange={() => setAsaasEnv("production")}
                className="h-4 w-4 text-blue-600"
              />
              Produção
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Para alterar a chave de API e a URL do ASAAS, edite as variáveis{" "}
          <code className="bg-gray-100 px-1 rounded">ASAAS_API_KEY</code> e{" "}
          <code className="bg-gray-100 px-1 rounded">ASAAS_API_URL</code> no arquivo{" "}
          <code className="bg-gray-100 px-1 rounded">.env.local</code>.
        </p>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        {saved && <span className="text-sm text-green-600">Salvo com sucesso!</span>}
        {saveError && <span className="text-sm text-red-600">{saveError}</span>}
      </div>
    </form>
  );
}
