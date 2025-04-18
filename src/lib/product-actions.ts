"use server";

import { auth } from "../../auth";
import prisma from "../../prisma/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Define the Product type
type Product = {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    status: "active" | "inactive" | "archived";
    availableAt: Date;
};

// Type for creating/updating a product
export type ProductFormData = Omit<Product, "id">;

/**
 * Get all products for the authenticated seller
 */
export async function getProducts() {
    const session = await auth();

    // Check if user is authenticated and is a SELLER
    // @ts-expect-error - role is available but not in the type
    if (!session?.user || session.user.role !== "SELLER") {
        throw new Error("Unauthorized: Only sellers can access products");
    }

    try {
        const products = await prisma.product.findMany({
            orderBy: { name: "asc" },
        });

        return products;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw new Error("Failed to fetch products");
    }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: number) {
    const session = await auth();

    // Check if user is authenticated and is a SELLER
    // @ts-expect-error - role is available but not in the type
    if (!session?.user || session.user.role !== "SELLER") {
        throw new Error("Unauthorized: Only sellers can access products");
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        return product;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        throw new Error("Failed to fetch product");
    }
}

/**
 * Create a new product
 */
export async function createProduct(formData: ProductFormData) {
    const session = await auth();

    // Check if user is authenticated and is a SELLER
    // @ts-expect-error - role is available but not in the type
    if (!session?.user || session.user.role !== "SELLER") {
        throw new Error("Unauthorized: Only sellers can create products");
    }

    // Validate required fields
    if (
        !formData.name ||
        formData.price === undefined ||
        formData.stock === undefined
    ) {
        throw new Error("Name, price, and stock are required fields");
    }

    try {
        // Create the product
        const product = await prisma.product.create({
            data: {
                name: formData.name,
                imageUrl: formData.imageUrl || "",
                price: Number(formData.price),
                stock: Number(formData.stock),
                status: formData.status || "inactive",
                availableAt: formData.availableAt
                    ? new Date(formData.availableAt)
                    : new Date(),
            },
        });

        // Revalidate the products page to show the new product
        revalidatePath("/seller/products");

        return product;
    } catch (error) {
        console.error("Failed to create product:", error);
        throw new Error("Failed to create product");
    }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: number, formData: ProductFormData) {
    const session = await auth();

    // Check if user is authenticated and is a SELLER
    // @ts-expect-error - role is available but not in the type
    if (!session?.user || session.user.role !== "SELLER") {
        throw new Error("Unauthorized: Only sellers can update products");
    }

    // Validate required fields
    if (
        !formData.name ||
        formData.price === undefined ||
        formData.stock === undefined
    ) {
        throw new Error("Name, price, and stock are required fields");
    }

    try {
        // Update the product
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: formData.name,
                imageUrl: formData.imageUrl || "",
                price: Number(formData.price),
                stock: Number(formData.stock),
                status: formData.status || "inactive",
                availableAt: formData.availableAt
                    ? new Date(formData.availableAt)
                    : new Date(),
            },
        });

        // Revalidate the products page to show the updated product
        revalidatePath("/seller/products");

        return product;
    } catch (error) {
        console.error(`Failed to update product with ID ${id}:`, error);
        throw new Error("Failed to update product");
    }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: number) {
    const session = await auth();

    // Check if user is authenticated and is a SELLER
    // @ts-expect-error - role is available but not in the type
    if (!session?.user || session.user.role !== "SELLER") {
        throw new Error("Unauthorized: Only sellers can delete products");
    }

    try {
        // Delete the product
        await prisma.product.delete({
            where: { id },
        });

        // Revalidate the products page
        revalidatePath("/seller/products");

        return { success: true };
    } catch (error) {
        console.error(`Failed to delete product with ID ${id}:`, error);
        throw new Error("Failed to delete product");
    }
}
