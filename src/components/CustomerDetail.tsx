import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi, attachmentsApi, uploadToPresignedUrl } from "../lib/api";
import { Customer, Attachment } from "../lib/types";
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
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import {
  ArrowLeft,
  Upload,
  File as FileIcon, // avoid DOM File name collision
  Mail,
  Phone,
  Calendar,
  Download,
  ExternalLink,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerDetail({
  customerId,
  onBack,
}: CustomerDetailProps) {
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ---- Customer query (v5: no onSuccess option) ----
  const {
    data: customer,
    isLoading: customerLoading,
    isSuccess: customerSuccess,
  } = useQuery<Customer, Error, Customer, readonly ["customer", string]>({
    queryKey: ["customer", customerId] as const,
    queryFn: () => customersApi.get(customerId),
  });

  // Mirror query data into local edit state when it changes
  useEffect(() => {
    if (customerSuccess && customer) {
      setName(customer.name);
      setEmail(customer.email ?? "");
      setPhone(customer.phone ?? "");
      setNotes(customer.notes ?? "");
    }
  }, [customerSuccess, customer?.id]); // change when a different customer loads

  // ---- Attachments query (normalize to Attachment[]) ----
  const { data: attachments, isLoading: attachmentsLoading } = useQuery<
    Attachment[],
    Error,
    Attachment[],
    readonly ["attachments", string]
  >({
    queryKey: ["attachments", customerId] as const,
    queryFn: async () => {
      const res = await attachmentsApi.list(customerId);
      return Array.isArray(res) ? res : res.items ?? [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      customersApi.update(customerId, {
        name,
        email, // or: email || undefined
        phone, // or: phone || undefined
        notes, // or: notes || undefined
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const { url, object_key } = await attachmentsApi.presign(
        customerId,
        file.name,
        file.type || "application/octet-stream",
        file.size
      );

      await uploadToPresignedUrl(
        url,
        file,
        file.type || "application/octet-stream"
      );

      await attachmentsApi.confirm(customerId, {
        object_key,
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        size: file.size,
      });

      qc.invalidateQueries({ queryKey: ["attachments", customerId] });
      toast.success("File uploaded successfully");
      setFile(null);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  async function handleDownload(attachmentId: string, inline = false) {
    try {
      setDownloadingId(attachmentId);
      const { url } = await attachmentsApi.getDownloadUrl(
        customerId,
        attachmentId,
        inline ? "inline" : "attachment"
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(`Download failed: ${e.message ?? e}`);
    } finally {
      setDownloadingId(null);
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (customerLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-red-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Button>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{customer.name}</CardTitle>
                <CardDescription>Customer Details</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(customer.name);
                      setEmail(customer.email ?? "");
                      setPhone(customer.phone ?? "");
                      setNotes(customer.notes ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {customer.notes}
                    </p>
                  </div>
                )}
                {customer.created_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Created {formatDate(customer.created_at)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>Upload and manage customer files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="flex-1"
                  />
                  <Button onClick={handleUpload} disabled={!file || uploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                {file && (
                  <p className="text-sm text-gray-600">
                    Selected: {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {attachmentsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !attachments || attachments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attachments yet
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment) => {
                  const isPreviewable =
                    (attachment.content_type?.startsWith("image/") ?? false) ||
                    attachment.content_type === "application/pdf" ||
                    attachment.filename.toLowerCase().endsWith(".pdf");

                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <FileIcon className="h-8 w-8 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{attachment.filename}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatFileSize(attachment.size_bytes)}</span>
                          {attachment.created_at && (
                            <>
                              <span>•</span>
                              <span>{formatDate(attachment.created_at)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPreviewable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(attachment.id, true)}
                            title="Preview (inline)"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleDownload(attachment.id, false)}
                          disabled={downloadingId === attachment.id}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadingId === attachment.id
                            ? "Preparing…"
                            : "Download"}
                        </Button>
                      </div>

                      <Badge variant="secondary">
                        {attachment.content_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
