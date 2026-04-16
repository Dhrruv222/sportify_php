# Sportify AI Frontend Deployment Guide

## Prerequisites
- FileZilla or similar FTP client
- PHP hosting account with file upload access

## Deployment Steps

### 1. Build the Frontend
```bash
cd client
npm run build
```
This creates the `out/` directory with static files.

### 2. Upload Files via FileZilla
1. Open FileZilla
2. Connect to your PHP hosting server
3. Upload the contents of `client/out/` to your web root directory
   - Usually `public_html/` or `www/`
   - Make sure to upload the `_next/` folder and all files

### 3. Verify Deployment
- Visit your domain
- You should see the static Next.js page
- All assets (CSS, JS, images) should load

## File Structure After Upload
```
your-domain.com/
├── index.html
├── 404.html
├── favicon.ico
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
│   └── ...
├── next.svg
└── ...
```

## Troubleshooting
- **404 errors**: Ensure all files including `_next/` are uploaded
- **Styles not loading**: Check that CSS files in `_next/static/` are accessible
- **Images broken**: Verify image paths are correct

## API Integration
The frontend will make API calls to your Laravel backend. Update the API base URL in your frontend code to point to your PHP hosting domain.