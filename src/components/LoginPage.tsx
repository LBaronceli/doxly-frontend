import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("admin+postman@acme.test");
  const [password, setPassword] = useState("changeme123");
  const [orgName, setOrgName] = useState("Acme Inc");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signup(email, password, orgName);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Doxly CRM</CardTitle>
          <CardDescription>Sign in to manage your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {err && (
                  <Alert variant="destructive">
                    <AlertDescription>{err}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Inc"
                    required
                  />
                </div>
                {err && (
                  <Alert variant="destructive">
                    <AlertDescription>{err}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
