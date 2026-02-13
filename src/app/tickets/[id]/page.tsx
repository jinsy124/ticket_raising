"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tablesDB } from "@/Lib/appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
   const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await tablesDB.getRow({
          databaseId: DATABASE_ID,
          tableId: TICKETS_COLLECTION_ID,
          rowId: id as string,
        });

        setTicket(res);
      } catch (error) {
        console.log("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Ticket not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          ← Back to Dashboard
        </Button>

        <Card className="rounded-2xl shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {ticket.title}
              </CardTitle>

              <Badge
                className="capitalize px-3 py-1 text-sm"
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
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-muted-foreground mt-2">
                {ticket.description}
              </p>
            </div>

            <div className="pt-4 border-t text-sm text-muted-foreground">
              Ticket ID: {ticket.$id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}