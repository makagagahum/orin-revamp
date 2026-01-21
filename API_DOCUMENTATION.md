# ORIN AI Form Submission API Documentation

## Overview
This document outlines the Form Submission API endpoint for the ORIN AI application. This API handles collecting user information through a form on the frontend and stores it in Supabase while syncing data to Google Sheets via n8n webhook.

## API Endpoint

### URL
```
POST /api/submit-form
```

### Base URL
- **Production**: `https://www.orin.work/api/submit-form`
- **Deployment**: `https://orin-revamp-*.vercel.app/api/submit-form`

## Request

### Method
`POST`

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "name": "John Doe",
  "business_name": "Acme Corp",
  "email": "john@example.com",
  "ai_role": "Business Analyst"
}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | User's full name |
| `business_name` | string | No | Name of the user's business or organization |
| `email` | string | Yes | User's email address |
| `ai_role` | string | No | The user's AI role or persona |

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-01-21T12:00:00Z",
    "name": "John Doe",
    "business_name": "Acme Corp",
    "email": "john@example.com",
    "ai_role": "Business Analyst"
  }
}
```

### Error Responses

#### 400 Bad Request
Missing required fields (name and/or email)
```json
{
  "error": "Name and email are required"
}
```

#### 405 Method Not Allowed
Request method is not POST
```json
{
  "error": "Method not allowed"
}
```

#### 500 Internal Server Error
Server-side error
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Data Storage

### Supabase Database
- **Table**: `submissions`
- **Columns**:
  - `id` (UUID, Primary Key)
  - `created_at` (Timestamp)
  - `name` (Text)
  - `business_name` (Text)
  - `email` (Text)
  - `ai_role` (Text)

### Google Sheets Sync
Form submissions are automatically synced to Google Sheets via n8n webhook when configured. See below for setup instructions.

## Environment Variables

The API requires the following environment variables to be set in Vercel:

```
SUPABASE_URL=https://yrxqirwonzjpsxhtrgzb.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SHEET_WEBHOOK_URL=https://hook.n8n.cloud/webhook/form-submission
```

## Implementation Steps

### 1. Frontend Form Integration
```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        business_name: formData.businessName,
        email: formData.email,
        ai_role: formData.aiRole,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Form submitted successfully!', data);
      // Handle success
    } else {
      console.error('Error:', data.error);
      // Handle error
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

### 2. n8n Webhook Setup for Google Sheets Sync
1. Create a new n8n workflow
2. Add a Webhook trigger (listen for POST requests)
3. Configure the webhook to receive form data
4. Add Google Sheets action to append rows
5. Set the webhook URL as `SHEET_WEBHOOK_URL` in Vercel environment variables
6. Deploy and test

## Deployment

The API is deployed as a Vercel serverless function and is automatically deployed when:
1. Changes are pushed to the GitHub repository
2. The file is edited through Google AI Studio and saved to GitHub
3. Vercel detects the push and triggers an automatic deployment

## Error Handling

The API includes comprehensive error handling:
- Request validation (ensures POST method and required fields)
- Supabase error handling (catches and logs database errors)
- Webhook error handling (logs Google Sheets sync errors without breaking form submission)
- Proper HTTP status codes and error messages

## Security

- API keys are securely stored in Vercel environment variables
- Only POST requests are accepted
- Input validation is performed on all requests
- Sensitive data is not exposed in error messages

## Testing

### Using cURL
```bash
curl -X POST https://www.orin.work/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "business_name": "Test Company",
    "email": "test@example.com",
    "ai_role": "Tester"
  }'
```

### Using Postman
1. Create a new POST request
2. URL: `https://www.orin.work/api/submit-form`
3. Headers: Set `Content-Type` to `application/json`
4. Body: Select "raw" and paste the request JSON
5. Send and verify the response

## Support & Troubleshooting

- **Form not submitting**: Check browser console for network errors
- **Data not in Supabase**: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
- **Data not syncing to Sheets**: Verify `SHEET_WEBHOOK_URL` is set and n8n webhook is active
- **500 error**: Check Vercel logs for detailed error information

## Version History

- **v1.0** - Initial release with Supabase integration and Google Sheets webhook support
  - Commit: fac8376
  - Date: 2026-01-21
