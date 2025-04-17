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

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        return redirect("/api/auth/signin");
    }

    const user = session?.user;

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
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6 pt-2">
                        <Button variant="outline">Edit Profile</Button>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
}
