"use client";

import { Label } from "@/components/ui/label";
import { account } from "@/Lib/appwrite";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";
import { useState } from "react";


import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";



export default function Signup() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await account.create(ID.unique(), email, password, name);
            await account.createEmailPasswordSession(email,password);
            await account.updatePrefs({ 
                role: "admin" // or "user" based on your logic,
            });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign up.");
        } finally {
            setLoading(false);
        }
    };
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Card className="w-full max-w-md rounded-lg shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center mb-4">Create an Account</CardTitle>

            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        >
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>

                </form>
            </CardContent>
        </Card>
      {/* Signup form goes here */}
    </div>
  );
}