"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContex";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tablesDB } from "@/Lib/appwrite";

export default function Dashboard() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    const [tickets, setTickets] = useState<any[]>([]);

    const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
    const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;

    useEffect(() => {
        if (!user && !loading) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const fetchTickets = async () => {
        if (!user) return;

        try {
            const res = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: TICKETS_COLLECTION_ID,
            });

            // Filter tickets by current user if not admin
            const userTickets = isAdmin 
                ? res.rows 
                : res.rows.filter((ticket: any) => ticket.userId === user.$id);

            setTickets(userTickets);
        } catch (error) {
            console.log("Error fetching tickets:", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user, isAdmin]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Welcome to the Ticket System Dashboard
                        {isAdmin && <Badge variant="secondary">Admin</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <Button onClick={() => router.push("/tickets/create")}>
                            Create Ticket
                        </Button>

                        {isAdmin && (
                            <Button
                                variant="outline"
                                onClick={() => router.push("/admin")}
                            >
                                Admin Panel
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">
                    {isAdmin ? "All Tickets" : "My Tickets"}
                </h2>

                {tickets.length === 0 ? (
                    <p className="text-muted-foreground">
                        No tickets created yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tickets.map((ticket) => (
                            <Card key={ticket.$id} className="hover:shadow-lg transition">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center text-lg">
                                        <span className="truncate">{ticket.title}</span>
                                        <Badge
                                            variant={
                                                ticket.status === "open"
                                                    ? "default"
                                                    : ticket.status === "in-progress"
                                                    ? "secondary"
                                                    : "destructive"
                                            }
                                        >
                                            {ticket.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex justify-between items-center">
                                    <Button
                                        size="sm"
                                        onClick={() => router.push(`/tickets/${ticket.$id}`)}
                                    >
                                        View
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
