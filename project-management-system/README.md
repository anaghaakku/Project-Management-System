"# Project Management System" 
# Project Management System

A full-stack project management application built with **Go (Gin)** backend and **Next.js** frontend.

---

##  Architecture Explanation
┌─────────────────────────────────────────────────────────────┐
│ Frontend (Next.js) │
│ Login │ Dashboard │ Projects │ Tasks │ Admin Panel │
└─────────────────────────┬───────────────────────────────────┘
│ HTTP/HTTPS
▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Go + Gin) │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Handlers │ │ Middleware │ │ Routes │ │
│ │ (Auth, │ │ (Auth, │ │ (Public, │ │
│ │ Projects, │ │ CORS) │ │ Protected)│ │
│ │ Tasks) │ │ │ │ │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Models (GORM) │ │
│ │ User │ Project │ Task │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Database (PostgreSQL) │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Users │ │ Projects │ │ Tasks │ │
│ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────┘

### Architecture Layers:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 | User interface, dashboard, forms |
| **API Layer** | Gin Framework | REST API endpoints, routing |
| **Business Logic** | Handlers | CRUD operations, validation |
| **Data Layer** | GORM | Database ORM, migrations |
| **Database** | PostgreSQL | Data persistence |
| **Authentication** | JWT + bcrypt | Secure login, password hashing |

---

## ER Diagram
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

### Relationships:

| Relationship | Type | Description |
|--------------|------|-------------|
| **Users → Projects** | One-to-Many | One user creates many projects |
| **Users → Tasks** | One-to-Many | One user assigned many tasks |
| **Projects → Tasks** | One-to-Many | One project has many tasks |

---

##  Setup Steps

### Prerequisites

| Software | Version |
|----------|---------|
| Go | 1.21+ |
| Node.js | 18+ |
| PostgreSQL | 16+ |
| Git | Latest |

### Step 1: Clone the Repository

```bash
git clone https://github.com/anaghaakku/Project-Management-System.git
cd Project-Management-System