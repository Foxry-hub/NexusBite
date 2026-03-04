import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SiswaDashboardClient from "./SiswaDashboardClient";

export const metadata = {
  title: "Dashboard Siswa — NexusBite",
  description: "Dashboard Pre-Order untuk siswa SMKN 40 Jakarta",
};

export default async function SiswaDashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SISWA") {
    if (user.role === "PENJUAL") redirect("/dashboard/penjual");
    if (user.role === "ADMIN") redirect("/admin/menu");
    redirect("/");
  }

  return <SiswaDashboardClient initialUser={user} />;
}
