Roadmap: Expanded Access Request Tracking App

Overview

This application is a proof of concept (PoC) to help large pharmaceutical companies track expanded access requests. It is built using minimal technology to keep the implementation simple while ensuring core functionality.

Core Concepts

1. Programs

A Program represents a structured access initiative for a specific product and indication.

Each Program contains multiple Requests.

Users can view and manage Requests within a Program.

2. Requests

Requests are submitted by Physicians seeking drug access for their patients.

Requests are listed in a table within a Program.

Each Request has the following attributes:

Physician: The requesting physician.

Institution: The hospital/clinic where the physician operates.

ID: Unique identifier for the request.

Country: Location of the request.

Owner: Assigned internal stakeholder managing the request.

Phase: Current stage in the request process.

3. Phases

Each Request progresses through predefined Phases.

All Requests within a Program follow the same set of Phases, configured per program.

4. Milestones

Each Phase contains multiple Milestones that must be completed before advancing.

Milestones are configured per Program.

5. Tasks

Tasks can be added flexibly to each Milestone by the user.

Tasks have a title, a due date and an assignee.

Feature Implementation Plan

1. Data Structure & Storage

Use Supabase PostgreSQL as the backend database for structured storage.

Define simple JavaScript objects to manage local state on the front end.

2. UI Components

Program Dashboard: List all Programs.

Request Table: Display all Requests within a Program.

Request Details Page: Show attributes, current Phase, Milestones, and Tasks.

Milestone Tracker: Visualize progress within a Request.

Task Management: Allow dynamic Task addition and tracking.

3. Backend & API with Supabase

Use Supabase to handle all CRUD operations for Programs, Requests, Phases, Milestones, and Tasks.

Leverage Supabase's real-time capabilities to track request updates.

Avoid building a custom backend by using Supabase's built-in REST API.

4. Authentication & Authorization with Supabase

Use Supabase Auth for user authentication (email/password, OAuth, magic links).

Implement user roles and permissions using Supabase Row-Level Security (RLS).

Secure API endpoints based on user roles.

5. Configuration & Settings

Allow admins to configure Phases, Milestones, and default Tasks via a simple settings page.

Store configurations in Supabase tables to ensure consistency across all Requests.

6. Testing & Validation

Perform manual testing for core functionality.

Use Jest or simple unit tests for key components.

Ensure data integrity using Supabase constraints and validation rules.

7. Enhancements & Future Scope

Add basic email notifications for pending Tasks and Milestones.

Implement lightweight analytics using Supabase database queries.

Improve UI with minimal CSS (plain CSS or a simple framework like Tailwind).

Development Guidelines

Keep the front end as vanilla JavaScript as possible (avoid frameworks like Angular unless necessary).

Minimize dependencies to reduce complexity.

Leverage Supabase's backend capabilities to avoid building and maintaining a custom backend.

Follow modular design for easy expansion.

Document key functions and components clearly.

This roadmap serves as a reference for building a simple yet functional PoC while avoiding unnecessary complexity by leveraging Supabase for authentication and backend storage.

