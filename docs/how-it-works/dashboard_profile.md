# Dashboard & User Profile

This document outlines the architecture and functionality of the main dashboard and user profile management system in Prone.

## Overview

The Dashboard serves as the command center for users, providing an immediate overview of their project statistics and quick navigation. The Profile section allows users to manage their identity and security settings.

## Core Components

### 1. Dashboard (`/src/app/dashboard/page.tsx`)

The dashboard aggregates high-level metrics across all projects the user is a member of.

**Key Features:**
- **Welcome Section**: Personalized greeting using the session user's name.
- **Metric Cards**:
  - **Active Projects**: Count of projects with 'ACTIVE' status.
  - **Total Tasks**: Aggregate count of tasks across all projects.
  - **Team Members**: Total count of members involved in the user's projects.
- **Quick Navigation**: Direct links to Projects, Tasks, and Team views.

**Data Flow:**
1.  **Session Check**: Validates if the user is authenticated; redirects to `/signin` if not.
2.  **Data Fetch**: Calls `/api/projects` to retrieve all projects associated with the user.
3.  **Calculation**: Client-side reduction of project data to calculate totals for tasks and members.
4.  **Rendering**: Displays loading skeletons followed by the interactive dashboard cards.

### 2. User Profile (`/src/app/dashboard/profile/page.tsx`)

A comprehensive settings page for user account management.

**Key Features:**
- **Profile Display**: Shows current avatar, name, and email verification status.
- **Profile Editing**: Allows updating the display name and avatar URL.
- **Secure Password Change**: Dedicated form for updating passwords with validation (requires current password).
- **Session Synchronization**: Automatically updates the active NextAuth session when profile details change, ensuring the UI reflects updates immediately without re-login.

**Data Flow (Profile Update):**
1.  **Form Submission**: User submits new name or avatar URL.
2.  **API Call**: `PUT /api/user/profile` is called with new data.
3.  **Database Update**: Server updates the `User` record.
4.  **Session Update**: The frontend calls `update()` from `next-auth/react` to refresh the client-side session token.

**Data Flow (Password Change):**
1.  **Validation**: Frontend checks if new password matches confirmation.
2.  **API Call**: `POST /api/user/profile/change-password` sends current and new passwords.
3.  **Verification**: Server verifies the `currentPassword` hash matches the database.
4.  **Update**: Server hashes the `newPassword` and updates the user record.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | Used by Dashboard to fetch project stats. |
| `GET` | `/api/user/profile` | Fetches current user details. |
| `PUT` | `/api/user/profile` | Updates user name and avatar. |
| `POST` | `/api/user/profile/change-password` | Securely updates user password. |

## Visual Structure

```
Dashboard
├── Welcome Header
│   └── User Name
├── Stats Grid
│   ├── Projects Card (Count + Link)
│   ├── Tasks Card (Count + Link)
│   └── Collaboration Card (Count + Link)
```

```
Profile Page
├── Account Info
│   ├── Avatar/Initials
│   ├── Name & Email
│   ├── Verification Status
│   └── Join Date
├── Edit Profile Form
│   ├── Name Input
│   └── Avatar URL Input
└── Change Password Form
    ├── Current Password
    ├── New Password
    └── Confirm New Password
```
