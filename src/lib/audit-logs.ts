import prisma from "../../prisma/prisma";
import { ActionType } from "@prisma/client";
import { auth } from "../../auth";

export type AuditLogParams = {
    actionType: ActionType;
    entityType: string;
    entityId: string;
    description: string;
    data?: any;
    userId?: string;
    productId?: number;
    userEntityId?: string;
};

/**
 * Creates an audit log entry
 * @param params Audit log parameters
 */
export async function createAuditLog(params: AuditLogParams) {
    try {
        const {
            actionType,
            entityType,
            entityId,
            description,
            data,
            userId,
            productId,
            userEntityId,
        } = params;

        // If no userId is provided, try to get it from the session
        let userIdToUse = userId;
        if (!userIdToUse) {
            const session = await auth();
            userIdToUse = session?.user?.id;
        }

        // Create audit log entry
        return await prisma.auditLog.create({
            data: {
                actionType,
                entityType,
                entityId,
                description,
                data: data ? JSON.stringify(data) : null,
                userId: userIdToUse,
                productId: productId || null,
                userEntityId: userEntityId || null,
            },
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
        // Don't throw error to prevent main operation from failing
    }
}

/**
 * Retrieves audit logs with pagination
 */
export async function getAuditLogs({
    page = 1,
    limit = 20,
    entityType,
    actionType,
}: {
    page?: number;
    limit?: number;
    entityType?: string;
    actionType?: ActionType;
}) {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (actionType) where.actionType = actionType;

    // Get audit logs with pagination
    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                userEntity: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                timestamp: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
