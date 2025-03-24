# Supabase Auth Migration Implementation

This document provides an overview of the migration from NextAuth to Supabase Auth in the TransferWiki.cc application.

## Components Changed

1. **Authentication Context**
   - Created auth context in `_app.js` using React Context API 
   - Added `useAuth` hook for accessing auth state throughout the app

2. **Authentication Helper Functions**
   - Created `lib/auth.js` with utility functions:
     - `serverAuth()` - Server-side auth check
     - `getUserRole()` - Fetch user's role
     - `withAuth()` - HOC for protected routes
     - `withAdminAuth()` - HOC for admin-only routes
     - `isAdmin()` - Client-side admin check

3. **Authentication Pages**
   - `login.js` - Email/password and OAuth login
   - `register.js` - New user registration
   - `reset-password.js` - Password reset request
   - `update-password.js` - Password reset completion
   - `profile.js` - User profile management

4. **Layout Components**
   - Updated `MainLayout.jsx` to use Supabase Auth
   - Added user menu with profile and logout options

5. **Database Migration**
   - Added `supabase/migrations/20250324180000_auth_profiles.sql` 
   - Creates profiles table with row-level security
   - Sets up triggers for user registration

6. **Administration Script**
   - Updated `scripts/create-admin.js` to use Supabase Admin API

## Key Features

1. **Authentication Methods**
   - Email/password authentication
   - Google OAuth integration
   - QQ OAuth integration (configuration required)

2. **User Management**
   - Password reset flow
   - User profile editing
   - Role-based access control (USER/ADMIN)

3. **Security Improvements**
   - Row-level security for user data
   - Proper session management
   - Automatic profile creation on signup

## How to Test

1. **Registration Flow**
   - Sign up with email/password
   - Verify email confirmation is sent
   - Login with new credentials

2. **Password Reset**
   - Request password reset
   - Click link in email
   - Set new password
   - Log in with new password

3. **Profile Management**
   - Update profile information
   - Verify changes persist across sessions

4. **Role-based Access**
   - Create admin user using script
   - Verify admin access to protected routes
   - Verify regular users cannot access admin routes

## Implementation Notes

1. The migration maintains API compatibility with existing code that expects user info
2. The `useAuth` hook provides a drop-in replacement for the NextAuth session
3. OAuth providers need to be configured in the Supabase dashboard
4. Email templates can be customized in Supabase for better branding