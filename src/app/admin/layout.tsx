import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Check if the user is authenticated and has the ADMIN role
    // @ts-expect-error
    if (!session?.user || session.user.role !== "ADMIN") {
        return redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
                <aside className="w-64 bg-slate-800 text-white p-4">
                    <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
                    <nav className="space-y-2">
                        <a
                            href="/admin"
                            className="block py-2 px-4 hover:bg-slate-700 rounded"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/admin/users"
                            className="block py-2 px-4 hover:bg-slate-700 rounded"
                        >
                            Manage Users
                        </a>
                        <a
                            href="/admin/audit-logs"
                            className="block py-2 px-4 hover:bg-slate-700 rounded"
                        >
                            Audit Logs
                        </a>
                        <div className="pt-4 mt-4 border-t border-slate-700">
                            <Link
                                href="/api/auth/signout"
                                className="block py-2 px-4 hover:bg-slate-700 rounded text-red-400"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
