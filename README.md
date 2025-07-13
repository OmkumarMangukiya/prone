# Prone : Project Management Tool

Prone is a modern, feature-rich project management tool built with Next.js 14, designed to help teams collaborate efficiently, track tasks, and manage projects with ease.

## Technologies & Skills Needed

### Core Stack

- **Next.js 14** - Full-stack React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Tailwind CSS** - Styling
- **Redis** - Caching and sessions

### Additional Technologies

#### Authentication & Security

- **NextAuth.js** - Authentication solution
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT handling
- **zod** - Schema validation

#### Real-time Features

- **Socket.io** - WebSocket for real-time updates

#### UI/UX Libraries

- **@dnd-kit/core** - Drag and drop functionality
- **react-hook-form** - Form management
- **react-query/TanStack Query** - Data fetching
- **recharts** or **Chart.js** - Data visualization
- **react-calendar** - Calendar components
- **lucide-react** - Icons

#### Email & Notifications

- **Nodemailer** - Email sending
- **React-hot-toast** - Toast notifications

#### Development Tools

- **ESLint & Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **Docker** (Optional) - Containerization

### Skills to Learn/Strengthen

1. Database Design - Relational modeling with Prisma
2. Real-time Programming - WebSocket implementation
3. Caching Strategies - Redis implementation
4. Email Templates - HTML email design
5. Data Visualization - Chart libraries
6. Performance Optimization - Next.js optimization
7. Security Best Practices - OWASP guidelines
8. API Design - REST API patterns
9. Testing - Unit and integration testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Redis instance

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/OmkumarMangukiya/prone.git
   cd prone
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your database credentials and other settings.

4. Initialize the database:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

After seeding the database, you can log in with these demo accounts:

- Admin: admin@example.com (password: password123)
- Demo User: demo@example.com (password: password123)

## Project Structure

```
prone/
├── app/              # Next.js App Router
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Dashboard and main app views
│   ├── projects/     # Project management views
│   └── ...
├── components/       # Reusable React components
├── lib/              # Utility functions and services
├── prisma/           # Database schema and migrations
├── public/           # Static assets
└── styles/           # Global styles
```

## Core Features

### Authentication & User Management

- User Registration - Email signup with email verification
- User Login - Secure authentication with JWT tokens
- Forgot Password - Password reset via email link
- Password Security - Strong password requirements
- Session Management - Secure user sessions
- Profile Creation - User profiles with avatars, bio, contact info
- Profile Updates - Self-service profile editing
- User Preferences - Personalized settings, notification preferences
- Activity Status - Online/offline status indicators
- User Search - Find and connect with other users
- User Roles - Admin, Project Manager, Team Member, Viewer roles
- Permission Management - Basic permission controls
- Project-Level Permissions - Role assignments per project
- Activity Tracking - Basic user activity logs

### Project Management

- Create New Project - Project setup with name, description, objectives
- Project Templates - Pre-built templates for different project types
- Project Duplication - Clone existing projects
- Project Settings - Configure project parameters and defaults
- Project Status - Active, on hold, completed, archived states
- Project Categories - Organize projects by type or department
- Kanban Boards - Drag-and-drop task management
- List View - Traditional task listing with sorting options
- Calendar View - Timeline visualization of tasks and deadlines
- Timeline/Gantt Charts - Basic project scheduling with dependencies
- Board View - Card-based project organization
- Table View - Spreadsheet-like data management
- Activity Feed - Real-time project updates and changes

### Task Management ✅ **IMPLEMENTED**

- **Task CRUD Operations** - Create, read, update, and delete tasks with full validation
- **Task Assignment** - Assign tasks to project members with role-based permissions
- **Task Status Management** - Four-stage workflow: To Do, In Progress, In Review, Done
- **Task Priorities** - Four priority levels: Low, Medium, High, Urgent with color coding
- **Due Date Management** - Set and track task deadlines with overdue indicators
- **Kanban Board View** - Visual task management with status-based columns
- **Task Filtering** - Filter by status, assignee, priority, and project
- **Cross-Project Task View** - Unified task dashboard across all projects
- **Quick Status Updates** - Inline status changes without opening modals
- **Task Search** - Search tasks by title and description
- **Permission-Based Actions** - Role-based create, edit, and delete permissions
- **Real-time Updates** - Automatic refresh after task modifications
- **Task Details** - Comprehensive task information with project context
- **Responsive Design** - Mobile-friendly task management interface

#### API Endpoints

- `GET /api/tasks` - List tasks with filtering options
- `POST /api/tasks` - Create new tasks
- `GET /api/tasks/[id]` - Get individual task details
- `PUT /api/tasks/[id]` - Update task properties
- `DELETE /api/tasks/[id]` - Delete tasks (admin/owner only)

#### Pages

- `/projects/[id]` - Project-specific task management with Kanban board
- `/tasks` - Cross-project task dashboard with advanced filtering

### Future Task Enhancements

- Task Dependencies - Link related tasks with prerequisites
- Subtasks - Break down complex tasks into smaller parts
- Task Prioritization - High, medium, low priority levels
- Due Dates - Set deadlines for tasks and milestones
- Task Status - To Do, In Progress, Done, Blocked states
- Recurring Tasks - Automated task creation for repetitive work
- Task Labels - Categorize and filter tasks
- Task Comments - Discussion threads on specific tasks
- Task History - Track changes and updates

