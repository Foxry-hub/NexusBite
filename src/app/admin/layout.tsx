import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard — NexusBite",
    description: "NexusBite Admin Dashboard for managing e-canteen operations",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                            <svg
                                className="h-5 w-5 text-emerald-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                                />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Nexus<span className="text-emerald-400">Bite</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-full bg-gray-800/60 px-3 py-1.5 text-sm text-gray-400 sm:flex">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Admin
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-400">
                            A
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
