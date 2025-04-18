"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} from "@/lib/user-actions";

// Define the User type based on your Prisma schema
type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
};

// This will be a client component that uses server actions directly
export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // This effect will run on component mount to fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteUser(userId: string) {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            await deleteUser(userId);
            // Refresh the user list
            fetchUsers();
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Failed to delete user"
            );
        }
    }

    if (loading) {
        return <div className="p-8">Loading users...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Users</h1>
                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    Create New User
                </Button>
            </div>

            {showCreateForm && (
                <UserForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        setShowCreateForm(false);
                        fetchUsers();
                    }}
                />
            )}

            {editingUser && (
                <UserForm
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}

            <div className="grid gap-4">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardContent className="p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {user.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {user.email}
                                </p>
                                <span
                                    className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                                        user.role === "ADMIN"
                                            ? "bg-red-100 text-red-700"
                                            : user.role === "SELLER"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                    }`}
                                >
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingUser(user)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {users.length === 0 && (
                    <div className="text-center p-12 border rounded-lg bg-slate-50">
                        <p className="text-slate-500">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Form component for creating and editing users
function UserForm({
    user,
    onClose,
    onSuccess,
}: {
    user?: User;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        role: user?.role || "CUSTOMER",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // If we're editing and password is empty, remove it from the request
            const dataToSend =
                user && !formData.password
                    ? {
                          name: formData.name,
                          email: formData.email,
                          role: formData.role as
                              | "ADMIN"
                              | "SELLER"
                              | "CUSTOMER",
                      }
                    : {
                          ...formData,
                          role: formData.role as
                              | "ADMIN"
                              | "SELLER"
                              | "CUSTOMER",
                      };

            if (user) {
                // Update existing user
                await updateUser(user.id, dataToSend);
            } else {
                // Create new user
                await createUser(dataToSend);
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>{user ? "Edit User" : "Create New User"}</CardTitle>
                <CardDescription>
                    {user
                        ? "Update user details and role"
                        : "Add a new user to the system"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="password"
                        >
                            Password{" "}
                            {user && "(leave blank to keep current password)"}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required={!user}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            htmlFor="role"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="SELLER">Seller</option>
                            <option value="CUSTOMER">Customer</option>
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-slate-800 hover:bg-slate-700"
                        >
                            {isSubmitting ? "Saving..." : "Save User"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
