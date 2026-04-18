import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminBannersClient from "./AdminBannersClient";

export default async function AdminBannersPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <p className="text-sm text-gray-500">Gerencie os banners da página inicial</p>
      </div>
      <AdminBannersClient banners={banners} />
    </div>
  );
}
