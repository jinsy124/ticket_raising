"use client";

import { useEffect, useState } from "react";
import { tablesDB, account } from "@/Lib/appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/Lib/appwrite";

export default function AdminPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
  const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Optional: Protect page
        const user = await account.get();
        if (user.prefs.role !== "admin") {
          alert("Access denied");
          return;
        }

        const res = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: TICKETS_COLLECTION_ID,
          
        });

        setTickets(res.rows);
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <p className="p-8">Loading tickets...</p>;
  
  return (
    <div className="min-h-screen p-8 bg-muted/40">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

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
                      : ticket.status === "in-progress"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {ticket.status}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong>User ID:</strong> {ticket.userId}</p>
              <p><strong>Ticket ID:</strong> {ticket.$id}</p>
              <p>{ticket.description}</p>
              {ticket.screenshot && (
                <img
                    src={storage.getFilePreview(
                        process.env.NEXT_PUBLIC_BUCKET_ID!,
                        ticket.screenshot
                    )}
                    alt="Screenshot"
                    className="w-full max-w-md rounded-xl border shadow"
                />
              )}

              
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}