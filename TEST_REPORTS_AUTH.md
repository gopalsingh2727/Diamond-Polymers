# Test Reports & Auth Connection

## To test if reports can access auth, open browser console and run:

```javascript
// 1. Check if you're logged in
console.log("Auth Token:", localStorage.getItem("authToken"));
console.log("User Data:", JSON.parse(localStorage.getItem("userData")));
console.log("Selected Branch:", localStorage.getItem("selectedBranch"));

// 2. Check Redux store state
window.__REDUX_DEVTOOLS_EXTENSION__ && console.log("Redux State:", store.getState());

// 3. Manually test if auth token works with API
fetch('http://localhost:3000/dev/reports/overview', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem("authToken"),
    'x-api-key': '27infinity.in_5f84c89315f74a2db149c06a93cf4820',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log("API Response:", d))
.catch(e => console.error("API Error:", e));
```

## Common Issues & Fixes

### Issue 1: "state.reports.overview is undefined"
**Cause:** Reports reducer not added to main store
**Fix:** Check src/componest/redux/rootReducer.tsx has `reports: reportReducer`

### Issue 2: "Cannot read property 'orders' of undefined"
**Cause:** Component accessing wrong state path
**Fix:** Change from `state.reports.orders` to `state.reports.orders.orders`

### Issue 3: "Invalid token" error
**Cause:** Not logged in or token expired
**Fix:** Login first, then navigate to reports

### Issue 4: "Branch ID missing"
**Cause:** No branch selected
**Fix:** Select a branch or view "all branches"

## Quick Debug Script

Paste this in browser console to see full diagnostic:

```javascript
const store = window.store || (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.store);

console.log("=== REPORTS DEBUG ===");
console.log("1. Auth State:", store?.getState()?.auth);
console.log("2. Reports State:", store?.getState()?.reports);
console.log("3. Token in localStorage:", localStorage.getItem("authToken"));
console.log("4. Branch in localStorage:", localStorage.getItem("selectedBranch"));
console.log("5. Full State Keys:", Object.keys(store?.getState() || {}));
console.log("===================");
```
