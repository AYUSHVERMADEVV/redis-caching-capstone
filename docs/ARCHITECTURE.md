# Redis Caching System - Architecture

## 1. System Overview

The Redis Caching System is designed to provide a fast and reliable
interface for managing cached property listing data.

The system will use Redis as the primary caching layer and PostgreSQL
as the persistent database.

---

## 2. Architecture

```text
                    ┌────────────────────┐
                    │      Frontend      │
                    │   Web Interface    │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │      REST API      │
                    │   Backend Server   │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │    Redis Cache     │
                    │  Fast Data Access  │
                    └─────────┬──────────┘
                              │
                       Cache Miss
                              │
                              ▼
                    ┌────────────────────┐
                    │    PostgreSQL      │
                    │ Persistent Storage │
                    └────────────────────┘

3. Components

Frontend

Provides the user interface for floor staff and managers.

Responsibilities:

Display cache entries
Search cache data
Create cache entries
Update cache entries
Delete cache entries
Display loading states
Display empty states
Display validation errors
REST API

Acts as the communication layer between the frontend,
Redis and PostgreSQL.

Responsibilities:

Validate requests
Process cache operations
Handle errors
Communicate with Redis
Communicate with PostgreSQL
Record audit information
Redis

Redis will act as the fast caching layer.

Responsibilities:

Store frequently accessed data
Retrieve cached data quickly
Handle cache expiration
Reduce unnecessary database queries
PostgreSQL

PostgreSQL will be the persistent data store.

Tables:

users
cache_entries
cache_operations
audit_logs

4. Cache Flow
Cache Hit
User Request
     ↓
REST API
     ↓
Redis
     ↓
Data Found
     ↓
Return Data
Cache Miss
User Request
     ↓
REST API
     ↓
Redis
     ↓
Data Not Found
     ↓
PostgreSQL
     ↓
Return Data
     ↓
Store Data in Redis
     ↓
Return Response
5. Error Handling
Empty State

If no cache records are available:

No data found

The application must not display a blank screen.

Bad Connectivity

During asynchronous operations, display a visible loading indicator.

Example:

Loading...

If the request fails:

Unable to load data. Please try again.
Invalid Input

Invalid or missing input must prevent submission.

Example:

Cache key is required.
Cache value is required.

The invalid field should be visually highlighted.

Server Error

Unexpected server errors should display:

Something went wrong. Please try again.

The application should not crash.

6. Security

All user-provided text must be validated and sanitized before being
stored or rendered.

The system must protect against XSS injection.

Input validation should be performed on both the client and server
sides when the application is implemented.

. Accessibility

The application must target a 100% Lighthouse accessibility score.

Requirements:

All buttons must have accessible names.
All inputs must have labels.
Interactive elements must be keyboard accessible.
Focus states must be visible.
Semantic HTML should be used.
Form errors should be clearly communicated.
8. Telemetry

A simulated analytics event will be logged after a primary Redis
caching action is completed.

Example:

[Analytics] User interacted with Redis Caching

This is only a simulation for the current capstone planning stage.

9. Database

PostgreSQL database:

redis_caching_db

Tables:

users
cache_entries
cache_operations
audit_logs

The database schema is defined in:

database/schema.sql
10. API

The planned API contracts are documented in:

docs/API.md

Main endpoints:

GET    /api/cache/:key
GET    /api/cache
POST   /api/cache
PUT    /api/cache/:key
DELETE /api/cache/:key
GET    /api/health