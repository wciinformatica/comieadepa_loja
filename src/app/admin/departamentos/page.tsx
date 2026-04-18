import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminDepartmentsClient from "./AdminDepartmentsClient";

export default async function AdminDepartamentosPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const departments = await prisma.department.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
        <p className="text-sm text-gray-500">{departments.length} departamento(s)</p>
      </div>
      <AdminDepartmentsClient departments={departments} />
    </div>
  );
}
