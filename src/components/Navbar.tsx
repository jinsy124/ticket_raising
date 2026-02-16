"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContex";
import { account } from "@/Lib/appwrite";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Navbar() {
  const { user, loading, isAdmin, reloadUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      await reloadUser();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = user
    ? [
        { href: isAdmin ? "/admin/dashboard" : "/dashboard", label: "Dashboard" },
        { href: "/tickets/create", label: "New Ticket" },
        ...(isAdmin ? [{ href: "/admin", label: "Manage Tickets" }] : []),
      ]
    : [];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            TS
          </div>
          <span className="text-lg font-semibold tracking-tight hidden sm:inline-block">
            TicketSystem
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {user.name || "User"}
                  </span>
                  {isAdmin && (
                    <Badge
                      variant="secondary"
                      className="mt-0.5 text-[10px] px-1.5 py-0"
                    >
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/signup")}>
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col items-center justify-center gap-1 p-2 rounded-md hover:bg-accent/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${
              mobileOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-foreground transition-all duration-200 ${
              mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border/40 pt-3 mt-2">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    {isAdmin && (
                      <Badge variant="secondary" className="text-[10px]">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      router.push("/login");
                      setMobileOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      router.push("/signup");
                      setMobileOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
