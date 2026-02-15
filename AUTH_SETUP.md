# Authentication Setup Guide

This guide explains how to set up and configure Supabase authentication for the Asset Tracking System.

## Installation

### 1. Install Dependencies

First, install the Supabase JavaScript client:

```bash
npm install
```

This will install `@supabase/supabase-js` and all other dependencies.

## Configuration

### 2. Get Supabase Credentials

1. Go to [Supabase](https://supabase.com)
2. Log in to your project (or create one if you don't have it)
3. Navigate to **Settings → API**
4. Copy the following values:
   - **Project URL** - This is your `VITE_SUPABASE_URL`
   - **Anon/Public Key** - This is your `VITE_SUPABASE_ANON_KEY`

### 3. Create .env File

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env.local` to git. The `.gitignore` already excludes it.

## Pages

### Register Page (`#/register`)
- New users can create an account
- Email & password validation
- Password confirmation check
- Minimum 8 character password requirement
- Automatic redirect to login after successful registration

### Login Page (`#/login`)
- Existing users can sign in
- Demo account quick-fill buttons for testing:
  - Alice (Admin) - alice@example.com
  - Bob (User) - bob@example.com
  - Carol (User) - carol@example.com
- Automatic redirect to dashboard after successful login

## Testing Demo Accounts

The database is pre-seeded with 3 demo users:

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | admin |
| bob@example.com | password123 | user |
| carol@example.com | password123 | user |

### Quick Test Flow:
1. Go to `#/login`
2. Click one of the demo account buttons to auto-fill credentials
3. Click "Sign In"
4. You'll be redirected to the dashboard

## Architecture

### Authentication Flow

```
User Input (Register/Login)
         ↓
    Form Validation
         ↓
   Supabase Auth
         ↓
    Success/Error
         ↓
   Redirect/Display Error
```

### File Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client & auth helpers
├── pages/
│   ├── login/
│   │   ├── login.html       # Login form
│   │   ├── login.css        # Login styles
│   │   └── login.js         # Login logic
│   ├── register/
│   │   ├── register.html    # Register form
│   │   ├── register.css     # Auth page styles
│   │   └── register.js      # Register logic
│   └── ...
└── router.js                # Routes including /login and /register
```

## Available Auth Functions

All auth functions are exported from `src/lib/supabase.js`:

### `signUp(email, password)`
- Registers a new user
- Returns: `{ data, error }`
- Example:
  ```javascript
  const { data, error } = await signUp('user@example.com', 'password123');
  ```

### `signIn(email, password)`
- Signs in existing user
- Returns: `{ data, error }`
- Example:
  ```javascript
  const { data, error } = await signIn('user@example.com', 'password123');
  ```

### `signOut()`
- Signs out current user
- Returns: `{ error }`

### `getCurrentUser()`
- Gets the current authenticated user
- Returns: `{ user, error }`
- Example:
  ```javascript
  const { user, error } = await getCurrentUser();
  if (user) {
    console.log('Logged in as:', user.email);
  }
  ```

### `onAuthStateChange(callback)`
- Subscribes to auth state changes
- Callback receives: `(event, session)`
- Example:
  ```javascript
  const subscription = await onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    console.log('Session:', session);
  });
  ```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env.local` with your Supabase credentials
3. ✅ Run development server: `npm run dev`
4. ✅ Test login at `http://localhost:5173/#/login`
5. Implement protected routes (dashboard access only for authenticated users)
6. Add sign-out functionality in header
7. Connect dashboard to display user's strategies and assets

## Security Notes

- Anon keys are safe to use in frontend code - they only allow access to public data and auth operations
- Never share your service role key - it has full database access
- All row-level security policies are already implemented in the database
- Passwords are hashed by Supabase Auth (scrypt by default)

## Troubleshooting

### "Missing Supabase credentials" error
- Make sure `.env.local` file exists
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Variables must begin with `VITE_` prefix to be accessible in the browser

### CORS errors
- Ensure browser environment has access to Supabase
- Check Supabase project settings → Auth → URL Configuration
- Add your domain to allowed redirect URLs

### "Email not confirmed" error
- By default, Supabase requires email confirmation before login
- Go to Supabase dashboard → Auth → Users → click the user → confirm email manually
- Or disable email verification in Auth settings (not recommended for production)

## Further Reading

- [Supabase JavaScript Library](https://supabase.com/docs/reference/javascript)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth#row-level-security)
