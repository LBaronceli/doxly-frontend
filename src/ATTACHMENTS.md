# Attachment Upload Flow

The CRM implements a complete three-step attachment upload flow using presigned URLs.

## How It Works

### 1. Request Presigned URL
When a user selects a file to upload:
- **Endpoint**: `POST /v1/customers/{customer_id}/attachments/presign`
- **Request Body**:
  ```json
  {
    "filename": "document.pdf",
    "content_type": "application/pdf",
    "size": 12345
  }
  ```
- **Response**:
  ```json
  {
    "url": "https://minio-host/presigned-url...",
    "object_key": "unique-object-key"
  }
  ```

### 2. Upload File to Presigned URL
The frontend directly uploads the file to object storage:
- **Method**: `PUT` to the presigned URL
- **Headers**: `Content-Type: <file content type>`
- **Body**: Raw file binary data
- **Important**: No Authorization header - the URL is pre-authenticated

### 3. Confirm Upload
After successful upload, confirm with the backend:
- **Endpoint**: `POST /v1/customers/{customer_id}/attachments/confirm`
- **Request Body**:
  ```json
  {
    "object_key": "unique-object-key",
    "filename": "document.pdf",
    "content_type": "application/pdf",
    "size": 12345
  }
  ```
- This creates the attachment record in the database

### 4. List Attachments
To view all customer attachments:
- **Endpoint**: `GET /v1/customers/{customer_id}/attachments?limit=20`
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "attachment-id",
        "org_id": "org-id",
        "customer_id": "customer-id",
        "object_key": "unique-object-key",
        "filename": "document.pdf",
        "content_type": "application/pdf",
        "size_bytes": 12345,
        "uploaded_by": "user-id",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
  ```

## Implementation Details

### File Upload Component
Located in `/components/CustomerDetail.tsx`:
- File input for selection
- Upload button triggers the three-step process
- Progress indication during upload
- Toast notifications for success/error
- Automatic refresh of attachment list after upload

### API Methods
Located in `/lib/api.ts`:
- `attachmentsApi.presign()` - Get presigned URL
- `uploadToPresignedUrl()` - Upload file directly
- `attachmentsApi.confirm()` - Confirm upload
- `attachmentsApi.list()` - Get all attachments

### Error Handling
- File validation (size, type)
- Network error handling
- User-friendly error messages via toasts
- Automatic retry available through React Query

## CORS Configuration

For presigned URL uploads to work, your MinIO/S3 bucket must allow:
- `PUT` method
- `Content-Type` header
- Expose `ETag` header
- Match the public host URL in presigned URLs

## Security Notes

- JWT token required for presign and confirm endpoints
- Direct upload doesn't expose backend credentials
- Presigned URLs expire after configured time
- Files scoped to customer and organization
