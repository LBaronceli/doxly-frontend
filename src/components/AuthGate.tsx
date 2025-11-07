import React from "react";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, me, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Please log in to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl">Doxly CRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{me?.email ?? "..."}</span>
              <span className="text-gray-400 ml-2">
                • {me?.org_id ?? "..."}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