### Collaboration Features

- Real-Time Chat - Basic instant messaging within projects
- Team Discussions - Threaded conversations
- @Mentions - Tag team members in comments
- Comments & Replies - Task-specific discussions
- Emoji Reactions - Quick feedback on messages

### Time Tracking & Resource Management

- Manual Time Tracking - Log time spent on tasks
- Basic Timesheet - Simple time reports
- Workload View - Basic team capacity overview
- Progress Tracking - Visual progress indicators
- Burndown Charts - Track sprint/project progress

### Reporting & Analytics

- Project Dashboards - Basic project metrics display
- Progress Reports - Simple progress visualization
- Task Statistics - Basic task completion metrics
- Export Reports - CSV export for basic reports

### Notification & Alert System

- Task Assignments - Alert when assigned new tasks
- Due Date Reminders - Deadline approaching notifications
- Status Updates - Changes to task or project status
- Comment Notifications - New comments on tasks
- @Mention Alerts - When tagged in discussions
- In-App Notifications - Real-time alerts within application
- Email Notifications - Basic email alerts
- Notification Preferences - Simple notification settings

### Search & Filtering

- Basic Search - Search across projects and tasks
- Filter Options - Basic filtering by status, assignee, priority
- Date Range Filters - Time-based filtering
- Tag-Based Filtering - Filter by labels

### Basic Integrations

- Email Integration - Basic email notifications
- Calendar Sync - Simple calendar integration
- Data Export - Export projects in CSV/JSON format

## Backend Documentation

This section details the key directories and files that power the backend functionality of Prone.

### `/lib` - Core Libraries & Utilities

- **`auth.ts`** - Central configuration for NextAuth.js, including providers, callbacks, and session strategy.
- **`emailService.ts`** - Email sending service with OTP generation and HTML templates.
- **`prismaClient.ts`** - Database client configuration and connection.

### `/prisma` - Database Management

- **`schema.prisma`** - Database schema definition with models and relationships.
- **`seed.ts`** - Database seeding script for initial data.
- **`migrations/`** - Database migration files for schema versioning.

### `/src/app/api` - API Routes

#### Authentication APIs

- **`auth/[...nextauth]/route.ts`** - Core NextAuth.js handler for session management, sign-in, sign-out, etc.
- **`auth/signin/route.ts`** - Custom endpoint for pre-validating user credentials before handing off to NextAuth.js.
- **`auth/signup/route.ts`** - Handles new user registration and triggers email verification.
- **`auth/send-otp/route.ts`** - Manages OTP generation and sending for verification and password resets.
- **`auth/verify-otp/route.ts`** - Validates OTPs submitted by users.
- **`auth/reset-password/route.ts`** - Handles the password reset process after OTP verification.

#### User Management APIs

- **`user/profile/route.ts`** - API endpoint for managing user profile data (fetching, updating).
- **`user/profile/change-password/route.ts`** - Securely handles requests to change a user's password.

#### Project Management APIs

- **`projects/route.ts`** - CRUD operations for projects (create, read with filtering).
- **`projects/[id]/route.ts`** - Individual project operations (get, update, delete).
- **`project-categories/route.ts`** - Dynamic project categories with create functionality.

#### Task Management APIs

- **`tasks/route.ts`** - Task CRUD operations (create, list with filtering by project, status, assignee).
- **`tasks/[id]/route.ts`** - Individual task operations (get details, update, delete with permissions).

#### Development APIs

- **`dev/delete-user/route.ts`** - Development utility for deleting users, useful for testing.

### `/src/app/(auth)` - Authentication Pages (UI)

- **`signin/page.tsx`** - User login interface.
- **`signup/page.tsx`** - User registration form.
- **`verify-email/page.tsx`** - Interface for users to enter their OTP to verify their email.
- **`forgot-password/page.tsx`** - Page for users to request a password reset.

### `/src/app/dashboard` - Main Application Pages (UI)

- **`page.tsx`** - The main dashboard view with project statistics and navigation cards.
- **`profile/page.tsx`** - User profile page where users can view and edit their information.

### `/src/app/projects` - Project Management Pages (UI)

- **`page.tsx`** - Project listing page with search, filtering, and grid/list views.
- **`[id]/page.tsx`** - Individual project detail page with integrated task management, team members, and project settings.

### `/src/app/tasks` - Task Management Pages (UI)

- **`page.tsx`** - Cross-project task dashboard with comprehensive filtering, search, and status management.

### `/src/components` - Reusable Components

- **`Providers.tsx`** - Wraps the application with necessary context providers (e.g., NextAuth SessionProvider).
- **`Navigation.tsx`** - Main navigation component with responsive design and user menu.
- **`DevTools.tsx`** - Development utilities and debugging tools (should be removed in production).
- **`TaskManagement.tsx`** - Comprehensive task management component with Kanban board, filtering, and CRUD operations.

### Security Features

- Data Encryption - Basic data protection
- Secure File Storage - Protected file management
- Basic Audit Log - Track important system activities
- Data Backup - Simple backup functionality

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request or create a Issue.

## License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js 14 and modern web technologies
- Designed for real-world project management workflows
