import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "../../../auth";

export default async function AdminDashboard() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage system users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Create, update, or delete users and modify their
                            roles.
                        </p>
                        <a
                            href="/admin/users"
                            className="mt-4 inline-block px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
                        >
                            Manage Users
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Admin Profile</CardTitle>
                        <CardDescription>Your admin details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-1 text-muted-foreground">
                            Logged in as:
                        </p>
                        <p className="font-medium">
                            {session?.user?.name || "Admin"}
                        </p>
                        <p className="font-medium">{session?.user?.email}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Role:{" "}
                            <span className="font-semibold text-emerald-600">
                                ADMIN
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
