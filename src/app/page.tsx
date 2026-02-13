"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContex";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Fast &amp; Simple Ticket Management
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Raise &amp; Track Tickets{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Effortlessly
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
            Create support tickets, attach screenshots, and track resolution
            status — all in one clean, modern interface.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {loading ? (
              <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <>
                <Button
                  size="lg"
                  className="gap-2 px-6"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-6"
                  onClick={() => router.push("/tickets/create")}
                >
                  Create a Ticket
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="gap-2 px-6"
                  onClick={() => router.push("/signup")}
                >
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-6"
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl mb-10">
            Everything you need to manage support
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background/70 backdrop-blur-sm border-border/50 hover:border-border transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Create Tickets</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Raise support tickets with a title, description, and optional
                  screenshot attachment.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/70 backdrop-blur-sm border-border/50 hover:border-border transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Track Status</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor ticket progress from open to resolved — always know
                  where things stand.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/70 backdrop-blur-sm border-border/50 hover:border-border transition-colors sm:col-span-2 lg:col-span-1">
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Admins can manage all tickets, while users see and control
                  only their own.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TicketSystem. All rights reserved.</p>
          <p>
            Built with{" "}
            <span className="font-medium text-foreground">Next.js</span> &amp;{" "}
            <span className="font-medium text-foreground">Appwrite</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
