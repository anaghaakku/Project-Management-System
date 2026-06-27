# Project Management System

A full-stack project management application built with **Go (Gin)** backend and **Next.js** frontend.

---

## 🚀 Features

- ✅ JWT Authentication (Login/Register)
- ✅ User Management (Create, List)
- ✅ Project Management (CRUD)
- ✅ Task Management (CRUD)
- ✅ Task Filtering (by Project, Status, Assigned User)
- ✅ Admin Panel with role-based access
- ✅ Dashboard UI
- ✅ PostgreSQL Database
- ✅ Pagination
- ✅ DB Transactions
- ✅ Clean Architecture

---

## 🛠️ Tech Stack

### Backend
- Go (Golang) 1.21+
- Gin Framework
- PostgreSQL 16
- GORM
- JWT Authentication
- bcrypt Password Hashing

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Axios
- TypeScript

---

## 📊 Database Schema (ER Diagram)
┌─────────────────────┐ ┌─────────────────────┐
│ Users │ │ Projects │
├─────────────────────┤ ├─────────────────────┤
│ id (PK) │◄─────────│ id (PK) │
│ name │ │ name │
│ email (UNIQUE) │ │ description │
│ password │ │ status │
│ role │ │ created_by (FK) │──┐
│ created_at │ │ created_at │ │
│ updated_at │ │ updated_at │ │
│ deleted_at │ │ deleted_at │ │
└──────────┬──────────┘ └─────────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────┐ │
│ │ Tasks │ │
│ ├─────────────────────┤ │
└────────────────────│ id (PK) │ │
│ title │ │
│ description │ │
│ status │ │
│ project_id (FK) │───┘
│ assigned_to (FK) │───┘
│ due_date │
│ created_at │
│ updated_at │
│ deleted_at │
└─────────────────────┘

### Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| Users → Projects | One-to-Many | One user creates many projects |
| Users → Tasks | One-to-Many | One user assigned many tasks |
| Projects → Tasks | One-to-Many | One project has many tasks |

### Tables

#### Users
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| name | TEXT | User's full name |
| email | TEXT | Unique email |
| password | TEXT | Hashed password |
| role | TEXT | admin / developer |

#### Projects
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| name | TEXT | Project name |
| description | TEXT | Project description |
| status | TEXT | pending / in_progress / completed |
| created_by | BIGINT | Foreign Key → Users.id |

#### Tasks
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary Key |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | pending / in_progress / completed |
| project_id | BIGINT | Foreign Key → Projects.id |
| assigned_to | BIGINT | Foreign Key → Users.id |
| due_date | TIMESTAMP | Task due date |

---

## 🔧 Setup Instructions

### Prerequisites

| Software | Version |
|----------|---------|
| Go | 1.21+ |
| Node.js | 18+ |
| PostgreSQL | 16+ |

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
go mod tidy
go run cmd/main.go