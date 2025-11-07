import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../lib/api";
import { Customer } from "../lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Plus, Mail, Phone, User } from "lucide-react";

interface CustomersListProps {
  onSelectCustomer: (id: string) => void;
}

export default function CustomersList({
  onSelectCustomer,
}: CustomersListProps) {
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersApi.list(50),
  });

  const createMutation = useMutation({
    mutationFn: () => customersApi.create({ name, email, phone, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully");
      setIsDialogOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
    },
    onError: (error: any) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const customers: Customer[] = Array.isArray(data)
    ? data
    : (data as any)?.items ?? [];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage your customer database</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Add a new customer to your database
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Bruce Wayne"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="bruce@wayne.enterprises"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1-555-1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional information..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending
                        ? "Creating..."
                        : "Create Customer"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading customers: {(error as Error).message}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No customers yet. Create your first customer to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell onClick={() => onSelectCustomer(customer.id)}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => onSelectCustomer(customer.id)}>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell onClick={() => onSelectCustomer(customer.id)}>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell onClick={() => onSelectCustomer(customer.id)}>
                      {customer.notes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {customer.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete customer ${customer.name}?`)) {
                            deleteMutation.mutate(customer.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
