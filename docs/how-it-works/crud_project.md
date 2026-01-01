# Project Creation & Management

This document outlines the architecture and data flow for creating, viewing, updating, and deleting projects and their associated categories.

## Core Architecture

The project management system is built around a standard client-server model within the Next.js framework, consisting of three main parts:

1.  **Prisma Models:** The database schema defines the structure for `Project`, `ProjectMember`, and `Category`, establishing the relationships between them.
2.  **RESTful API Routes:** A set of API endpoints under `/src/app/api/` handles all CRUD (Create, Read, Update, Delete) operations for projects and categories. These routes are secured, ensuring only authenticated users can access or modify data.
3.  **React Frontend Components:** Client-side pages and components, located in `/src/app/projects/`, provide the user interface for interacting with the project data.

---

## Detailed Flows

### 1. Viewing All Projects

This flow describes how a user's projects are fetched and displayed.

```mermaid
sequenceDiagram
    participant User as User's Browser
    participant ProjectsPage as Projects Page UI
    participant ProjectsAPI as /api/projects
    participant DB as Database (Prisma)

    User->>ProjectsPage: Navigates to /projects
    ProjectsPage->>ProjectsAPI: GET /api/projects?status=...&category=...
    ProjectsAPI->>ProjectsAPI: Verify user session (NextAuth)
    ProjectsAPI->>DB: findMany({ where: { userId: session.user.id, ...filters } })
    DB-->>ProjectsAPI: Return list of projects with owner, members, tasks, category
    ProjectsAPI-->>ProjectsPage: Return { projects: [...] }
    ProjectsPage->>ProjectsPage: Render projects in grid or list view
```

**Steps:**

1.  **Navigation:** The user opens the `/projects` page.
2.  **Data Fetching:** The page component makes a `GET` request to `/api/projects`, including any active filters for status or category.
3.  **Authentication:** The API route verifies the user's session using NextAuth.js.
4.  **Database Query:** Prisma queries the database for all projects where the current user is either the owner or a member, applying the specified filters. It includes related data like the project owner, members, tasks, and category.
5.  **Response:** The API returns a JSON object containing the array of projects.
6.  **Rendering:** The frontend state is updated, and the projects are rendered on the screen.

### 2. Creating a New Project (with Dynamic Category Creation)

This flow shows how a new project is created, including the option to create a new category on the fly.

```mermaid
sequenceDiagram
    participant User as User's Browser
    participant CreateModal as Create Project Modal
    participant CategoryAPI as /api/project-categories
    participant ProjectsAPI as /api/projects
    participant DB as Database (Prisma)

    User->>CreateModal: Fills out project form (name, description, etc.)
    User->>CreateModal: Selects "Create New Category" from dropdown
    CreateModal->>CreateModal: Shows inline form for new category name and color

    User->>CreateModal: Enters new category details and clicks "Create"
    CreateModal->>CategoryAPI: POST /api/project-categories (name, color)
    CategoryAPI->>DB: create({ data: { name, color } })
    DB-->>CategoryAPI: Returns new category object
    CategoryAPI-->>CreateModal: Return { category: {...} }
    CreateModal->>CreateModal: Updates state, selects new category automatically

    User->>CreateModal: Clicks "Create Project"
    CreateModal->>ProjectsAPI: POST /api/projects (name, description, categoryId, ...)
    ProjectsAPI->>DB: create({ data: { ..., ownerId: session.user.id } })
    Note over ProjectsAPI, DB: Also creates a ProjectMember entry for the owner.
    DB-->>ProjectsAPI: Returns the complete new project object
    ProjectsAPI-->>CreateModal: Return { project: {...} }
    CreateModal-->>User: Closes modal, refreshes project list
```

**Steps:**

1.  **Open Modal:** The user clicks "New Project" to open the creation modal.
2.  **Dynamic Category:**
    - The user decides the existing categories are not suitable and selects the "+ Create New Category" option.
    - An inline form appears. The user provides a name and color for the new category.
    - A `POST` request is sent to `/api/project-categories`. The API validates the data, checks for duplicates, and creates the new category in the database.
    - The new category is returned and automatically selected in the main project form.
3.  **Project Submission:** The user submits the completed project form.
4.  **API Request:** A `POST` request is sent to `/api/projects` with all project details, including the `categoryId`.
5.  **Database Creation:** The API creates the new `Project` record, automatically assigning the current user as the `owner`. It also creates an associated `ProjectMember` record, giving the owner the `OWNER` role.
6.  **Success:** The API returns the newly created project object. The frontend closes the modal and refreshes the list of projects to include the new one.

### 3. Updating a Project

This flow outlines how a user with the appropriate permissions (Owner or Admin) can update a project's details.

