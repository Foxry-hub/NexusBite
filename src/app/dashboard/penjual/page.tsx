import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import PenjualDashboardClient from "./PenjualDashboardClient";

export const metadata = {
  title: "Dashboard Penjual — NexusBite",
  description: "Dashboard untuk penjual di NexusBite",
};

export default async function PenjualDashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "PENJUAL") {
    if (user.role === "SISWA") redirect("/dashboard/siswa");
    if (user.role === "ADMIN") redirect("/admin/menu");
    redirect("/");
  }

  return <PenjualDashboardClient initialUser={user} />;
}
