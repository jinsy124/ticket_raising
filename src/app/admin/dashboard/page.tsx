"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tablesDB } from "@/Lib/appwrite";
import { useAuth } from "@/context/AuthContex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetchingTickets, setFetchingTickets] = useState(true);

  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
  const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;

  // Protect admin dashboard - only admin@gmail.com can access
  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== "admin@gmail.com") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  const fetchTickets = async () => {
    if (!user || user.email !== "admin@gmail.com") return;

    try {
      const res = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TICKETS_COLLECTION_ID,
      });

      setTickets(res.rows);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setFetchingTickets(false);
    }
  };

  useEffect(() => {
    if (user && user.email === "admin@gmail.com") {
      fetchTickets();
    }
  }, [user]);

  if (loading || fetchingTickets) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.email !== "admin@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-muted/40">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push("/admin")}>
          Manage Tickets
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {tickets.filter((t) => t.status === "open").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {tickets.filter((t) => t.status === "in-progress").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Closed Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {tickets.filter((t) => t.status === "closed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.$id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/admin/tickets/${ticket.$id}`)}
              >
                <div>
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-sm text-muted-foreground">
                    User ID: {ticket.userId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === "open"
                      ? "bg-blue-100 text-blue-700"
                      : ticket.status === "in-progress"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
