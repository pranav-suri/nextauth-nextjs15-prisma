"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    type ProductFormData,
} from "@/lib/product-actions";
import { useRouter } from "next/navigation";

// Define types for our product
type Product = {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    status: "active" | "inactive" | "archived";
    availableAt: Date;
};

// Default empty product for the form
const emptyProduct: ProductFormData = {
    name: "",
    imageUrl: "",
    price: 0,
    stock: 0,
    status: "inactive",
    availableAt: new Date(),
};

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<ProductFormData>(emptyProduct);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch products when the component mounts
    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setIsLoading(true);
        try {
            const data = await getProducts();
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

    function handleOpenDialog(product?: Product) {
        if (product) {
            // Edit mode
            setFormData({
                name: product.name,
                imageUrl: product.imageUrl,
                price: product.price,
                stock: product.stock,
                status: product.status,
                availableAt: new Date(product.availableAt),
            });
            setEditingId(product.id);
        } else {
            // Create mode
            setFormData(emptyProduct);
            setEditingId(null);
        }
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setFormData(emptyProduct);
        setEditingId(null);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            if (editingId) {
                // Update existing product
                await updateProduct(editingId, formData);
            } else {
                // Create new product
                await createProduct(formData);
            }

            // Refresh products list
            await fetchProducts();

            // Close dialog
            handleCloseDialog();

            // Refresh the page to ensure we get the latest data
            router.refresh();
        } catch (error: any) {
            setError(
                error.message || "An error occurred while saving the product"
            );
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            await deleteProduct(id);

            // Refresh products list
            await fetchProducts();

            // Refresh the page
            router.refresh();
        } catch (error: any) {
            setError(
                error.message || "Failed to delete product. Please try again."
            );
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]:
                name === "price" || name === "stock"
                    ? parseFloat(value)
                    : value,
        });
    }

    function handleSelectChange(name: string, value: string) {
        setFormData({
            ...formData,
            [name]: value,
        });
    }

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleDateString();
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <Button onClick={() => handleOpenDialog()}>
                    Add New Product
                </Button>
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
                    <p className="text-gray-500 mb-4">No products found</p>
                    <Button onClick={() => handleOpenDialog()}>
                        Create Your First Product
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                            {product.imageUrl && (
                                <div className="h-48 overflow-hidden">
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
                                            {product.stock} units
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span
                                            className={`font-medium ${
                                                product.status === "active"
                                                    ? "text-green-600"
                                                    : product.status ===
                                                      "inactive"
                                                    ? "text-amber-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {product.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                product.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Available From:</span>
                                        <span className="font-medium">
                                            {formatDate(product.availableAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            handleOpenDialog(product)
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? "Update the details of your existing product."
                                : "Fill in the details to create a new product."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="imageUrl"
                                    className="text-right"
                                >
                                    Image URL
                                </Label>
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    Price ($)
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">
                                    Stock
                                </Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        handleSelectChange("status", value)
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="availableAt"
                                    className="text-right"
                                >
                                    Available Date
                                </Label>
                                <Input
                                    id="availableAt"
                                    name="availableAt"
                                    type="date"
                                    value={
                                        formData.availableAt
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            availableAt: new Date(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    className="col-span-3"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingId ? "Update" : "Create"} Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
