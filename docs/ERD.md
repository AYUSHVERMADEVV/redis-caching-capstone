# Redis Caching System - ERD

![Database ERD](ERD.png)

## Entities

### Users
- id - Primary Key
- name
- email - Unique
- role
- created_at

### Cache Entries
- id - Primary Key
- cache_key - Unique
- cache_value
- expiration
- status
- created_by - Foreign Key
- created_at
- updated_at

### Cache Operations
- id - Primary Key
- cache_entry_id - Foreign Key
- user_id - Foreign Key
- operation_type
- created_at

### Audit Logs
- id - Primary Key
- user_id - Foreign Key
- action
- entity
- entity_id
- timestamp

## Relationships
- One User can create many Cache Entries.
- One User can perform many Cache Operations.
- One Cache Entry can have many Cache Operations.
- One User can have many Audit Logs.

## dbdiagram.io DBML

```text
Table users {
  id int [pk, increment]
  name varchar(100)
  email varchar(150) [unique]
  role varchar(50)
  created_at timestamp
}

Table cache_entries {
  id int [pk, increment]
  cache_key varchar(255) [unique]
  cache_value text
  expiration int
  status varchar(20)
  created_by int
  created_at timestamp
  updated_at timestamp
}

Table cache_operations {
  id int [pk, increment]
  cache_entry_id int
  user_id int
  operation_type varchar(20)
  created_at timestamp
}

Table audit_logs {
  id int [pk, increment]
  user_id int
  action varchar(100)
  entity varchar(100)
  entity_id int
  timestamp timestamp
}

Ref: users.id < cache_entries.created_by
Ref: users.id < cache_operations.user_id
Ref: cache_entries.id < cache_operations.cache_entry_id
Ref: users.id < audit_logs.user_id
```
