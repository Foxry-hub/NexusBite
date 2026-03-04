import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminSidebar from "./components/AdminSidebar";

export const metadata: Metadata = {
    title: "Admin Dashboard — NexusBite",
    description: "NexusBite Admin Dashboard for managing e-canteen operations",
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is authenticated and has ADMIN role
    const user = await getSessionUser();
    
    if (!user) {
        redirect("/login");
    }
    
    if (user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <AdminSidebar user={user} />
            {/* Main Content */}
            <main className="ml-64 min-h-screen p-8">
                {children}
            </main>
        </div>
    );
}
