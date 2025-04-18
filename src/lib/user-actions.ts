"use server";

import prisma from "../../prisma/prisma";
import { auth } from "../../auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "./audit-logs";
import { ActionType } from "@prisma/client";

// Type for User creation/update
type UserData = {
    name: string;
    email: string;
    password?: string;
    role?: "ADMIN" | "SELLER" | "CUSTOMER";
};

// Check if the current user is an admin
async function isAdmin() {
    const session = await auth();
    // @ts-expect-error
    return session?.user?.role === "ADMIN";
}

// Get all users
export async function getUsers() {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized: Only admins can view users");
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

// Get a specific user
export async function getUser(id: string) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized: Only admins can view user details");
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
    }
}

// Create a new user
export async function createUser(userData: UserData) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized: Only admins can create users");
    }

    try {
        const { name, email, password, role } = userData;

        // Validate required fields
        if (!name || !email || !password) {
            throw new Error("Name, email, and password are required");
        }

        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error("A user with this email already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "CUSTOMER",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
            },
        });

        // Record the action in audit logs
        await createAuditLog({
            actionType: ActionType.CREATE,
            entityType: "User",
            entityId: newUser.id,
            description: `User '${newUser.name}' (${newUser.email}) was created with role ${newUser.role}`,
            userEntityId: newUser.id,
            data: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

        revalidatePath("/admin/users");
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

// Update a user
export async function updateUser(id: string, userData: UserData) {
    if (!(await isAdmin())) {
        throw new Error("Unauthorized: Only admins can update users");
    }

    try {
        const { name, email, password, role } = userData;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new Error("User not found");
        }

        // Prepare update data
        const updateData: any = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (password) {
            // Only hash and update password if provided
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
            },
        });

        // Record the action in audit logs
        const session = await auth();
        await createAuditLog({
            actionType: ActionType.UPDATE,
            entityType: "User",
            entityId: updatedUser.id,
            description: `User '${updatedUser.name}' was updated`,
            userEntityId: updatedUser.id,
            data: {
                previousData: {
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                },
                newData: updateData,
                passwordChanged: !!password,
            },
        });

        revalidatePath("/admin/users");
        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

// Delete a user
export async function deleteUser(id: string) {
    const session = await auth();

    // Verify the user is an admin
    // @ts-expect-error
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Only admins can delete users");
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new Error("User not found");
        }

        // Prevent deletion of the current admin user
        if (id === session.user.id) {
            throw new Error("Cannot delete your own account");
        }

        // Record the delete action in audit logs before actually deleting
        await createAuditLog({
            actionType: ActionType.DELETE,
            entityType: "User",
            entityId: id,
            description: `User '${existingUser.name}' (${existingUser.email}) with role ${existingUser.role} was deleted`,
            userId: session.user.id,
            data: {
                deletedUser: {
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                },
            },
        });

        // Delete the user
        await prisma.user.delete({
            where: { id },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}
