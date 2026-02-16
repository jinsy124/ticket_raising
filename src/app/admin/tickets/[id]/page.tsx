"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { tablesDB, storage } from "@/Lib/appwrite";
import { useAuth } from "@/context/AuthContex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Query, ID } from "appwrite";


export default function SingleTicketPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  


  const [ticket, setTicket] = useState<any>(null);
  const [fetchingTicket, setFetchingTicket] = useState(true);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
  const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;
  const MESSAGES_COLLECTION_ID =
    process.env.NEXT_PUBLIC_MESSAGES_COLLECTION_ID!;
  // Protect admin page
  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== "admin@gmail.com") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Fetch single ticket
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await tablesDB.getRow({
          databaseId: DATABASE_ID,
          tableId: TICKETS_COLLECTION_ID,
          rowId: ticketId,
        });

        setTicket(res);
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setFetchingTicket(false);
      }
    };

    if (ticketId) fetchTicket();
  }, [ticketId]);

  // ✅ Fetch Messages
  const fetchMessages = async () => {
    try {
      const res = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: MESSAGES_COLLECTION_ID,
        queries: [
          Query.equal("ticketId", ticketId),
          Query.orderAsc("$createdAt"),
        ],
      });

      setMessages(res.rows);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (ticketId) fetchMessages();
  }, [ticketId]);

  // ✅ Auto refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [ticketId]);

  // ✅ Send Reply (Admin)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);

    try {
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: MESSAGES_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          ticketId: ticketId,
          userId: user.$id,
          message: newMessage,
          isInternal: false,
        },
      });

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };


  const handleStatusChange = async (newStatus: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to change the status to "${newStatus}"?`
    );

    if (!confirmed) return;

    setUpdatingTicket(true);

    try {
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TICKETS_COLLECTION_ID,
        rowId: ticketId,
        data: { status: newStatus },
      });

      setTicket((prev: any) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setUpdatingTicket(false);
    }
  };

  if (loading || fetchingTicket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen p-8 bg-muted/40">
      <Button className="mb-6" onClick={() => router.push("/admin")}>
        ← Back to Manage Tickets
      </Button>

      <Card className="rounded-2xl shadow-md">
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
              className={
                ticket.status === "in-progress"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
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
                  fileId: ticket.screenshot,
                }).toString()}
                alt="Ticket Screenshot"
                className="w-full max-w-md rounded-xl border shadow"
              />
            </div>
          )}

          {/* Status Update Section */}
          <div className="pt-4 border-t">
            <p className="font-semibold mb-3 text-foreground">
              Update Status:
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleStatusChange("open")}
                disabled={updatingTicket || ticket.status === "open"}
              >
                {updatingTicket ? "Updating..." : "Open"}
              </Button>

              <Button
                size="sm"
                onClick={() => handleStatusChange("in-progress")}
                disabled={updatingTicket || ticket.status === "in-progress"}
              >
                {updatingTicket ? "Updating..." : "In Progress"}
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange("closed")}
                disabled={updatingTicket || ticket.status === "closed"}
              >
                {updatingTicket ? "Updating..." : "Closed"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 💬 Conversation Section */}
      <Card className="rounded-2xl shadow-md mt-6">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {messages.map((msg) => {
              const isAdmin = user && msg.userId === user.$id;
              return (
                <div
                  key={msg.$id}
                  className={`p-3 rounded-xl text-sm max-w-md ${
                    isAdmin
                      ? "bg-blue-100 ml-auto text-right"
                      : "bg-gray-200"
                  }`}
                >
                  <p className="font-semibold text-xs mb-1">
                    {isAdmin ? "Admin" : "User"}
                  </p>
                  <p>{msg.message}</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {new Date(msg.$createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}

            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No conversation yet.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your reply..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />

            <Button onClick={handleSendMessage} disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
