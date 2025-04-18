import prisma from "@/../prisma/prisma";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic"; // Ensures the route is not statically cached

export async function GET() {
    try {
        console.log("Attempting to seed database...");

        // Optional: Clear existing products first for idempotent seeding
        // Be careful with this in production!
        console.log("Deleting existing products...");
        const { count: deletedCount } = await prisma.product.deleteMany({});
        console.log(`Deleted ${deletedCount} existing products.`);

        const productsToCreate = [
            // --- Remove the 'id' field, as it's auto-generated ---
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/smartphone-gaPvyZW6aww0IhD3dOpaU6gBGILtcJ.webp",
                name: "Smartphone X Pro",
                status: "active" as const, // Matches the Status enum ('active', 'inactive', 'archived')
                price: 999.0,
                stock: 150,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/earbuds-3rew4JGdIK81KNlR8Edr8NBBhFTOtX.webp",
                name: "Wireless Earbuds Ultra",
                status: "active" as const,
                price: 199.0,
                stock: 300,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/home-iTeNnmKSMnrykOS9IYyJvnLFgap7Vw.webp",
                name: "Smart Home Hub",
                status: "active" as const,
                price: 149.0,
                stock: 200,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/tv-H4l26crxtm9EQHLWc0ddrsXZ0V0Ofw.webp",
                name: "4K Ultra HD Smart TV",
                status: "inactive" as const, // Example of different status
                price: 799.0,
                stock: 50,
                availableAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Available in 1 week
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/laptop-9bgUhjY491hkxiMDeSgqb9R5I3lHNL.webp",
                name: "Gaming Laptop Pro",
                status: "active" as const,
                price: 1299.0,
                stock: 75,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/headset-lYnRnpjDbZkB78lS7nnqEJFYFAUDg6.webp",
                name: "VR Headset Plus",
                status: "archived" as const, // Example of different status
                price: 349.0,
                stock: 0, // Example: out of stock
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/watch-S2VeARK6sEM9QFg4yNQNjHFaHc3sXv.webp",
                name: "Smartwatch Elite",
                status: "active" as const,
                price: 249.0,
                stock: 250,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/speaker-4Zk0Ctx5AvxnwNNTFWVK4Gtpru4YEf.webp",
                name: "Bluetooth Speaker Max",
                status: "active" as const,
                price: 99.0,
                stock: 400,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/charger-GzRr0NSkCj0ZYWkTMvxXGZQu47w9r5.webp",
                name: "Portable Charger Super",
                status: "active" as const,
                price: 59.0,
                stock: 500,
                availableAt: new Date(),
            },
            {
                imageUrl:
                    "https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/thermostat-8GnK2LDE3lZAjUVtiBk61RrSuqSTF7.webp",
                name: "Smart Thermostat Pro",
                status: "inactive" as const,
                price: 199.0,
                stock: 175,
                availableAt: new Date(),
            },
        ];

        console.log(
            `Attempting to create ${productsToCreate.length} products...`
        );

        // Use prisma.product.createMany to insert the data
        const result = await prisma.product.createMany({
            data: productsToCreate,
        });

        console.log(`Successfully created ${result.count} products.`);

        return Response.json({
            message: `Database seeded successfully. Created ${result.count} products.`,
            createdCount: result.count,
        });
    } catch (error) {
        console.error("Error seeding database:", error);
        // Check if it's a Prisma-specific error for more details
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error Code:", error.code);
            console.error("Prisma Error Meta:", error.meta);
        }
        return Response.json(
            {
                message: "Failed to seed database.",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 } // Internal Server Error status
        );
    }
}
