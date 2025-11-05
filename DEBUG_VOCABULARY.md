# Debug Vocabulary FE Issues

## Kiểm Tra Data Flow

### 1. Check Browser Console

Mở DevTools (F12) → Console tab, xem có lỗi gì không:

```javascript
// Check React Query data
window.queryClient?.getQueryData(['vocabulary', 'lists'])
window.queryClient?.getQueryData(['vocabulary', 'my-lists'])
```

### 2. Check Network Tab

DevTools → Network → XHR:

```
GET /private/v1/vocabulary/lists
Response: {
  "statusCode": 200,
  "message": "...",
  "data": {
    "data": [...], // ← Array of lists
    "total": 9,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 3. Temporary Debug Code

Thêm console.log vào VocabularyListsPage:

```typescript
// Line 18, sau useVocabularyLists()
const { data, isLoading } = useVocabularyLists(filters)

// Add này:
console.log('📊 Vocabulary Lists Data:', {
  isLoading,
  data,
  lists: data?.data,
  total: data?.total,
  myLists,
  stats
})
```

### 4. Check Data Structure

Response từ backend:
```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "id": "xxx",
        "title": "1000 Common English Words",
        "totalTerms": 992,
        "totalUnits": 20,
        "userCount": 0,
        "difficulty": "beginner",
        "isPublic": true,
        "isOfficial": false
      }
    ],
    "total": 9,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

FE parse:
```typescript
// vocabulary.api.ts line 26
return response.data.data // ← Returns { data: [...], total, page, ... }
```

Component access:
```typescript
// VocabularyListsPage.tsx
data?.data.map((list) => ...) // ← Correct
```

### 5. Possible Issues

**Issue 1: Empty data array**
```typescript
// Check:
console.log('Lists count:', data?.data?.length)

// If 0, backend might not have data yet
```

**Issue 2: Backend not running**
```bash
# Check backend logs
cd english-learning
npm run start:client-api:dev

# Should see: Listening on port 3334
```

**Issue 3: API endpoint mismatch**
```typescript
// Check .env
VITE_API_URL=http://localhost:3334/api

// Verify in browser:
http://localhost:3334/api/docs
```

**Issue 4: Auth token missing**
```typescript
// Check if user is logged in
localStorage.getItem('token')

// If null, login first at /login
```

### 6. Quick Test

Thử gọi API trực tiếp:

```bash
# Get lists
curl http://localhost:3334/api/private/v1/vocabulary/lists \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
{
  "statusCode": 200,
  "message": "...",
  "data": {
    "data": [...]
  }
}
```

### 7. Force Refresh

```typescript
// In component, force refetch:
const { data, isLoading, refetch } = useVocabularyLists(filters)

// Call refetch() on button click
<button onClick={() => refetch()}>Refresh</button>
```

---

## Common Fixes

### Fix 1: Data là undefined

```typescript
// Safe access with optional chaining
{data?.data?.map((list) => (
  <div key={list.id}>{list.title}</div>
)) || <p>No data</p>}
```

### Fix 2: Loading state stuck

```typescript
// Check if query is enabled
const { data, isLoading, error } = useVocabularyLists(filters)

console.log('Query state:', { isLoading, error, hasData: !!data })
```

### Fix 3: Empty array but backend has data

```typescript
// Check pagination
const [filters, setFilters] = useState<VocabularyListFilters>({
  page: 1,
  limit: 20, // ← Make sure this is set
})
```

---

## Quick Debug Checklist

- [ ] Backend đang chạy? (http://localhost:3334/api/docs)
- [ ] Database có data? (Prisma Studio: http://localhost:5556)
- [ ] User đã login? (Check localStorage token)
- [ ] API response có data? (Network tab)
- [ ] Console có lỗi? (F12 → Console)
- [ ] Component render đúng? (React DevTools)

---

## Test API Manually

```bash
# 1. Get lists (should return 9 lists)
curl http://localhost:3334/api/private/v1/vocabulary/lists \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# 2. Get specific list
curl http://localhost:3334/api/private/v1/vocabulary/lists/LIST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# 3. Get units
curl http://localhost:3334/api/private/v1/vocabulary/lists/LIST_ID/units \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

Nếu tất cả API calls đều trả về data → Problem is in FE rendering
Nếu API không trả về data → Problem is in BE



