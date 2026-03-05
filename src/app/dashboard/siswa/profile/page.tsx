import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "Profile Saya — NexusBite",
  description: "Profile siswa SMKN 40 Jakarta",
};

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SISWA") {
    if (user.role === "PENJUAL") redirect("/dashboard/penjual");
    if (user.role === "ADMIN") redirect("/admin/menu");
    redirect("/");
  }

  return <ProfileClient initialUser={user} />;
}
