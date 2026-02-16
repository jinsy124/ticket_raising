"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tablesDB, storage } from "@/Lib/appwrite";
import { useAuth } from "@/context/AuthContex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetchingTickets, setFetchingTickets] = useState(true);
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
  const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;

  // Protect admin page - only admin@gmail.com can access
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

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to change the status to "${newStatus}"?`
    );
    
    if (!confirmed) return;

    setUpdatingTicket(ticketId);
    
    try {
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TICKETS_COLLECTION_ID,
        rowId: ticketId,
        data: {
          status: newStatus,
        },
      });

      // Update local state
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.$id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update ticket status");
    } finally {
      setUpdatingTicket(null);
    }
  };

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
        <h1 className="text-3xl font-bold">Manage Tickets</h1>
        <Button onClick={() => router.push("/admin/dashboard")}>
          View Dashboard
        </Button>
      </div>

      {/* All Tickets Section */}
      <div className="grid gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.$id} className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {ticket.title}

                <Badge
                  variant={
                    ticket.status === "open"
                      ? "default"
                      : ticket.status === "closed"
                      ? "destructive"
                      : "secondary"
                  }
                  className={ticket.status === "in-progress" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {ticket.status}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p><strong>User ID:</strong> {ticket.userId}</p>
              <p><strong>Ticket ID:</strong> {ticket.$id}</p>
              <p className="text-foreground">{ticket.description}</p>
              
              {ticket.screenshot && (
                <div className="mt-4">
                  <p className="font-semibold mb-2 text-foreground">Screenshot:</p>
                  <img
                    src={storage.getFileView({
                      bucketId: process.env.NEXT_PUBLIC_BUCKET_ID!,
                      fileId: ticket.screenshot
                    }).toString()}
                    alt="Ticket Screenshot"
                    className="w-full max-w-md rounded-xl border shadow"
                  />
                </div>
              )}

              <div className="pt-4 border-t flex justify-between items-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/tickets/${ticket.$id}`)}
                >
                  View & Reply
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={ticket.status === "open" ? "default" : "outline"}
                    onClick={() => handleStatusChange(ticket.$id, "open")}
                    disabled={updatingTicket === ticket.$id || ticket.status === "open"}
                  >
                    {updatingTicket === ticket.$id && ticket.status !== "open" ? "Updating..." : "Open"}
                  </Button>
                  <Button
                    size="sm"
                    variant={ticket.status === "in-progress" ? "default" : "outline"}
                    className={ticket.status === "in-progress" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => handleStatusChange(ticket.$id, "in-progress")}
                    disabled={updatingTicket === ticket.$id || ticket.status === "in-progress"}
                  >
                    {updatingTicket === ticket.$id && ticket.status !== "in-progress" ? "Updating..." : "In Progress"}
                  </Button>
                  <Button
                    size="sm"
                    variant={ticket.status === "closed" ? "destructive" : "outline"}
                    onClick={() => handleStatusChange(ticket.$id, "closed")}
                    disabled={updatingTicket === ticket.$id || ticket.status === "closed"}
                  >
                    {updatingTicket === ticket.$id && ticket.status !== "closed" ? "Updating..." : "Closed"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}