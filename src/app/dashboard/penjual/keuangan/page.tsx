import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import KeuanganClient from "./KeuanganClient";

export const metadata = {
  title: "Keuangan — NexusBite",
  description: "Kelola keuangan dan penarikan saldo penjual",
};

export default async function KeuanganPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "PENJUAL") {
    if (user.role === "SISWA") redirect("/dashboard/siswa");
    if (user.role === "ADMIN") redirect("/admin/menu");
    redirect("/");
  }

  return <KeuanganClient initialUser={user} />;
}
