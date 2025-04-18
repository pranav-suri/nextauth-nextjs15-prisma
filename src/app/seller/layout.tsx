import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import Link from "next/link";

export default async function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Check if the user is authenticated and has the SELLER role
    // @ts-expect-error
    if (!session?.user || session.user.role !== "SELLER") {
        return redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
                <aside className="w-64 bg-slate-800 text-white p-4">
                    <h2 className="text-xl font-bold mb-6">Seller Dashboard</h2>
                    <nav className="space-y-2">
                        <Link
                            href="/seller"
                            className="block py-2 px-4 hover:bg-slate-700 rounded"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/seller/products"
                            className="block py-2 px-4 hover:bg-slate-700 rounded"
                        >
                            Manage Products
                        </Link>
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
