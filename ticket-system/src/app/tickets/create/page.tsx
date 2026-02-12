"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { tablesDB, storage } from "@/Lib/appwrite";
import { ID, Permission, Role } from "appwrite";
import { useAuth } from "@/context/AuthContex";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Environment variables
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const TICKETS_COLLECTION_ID = process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID!;
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID!;

export default function CreateTicket() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a ticket.");
      return;
    }

    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Upload screenshot if present
      let screenshotId: string | null = null;
      if (screenshot) {
        const file = await storage.createFile({
          bucketId: BUCKET_ID,
          fileId: ID.unique(),
          file: screenshot,
        });
        screenshotId = file.$id;
      }

      // 2️⃣ Create ticket using tablesDB.createRow (replaces deprecated createDocument)
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TICKETS_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          title,
          description,
          status: "open",
          userId: user.$id,
          screenshot: screenshotId,
        },
        permissions: [
          Permission.read(Role.user(user.$id)),   // Owner can read
          Permission.update(Role.user(user.$id)), // Owner can update
          Permission.delete(Role.user(user.$id)), // Owner can delete
        ],
      });


    
        router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

        


    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-lg shadow-lg rounded-2xl">
                <CardHeader>
                    <CardTitle>Create New Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className = "space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="Enter ticket title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                        </div>
                        <div className = "space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe your issue in detail"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className = "space-y-2">
                            <Label>Screenshot (optional)</Label>
                            <Input type="file" onChange={handleFileChange} />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating..." : "Create Ticket"}
                        </Button>



                        
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}