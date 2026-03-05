import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LandingPageClient from "./LandingPageClient";

export default async function Home() {
  // Check if user is authenticated - redirect to their dashboard
  const user = await getSessionUser();
  if (user) {
    switch (user.role) {
      case "SISWA":
        redirect("/dashboard/siswa");
      case "PENJUAL":
        redirect("/dashboard/penjual");
      case "ADMIN":
        redirect("/admin/menu");
    }
  }

  return <LandingPageClient />;
}
