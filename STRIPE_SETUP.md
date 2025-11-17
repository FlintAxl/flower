# Stripe Payment Setup Guide

## Issues Fixed

1. ✅ **Stripe Initialization Error** - Fixed by adding proper null checks for missing Stripe keys
2. ✅ **Backend Connection Error** - Instructions below to start backend server

## Setup Instructions

### 1. Start Backend Server

The `ERR_CONNECTION_REFUSED` error means your backend server is not running.

**To start the backend:**
```bash
cd backend
npm start
```

The server should start on port 4001 (or whatever is configured in your `.env` file).

### 2. Configure Stripe Keys

#### Backend Configuration

Add to `backend/config/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

#### Frontend Configuration

Create or update `frontend/.env` or `frontend/.env.local`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API=http://localhost:4001/api/v1
```

**Important:** After adding environment variables:
- Restart the backend server
- Restart the frontend dev server (if running)

### 3. Get Stripe Keys

1. Go to https://stripe.com
2. Sign up or log in
3. Navigate to **Developers** → **API keys**
4. Copy:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 4. Test Cards

Use these test cards for testing:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)

## Current Status

✅ **Stripe Integration:** Complete
✅ **Error Handling:** Fixed - app works even without Stripe keys (COD only)
✅ **Backend Routes:** Added payment processing endpoints

## Features

- **Card Payment:** Full Stripe integration with secure card input
- **COD Payment:** Works without Stripe configuration
- **Error Handling:** Graceful fallback when Stripe is not configured

## Troubleshooting

### Backend won't start
- Check if port 4001 is already in use
- Verify MongoDB connection
- Check `.env` file in `backend/config/` directory

### Stripe errors
- Verify keys are correct (test keys start with `pk_test_` and `sk_test_`)
- Check browser console for specific error messages
- Ensure frontend `.env` file is loaded (restart dev server)

### Payment not working
- Ensure backend server is running
- Check network tab for API errors
- Verify Stripe keys are set correctly

