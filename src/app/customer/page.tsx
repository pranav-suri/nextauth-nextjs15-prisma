import { auth } from "../../../auth";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CustomerDashboard() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Customer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>
                            Browse available products
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Explore our catalog of active products available for
                            purchase.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/customer/products">
                                Browse Products
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Profile</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Welcome back, {session?.user?.name || "Customer"}!
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Email: {session?.user?.email}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
