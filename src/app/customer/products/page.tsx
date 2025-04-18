"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveProducts } from "@/lib/product-actions";
import { useRouter } from "next/navigation";

// Define types for our product
type Product = {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    status: string;
    availableAt: Date;
};

export default function CustomerProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setIsLoading(true);
        try {
            const data = await getActiveProducts();
            setProducts(data);
        } catch (error: any) {
            console.error("Error fetching products:", error);
            setError(
                error.message ||
                    "Failed to load products. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    }

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleDateString();
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Available Products</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                        No active products available at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                            {product.imageUrl && (
                                <div className="h-48 overflow-hidden">
                                    {/* eslint-disable-next-line */}
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span className="font-medium">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Stock:</span>
                                        <span className="font-medium">
                                            {product.stock} available
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Available Since:</span>
                                        <span className="font-medium">
                                            {formatDate(product.availableAt)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
