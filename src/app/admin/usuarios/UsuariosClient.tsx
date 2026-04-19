"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  orders: number;
};

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Cliente",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "success" | "warning"> = {
  CUSTOMER: "secondary",
  ADMIN: "default",
  SUPER_ADMIN: "success",
};

export function UsuariosTable({
  users,
  currentUserRole,
}: {
  users: AdminUser[];
  currentUserRole: string;
}) {
  const [list, setList] = useState<AdminUser[]>(users);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setSelectedRole(user.role);
    setError(null);
  };

  const closeModal = () => {
    setEditUser(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
      setList((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, role: selectedRole } : u))
      );
      closeModal();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const canEditRole = (targetRole: string) => {
    if (currentUserRole === "SUPER_ADMIN") return true;
    // ADMIN pode apenas rebaixar para CUSTOMER ou manter CUSTOMER
    if (currentUserRole === "ADMIN" && targetRole === "CUSTOMER") return true;
    return false;
  };

  const availableRoles =
    currentUserRole === "SUPER_ADMIN"
      ? ["CUSTOMER", "ADMIN", "SUPER_ADMIN"]
      : ["CUSTOMER"];

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              list.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={ROLE_VARIANTS[user.role] ?? "secondary"}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.orders}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    {canEditRole(user.role) && (
                      <button
                        onClick={() => openEdit(user)}
                        className="text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                      >
                        Editar perfil
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Editar Perfil</h2>
            <p className="text-sm text-gray-600">
              Usuário: <span className="font-medium">{editUser.name ?? editUser.email}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de acesso</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || selectedRole === editUser.role}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
