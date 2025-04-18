// Truncate all tables
import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function GET() {
    try {
        // Need to truncate in the correct order to avoid foreign key constraints
        // First, delete tables with foreign keys
        await prisma.session.deleteMany({});
        await prisma.account.deleteMany({});
        await prisma.auditLog.deleteMany({});
        await prisma.verificationRequest.deleteMany({});

        // Then delete tables that are referenced by foreign keys
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});

        return NextResponse.json({
            success: true,
            message: "All tables have been truncated successfully",
        });
    } catch (error) {
        console.error("Error truncating tables:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to truncate tables",
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
