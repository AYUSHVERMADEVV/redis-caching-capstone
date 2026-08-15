# Redis Caching System - API Contracts

## Base URL

/api

---

## 1. Get Cache Entry

### Endpoint

GET /api/cache/:key

### Purpose

Retrieve a cache entry using its cache key.

### Request

GET /api/cache/property:123

### Successful Response

HTTP 200

{
  "key": "property:123",
  "value": "Property information",
  "status": "active",
  "expiration": 3600
}

### Error Response

HTTP 404

{
  "error": "Cache entry not found"
}

---

## 2. Create Cache Entry

### Endpoint

POST /api/cache

### Purpose

Create a new cache entry.

### Request Body

{
  "key": "property:123",
  "value": "Property information",
  "expiration": 3600,
  "created_by": 1
}

### Successful Response

HTTP 201

{
  "message": "Cache entry created",
  "id": 1
}

---

## 3. Update Cache Entry

### Endpoint

PUT /api/cache/:key

### Purpose

Update an existing cache entry.

### Request Body

{
  "value": "Updated property information",
  "expiration": 3600
}

### Successful Response

HTTP 200

{
  "message": "Cache entry updated"
}

---

## 4. Delete Cache Entry

### Endpoint

DELETE /api/cache/:key

### Purpose

Delete a cache entry.

### Successful Response

HTTP 200

{
  "message": "Cache entry deleted"
}

---

## 5. List Cache Entries

### Endpoint

GET /api/cache

### Purpose

Return a list of available cache entries.

### Successful Response

HTTP 200

{
  "data": [
    {
      "id": 1,
      "key": "property:123",
      "status": "active"
    }
  ]
}

### Empty Response

HTTP 200

{
  "data": [],
  "message": "No data found"
}

---

## 6. Health Check

### Endpoint

GET /api/health

### Purpose

Check whether the service is available.

### Successful Response

HTTP 200

{
  "status": "ok"
}