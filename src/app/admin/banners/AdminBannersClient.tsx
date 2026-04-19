"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Upload, Loader2 } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  active: boolean;
  sortOrder: number;
};

type BannerForm = {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  sortOrder: number;
};

type Product = { id: string; name: string; slug: string };

const EMPTY: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  active: true,
  sortOrder: 0,
};

export default function AdminBannersClient({ banners, products }: { banners: Banner[]; products: Product[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>({ ...EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro no upload");
      set("imageUrl", data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  function set(key: keyof BannerForm, value: string | boolean | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setEditId(null);
    setForm({ ...EMPTY });
    setShowForm(true);
  }

  function openEdit(b: Banner) {
    setEditId(b.id);
    setForm({ title: b.title, subtitle: b.subtitle ?? "", imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? "", active: b.active, sortOrder: b.sortOrder });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = editId ? `/api/admin/banners/${editId}` : "/api/admin/banners";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar");
      }
      setShowForm(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <button
        onClick={openCreate}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <PlusCircle className="w-4 h-4" />
        Novo Banner
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">{editId ? "Editar" : "Novo"} Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Banner *</label>
              <div className="flex gap-4 items-start">
                {/* Preview */}
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Preview" className="h-20 w-36 rounded-lg object-cover border border-gray-200 shrink-0" />
                ) : (
                  <div className="h-20 w-36 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 text-gray-400">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...</> : <><Upload className="w-3.5 h-3.5" /> Enviar arquivo</>}
                  </button>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder="ou cole a URL aqui (https://...)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link de Destino</label>
              <select
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Nenhum —</option>
                <optgroup label="Página de produtos">
                  <option value="/produtos">Todos os produtos</option>
                </optgroup>
                <optgroup label="Produto específico">
                  {products.map((p) => (
                    <option key={p.id} value={`/produtos/${p.slug}`}>{p.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
              <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} min={0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
              <label htmlFor="active" className="text-sm text-gray-700">Ativo</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum banner cadastrado.</p>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className={`rounded-xl border bg-white p-4 shadow-sm ${!banner.active ? "opacity-60" : ""}`}>
              {banner.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-28 object-cover rounded-lg mb-3 border border-gray-100" />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{banner.title}</p>
                  {banner.subtitle && <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>}
                  {banner.linkUrl && <p className="text-xs text-blue-600 font-mono truncate">{banner.linkUrl}</p>}
                  <p className="text-xs text-gray-400 mt-1">Ordem: {banner.sortOrder}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(banner.id, banner.active)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" title={banner.active ? "Desativar" : "Ativar"}>
                    {banner.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
