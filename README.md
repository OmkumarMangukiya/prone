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

- **@hello-pangea/dnd** - Drag and drop functionality for Kanban board
- **react-hook-form** - Form management
- **react-query/TanStack Query** - Data fetching
- **recharts** or **Chart.js** - Data visualization
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
- User Roles - Admin, Member, Viewer roles
- Permission Management - Basic permission controls
- Project-Level Permissions - Role assignments per project


### Project Management

- Create New Project - Project setup with name, description, objectives
- Project Categories - Organize projects by type or department
- Kanban Boards - Drag-and-drop task management


### Task Management

- **Task CRUD Operations** - Create, read, update, and delete tasks with full validation
- **Task Assignment** - Assign tasks to project members with role-based permissions
- **Task Status Management** - Four-stage workflow: To Do, In Progress, In Review, Done
- **Task Priorities** - Four priority levels: Low, Medium, High, Urgent with color coding and emoji indicators
- **Due Date Management** - Set and track task deadlines with overdue indicators and visual warnings
- **Enhanced Kanban Board View** - Visual task management with drag-and-drop functionality between status columns
- **Drag & Drop Interface** - Seamless task status updates using @hello-pangea/dnd library
- **Task Filtering** - Filter by status, assignee, priority, and project with collapsible panel
- **Cross-Project Task View** - Unified task dashboard across all projects
- **Task Search** - Search tasks by title and description
- **Permission-Based Actions** - Role-based create, edit, and delete permissions
- **Real-time Updates** - Optimistic UI updates with automatic refresh after modifications
- **Enhanced Task Cards** - Comprehensive task information with drag handles, priority indicators
- **Loading States** - Skeleton loading animations for better perceived performance

#### API Endpoints

- `GET /api/tasks` - List tasks with filtering options
- `POST /api/tasks` - Create new tasks
- `GET /api/tasks/[id]` - Get individual task details
- `PUT /api/tasks/[id]` - Update task properties
- `DELETE /api/tasks/[id]` - Delete tasks (admin/owner only)

#### Pages

- `/projects/[id]` - Project-specific task management with Kanban board
- `/tasks` - Cross-project task dashboard with advanced filtering

### Collaboration Features

- Real-Time Chat - Basic instant messaging with users
- Comments & Replies - Task-specific discussions

### Reporting & Analytics

- Project Dashboards - Basic project metrics display
- Task Statistics - Basic task completion metrics


### Search & Filtering

- Basic Search - Search across projects and tasks
- Filter Options - Basic filtering by status, assignee, priority
- Tag-Based Filtering - Filter by labels

### Basic Integrations

- Email Integration - Basic email notifications

## Backend Documentation

This section details the key directories and files that power the backend functionality of Prone.

### `/lib` - Core Libraries & Utilities

- **`auth.ts`** - Central configuration for NextAuth.js, including providers, callbacks, and session strategy.
- **`emailService.ts`** - Email sending service with HTML templates.
- **`tokens.ts`** - JWT token generation and verification utilities.
- **`prismaClient.ts`** - Database client configuration and connection.

### `/prisma` - Database Management

- **`schema.prisma`** - Database schema definition with models and relationships.
- **`seed.ts`** - Database seeding script for initial data.
- **`migrations/`** - Database migration files for schema versioning.
- **`prisma.config.ts`** - Database connection configuration.

### `/src/app/api` - API Routes

#### Authentication APIs

- **`auth/[...nextauth]/route.ts`** - Core NextAuth.js handler for session management, sign-in, sign-out, etc.
- **`auth/signin/route.ts`** - Custom endpoint for pre-validating user credentials before handing off to NextAuth.js.
- **`auth/signup/route.ts`** - Handles new user registration and triggers email verification.
- **`auth/send-verification/route.ts`** - Manages sending verification emails and password reset links.
- **`auth/verify-token/route.ts`** - Validates JWT tokens for email verification.
- **`auth/reset-password/route.ts`** - Handles the password reset process with token verification.


### `/src/app/(auth)` - Authentication Pages (UI)

- **`signin/page.tsx`** - User login interface with email/password authentication.
- **`signup/page.tsx`** - User registration form with email verification flow.
- **`verify-email/page.tsx`** - Interface for users to enter their OTP/Token manually if needed.
- **`forgot-password/page.tsx`** - Page for users to request a password reset via email.
- **`reset-password/page.tsx`** - Page for resetting the password using a valid token.

### `/src/app/dashboard` - Main Application Pages (UI)

- **`page.tsx`** - The main dashboard view with project statistics and navigation cards.
- **`profile/page.tsx`** - User profile page where users can view and edit their information.

### `/src/app/projects` - Project Management Pages (UI)

- **`page.tsx`** - Project listing page with search, filtering, and grid/list views.
- **`[id]/page.tsx`** - Individual project detail page with integrated task management, and team members.

### `/src/app/tasks` - Task Management Pages (UI)

- **`page.tsx`** - Cross-project task dashboard with comprehensive filtering, search, and status management.

### `/src/components` - Reusable Components

- **`Providers.tsx`** - Wraps the application with necessary context providers (e.g., NextAuth SessionProvider).
- **`Navigation.tsx`** - Main navigation component with responsive design and user menu.
- **`TaskManagement.tsx`** - Displays the task board, filtering, and interactions.
- **`TaskCard.tsx`** - Individual task card component with drag-and-drop support and quick actions.
- **`TaskForm.tsx`** - Reusable form component for creating and editing tasks.
- **`ProjectForm.tsx`** - Reusable form component for creating and editing projects.
- **`TaskDetailsModal.tsx`** - Focused modal for viewing task details with comments.
- **`CreateTaskModal.tsx`** & **`EditTaskModal.tsx`** - Modals utilizing `TaskForm` for task lifecycle management.
- **`CreateProjectModal.tsx`** & **`EditProjectModal.tsx`** - Modals utilizing `ProjectForm` for project management.

### `/docs` - Documentation

- **`how-it-works/auth.md`** - Detailed documentation of the authentication system architecture and flows.
- **`how-it-works/crud_project.md`** - Project creation and management system documentation.
- **`how-it-works/task_management.md`** - Task management system architecture with Kanban board implementation details.
- **`how-it-works/dashboard_profile.md`** - Overview of the Dashboard and User Profile features.

### Configuration Files


- **`package.json`** - Project dependencies including @hello-pangea/dnd for drag-and-drop functionality.
- **`tsconfig.json`** - TypeScript configuration for type safety across the application.
- **`next.config.ts`** - Next.js configuration for build optimization and deployment settings.
- **`middleware.ts`** - Request middleware for authentication and route protection

### Security Features

- Data Encryption - Basic data protection

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request or create a Issue.

## License

This project is licensed under the Apache-2.0 License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js 14 and modern web technologies
- Designed for real-world project management workflows
