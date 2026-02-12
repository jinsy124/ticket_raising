"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContex";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Dashboard() {
    const { user,loading,isAdmin } = useAuth();
    const router =useRouter();

    useEffect(() => {
        if (!user && ! loading) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    if (!user) {
        return null; // or a loading spinner
    }



    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Card className="w-full max-w-md p-6">
                <CardHeader>
                    <CardTitle>
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

         </div>   
    )
}