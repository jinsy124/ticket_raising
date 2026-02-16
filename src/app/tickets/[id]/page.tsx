"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tablesDB, storage } from "@/Lib/appwrite";
import { useAuth } from "@/context/AuthContex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Query, ID, Permission, Role } from "appwrite";


export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  


  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
  const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;
  const MESSAGES_COLLECTION_ID =
    process.env.NEXT_PUBLIC_MESSAGES_COLLECTION_ID!;


  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await tablesDB.getRow({
          databaseId: DATABASE_ID,
          tableId: TICKETS_COLLECTION_ID,
          rowId: id as string,
        });

        setTicket(res);

        const messagesRes = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: MESSAGES_COLLECTION_ID,
          queries: [
            Query.equal("ticketId", id as string),
            Query.orderAsc("$createdAt"),
          ],
        });

        setMessages(messagesRes.rows);
      } catch (error) {
        console.log("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
      
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        fetchTicket();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id]);

  // Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);

    try {
      const res = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: MESSAGES_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          ticketId: id,
          message: newMessage,
          userId: user.$id,
          isInternal: false,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      });

      setMessages((prev) => [...prev, res]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

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
                    : ticket.status === "closed"
                    ? "destructive"
                    : "secondary"
                }
                style={ticket.status === "in-progress" ? { backgroundColor: "#16a34a" } : {}}
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

            {ticket.screenshot && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Screenshot</h3>
                <img
                  src={storage.getFileView({
                    bucketId: process.env.NEXT_PUBLIC_BUCKET_ID!,
                    fileId: ticket.screenshot
                  }).toString()}
                  alt="Ticket Screenshot"
                  className="w-full max-w-2xl rounded-xl border shadow"
                />
              </div>
            )}

            <div className="pt-4 border-t text-sm text-muted-foreground">
              Ticket ID: {ticket.$id}
            </div>
          </CardContent>
        </Card>
        {/* Messages Section */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No messages yet.
              </p>
            )}

            {messages.map((msg) => {
              const isCurrentUser = user && msg.userId === user.$id;
              return (
                <div
                  key={msg.$id}
                  className={`p-3 border rounded-xl ${
                    isCurrentUser ? "bg-blue-50 ml-auto max-w-md" : "bg-muted max-w-md"
                  }`}
                >
                  <p className="font-semibold text-xs mb-1">
                    {isCurrentUser ? "You" : "Support"}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.$createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}

            {/* Send Message */}
            <div className="flex gap-2 pt-4 border-t">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />

              <Button onClick={handleSendMessage} disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}