```mermaid
sequenceDiagram
    participant User as User's Browser
    participant ProjectPage as Project Details Page
    participant EditModal as Edit Project Modal
    participant ProjectAPI as /api/projects/[id]
    participant DB as Database (Prisma)

    User->>ProjectPage: Clicks "Edit Project"
    ProjectPage->>EditModal: Opens modal with existing project data
    User->>EditModal: Modifies project details (e.g., name, status, color)
    EditModal->>ProjectAPI: PUT /api/projects/[id] (updated fields)
    ProjectAPI->>ProjectAPI: Verify user session and permissions (is Owner/Admin?)
    ProjectAPI->>DB: findFirst({ where: { id, userId, role: in [OWNER, ADMIN] } })
    ProjectAPI->>DB: update({ where: { id }, data: { ...updatedData } })
    DB-->>ProjectAPI: Returns the updated project object
    ProjectAPI-->>EditModal: Return { project: {...} }
    EditModal-->>User: Closes modal, updates project details on the page
```

**Steps:**

1.  **Initiate Edit:** On the project details page (`/projects/[id]`), a user with `OWNER` or `ADMIN` role clicks the "Edit" button.
2.  **Form Population:** The "Edit Project" modal opens, pre-filled with the current project's data.
3.  **Submission:** The user modifies the desired fields and submits the form.
4.  **API Request:** A `PUT` request is sent to `/api/projects/[id]` containing only the fields that were changed.
5.  **Permission Check:** The API first verifies that the logged-in user has the necessary permissions to edit the project.
6.  **Database Update:** If permissions are valid, Prisma updates the project record in the database with the new data.
7.  **Success:** The API returns the complete, updated project object. The frontend then closes the modal and updates the UI with the new information.

### 4. Deleting a Project

This flow describes how a project owner can permanently delete a project.

```mermaid
sequenceDiagram
    participant User as User's Browser
    participant ProjectPage as Project Details Page
    participant ConfirmationDialog as Confirmation Dialog
    participant ProjectAPI as /api/projects/[id]
    participant DB as Database (Prisma)

    User->>ProjectPage: Clicks "Delete Project"
    ProjectPage->>ConfirmationDialog: "Are you sure you want to delete this project?"
    User->>ConfirmationDialog: Confirms deletion
    ConfirmationDialog->>ProjectAPI: DELETE /api/projects/[id]
    ProjectAPI->>ProjectAPI: Verify user session and permissions (is Owner?)
    ProjectAPI->>DB: findFirst({ where: { id, ownerId: session.user.id } })
    ProjectAPI->>DB: delete({ where: { id } })
    Note over DB: Cascading delete removes related members, tasks, etc.
    DB-->>ProjectAPI: Confirms deletion
    ProjectAPI-->>User: Return { message: "Project deleted" }
    User->>User: Redirected to the main projects list page
```

**Steps:**

1.  **Initiate Deletion:** The project `OWNER` clicks the "Delete" button on the project details page.
2.  **Confirmation:** A dialog appears asking for confirmation to prevent accidental deletion.
3.  **API Request:** Upon confirmation, the frontend sends a `DELETE` request to `/api/projects/[id]`.
4.  **Ownership Verification:** The API route strictly checks if the logged-in user is the `owner` of the project. This is a critical security step.
5.  **Database Deletion:** If the user is the owner, Prisma deletes the project record. The `onDelete: Cascade` setting in the Prisma schema ensures that all related data (members, tasks, comments, etc.) is automatically deleted as well.
6.  **Success & Redirect:** The API returns a success message. The frontend then redirects the user back to the main projects list (`/projects`).

---

## Key Files and Their Roles

| File                                       | Role                                                                                                                                                                           |
| :----------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                     | Defines the `Project`, `ProjectMember`, and `Category` models and their relationships.                                                                                         |
| `prisma.config.ts`                         | Handles the database connection configuration and client instantiation.                                                                                                        |
| `/src/app/api/projects/route.ts`           | Handles `GET` requests to list all projects for a user and `POST` requests to create new projects. Includes logic for filtering.                                               |
| `/src/app/api/projects/[id]/route.ts`      | Handles `GET` (single project), `PUT` (update), and `DELETE` operations for a specific project identified by its ID.                                                           |
| `/src/app/api/project-categories/route.ts` | Handles `GET` requests to list all categories and `POST` requests to create new ones.                                                                                          |
| `/src/app/projects/page.tsx`               | The main frontend page for displaying the list of projects. It includes the UI for searching, filtering, toggling views (grid/list), and launching the "Create Project" modal. |
| `/src/app/projects/[id]/page.tsx`          | The detailed view for a single project. Displays project statistics, tasks, members, and provides options for editing or deleting the project.                                 |
| `/src/components/ProjectForm.tsx`        | Reusable form component for creating and editing projects. Handles validation and category management.                                                                         |
| `/src/components/CreateProjectModal.tsx`   | Wrapper modal that uses `ProjectForm` for creating new projects.                                                                               |
| `/src/components/EditProjectModal.tsx`     | Wrapper modal that uses `ProjectForm` for editing existing project details.                                                                                                                          |
| `docs/how-it-works/crud_project.md`        | This file. Provides a high-level overview and detailed documentation of the project management feature.                                                                        |
