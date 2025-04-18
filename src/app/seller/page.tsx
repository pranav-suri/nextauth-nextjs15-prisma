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

export default async function SellerDashboard() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>
                            Manage your product catalog
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            View, create, edit and manage all your products in
                            one place.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/seller/products">Manage Products</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Your seller profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Name:</span>{" "}
                                {session?.user?.name}
                            </p>
                            <p>
                                <span className="font-semibold">Email:</span>{" "}
                                {session?.user?.email}
                            </p>
                            {/* @ts-expect-error - role is available but not in the type */}
                            <p>
                                <span className="font-semibold">Role:</span>{" "}
                                {session?.user?.role}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
