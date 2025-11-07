# Doxly CRM Frontend

A modern CRM application frontend built with React, TypeScript, TanStack Query, and shadcn/ui components.

## Features

- **Authentication**: Login and signup with JWT token management
- **Customer Management**: Create, read, update, and delete customers
- **File Attachments**: Upload and manage customer files with presigned URLs
- **Modern UI**: Beautiful interface built with shadcn/ui components
- **Real-time Updates**: Optimistic updates and automatic cache invalidation

## Setup

1. Ensure your backend services are running via docker-compose on the default ports:
   - Auth Service: `http://localhost:8081`
   - Customer Service: `http://localhost:8082`
   - Attachments Service: `http://localhost:8083`

2. If your services run on different ports, update the URLs in `lib/api.ts`

## Default Credentials

The application comes pre-filled with test credentials:
- Email: `admin+postman@acme.test`
- Password: `changeme123`
- Organization: `Acme Inc`

## Architecture

### Services
- **Auth Service** (port 8081): Handles authentication and user management
- **Customer Service** (port 8082): Manages customer CRUD operations
- **Attachments Service** (port 8083): Handles file uploads via presigned URLs

### Tech Stack
- React + TypeScript
- TanStack Query for data fetching and caching
- shadcn/ui components
- Tailwind CSS
- Session storage for JWT tokens

## Usage

### Login/Signup
- Use the default credentials or create a new account
- Tokens are stored in session storage (cleared on tab close)

### Customer Management
- View all customers in a table
- Click on a customer to view details
- Add new customers with the "Add Customer" button
- Edit customer information
- Delete customers

### File Attachments
- Navigate to a customer detail page
- Use the file upload section to attach files
- Files are uploaded directly to object storage via presigned URLs
- View all attachments for a customer

## API Integration

The frontend communicates with three microservices:

1. **Auth API**: `/v1/signup`, `/v1/login`, `/v1/me`
2. **Customer API**: `/v1/customers` (CRUD operations)
3. **Attachments API**: `/v1/customers/:id/attachments/*` (presign, confirm, list)

All authenticated requests include the JWT token in the `Authorization: Bearer <token>` header.

## CORS Configuration

Ensure your backend services have CORS configured to allow requests from your frontend origin. For MinIO/S3 uploads, the bucket CORS policy must allow PUT requests.
