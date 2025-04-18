import { getAuditLogs } from "@/lib/audit-logs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

// Simple server component to fetch and display audit logs
async function AuditLogList() {
    // Fetch all logs without pagination (limited to most recent 100 for performance)
    const { logs } = await getAuditLogs({
        limit: 100,
    });

    if (logs.length === 0) {
        return <p className="text-center py-10">No audit logs found</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Timestamp</th>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Entity</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                                <span
                                    title={new Date(
                                        log.timestamp
                                    ).toLocaleString()}
                                >
                                    {formatDistanceToNow(
                                        new Date(log.timestamp),
                                        { addSuffix: true }
                                    )}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span
                                    className={`inline-block px-2 py-1 rounded text-xs ${
                                        log.actionType === "CREATE"
                                            ? "bg-green-100 text-green-800"
                                            : log.actionType === "UPDATE"
                                            ? "bg-blue-100 text-blue-800"
                                            : log.actionType === "DELETE"
                                            ? "bg-red-100 text-red-800"
                                            : log.actionType === "LOGIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : log.actionType === "LOGOUT"
                                            ? "bg-orange-100 text-orange-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {log.actionType}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <div>
                                    <span className="font-medium">
                                        {log.entityType}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        ID: {log.entityId}
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                {log.user ? (
                                    <div>
                                        <div>{log.user.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {log.user.email}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">
                                        System
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                {log.description}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Main page component
export default async function AuditLogsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

            <p className="text-gray-600 mb-6">
                View a record of all activities and changes in the system
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>
                        A comprehensive log of actions performed by users and
                        system processes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AuditLogList />
                </CardContent>
            </Card>
        </div>
    );
}
