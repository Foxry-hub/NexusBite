import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminNavbar from "./components/AdminNavbar";

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
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <AdminNavbar userName={user.name} />
            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
