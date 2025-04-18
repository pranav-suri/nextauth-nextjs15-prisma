import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        return redirect("/api/auth/signin");
    }

    const user = session?.user;

    const RelevantLink = () => {
        const AdminLink = <Link href="/admin">Admin Dashboard</Link>;
        const SellerLink = <Link href="/seller">Seller Dashboard</Link>;
        const CustomerLink = <Link href="/customer">Customer View</Link>;

        // @ts-expect-error
        if (session.user.role === "ADMIN") return AdminLink;
        // @ts-expect-error
        else if (session.user.role === "SELLER") return SellerLink;
        else return CustomerLink;
    };

    return (
        <section className="min-h-screen pt-20 bg-gradient-to-b from-background to-muted">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-3xl font-bold text-center">
                            Profile Page
                        </CardTitle>
                        <CardDescription className="text-center">
                            Your account information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center">
                        <Avatar className="w-24 h-24">
                            <AvatarImage
                                src={user?.image ? user.image : "/default.png"}
                                alt={`profile photo of ${user?.name}`}
                            />
                            <AvatarFallback>
                                {user?.name?.substring(0, 2).toUpperCase() ||
                                    "UN"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">ID</p>
                            <p className="font-medium">{user?.id}</p>

                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>
                            <p className="font-medium">{user?.name}</p>

                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>
                            <p className="font-medium">{user?.email}</p>
                            <p className="text-sm text-muted-foreground">
                                Role
                            </p>
                            {/* @ts-expect-error */}
                            <p className="font-medium">{user?.role}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-4 pb-6 pt-2">
                        <Button variant="outline">{RelevantLink()}</Button>
                        <Button variant="outline" asChild>
                            <Link href="/api/auth/signout">Sign Out</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
}
