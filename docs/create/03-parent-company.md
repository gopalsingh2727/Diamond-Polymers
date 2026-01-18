# Parent Company Documentation

## What is a Parent Company?

A **Parent Company** represents an umbrella organization or holding company that owns or controls multiple subsidiary companies. In 27 Manufacturing, Parent Companies help you:

- Group related customers together
- Track business relationships across company networks
- Generate consolidated reports
- Manage large business groups as single entities

---

## Why Do You Need Parent Companies?

### Real-World Example

```
TATA GROUP (Parent Company)
    │
    ├── Tata Steel Limited (Customer)
    │   └── Mumbai Office
    │   └── Jamshedpur Plant
    │
    ├── Tata Motors Limited (Customer)
    │   └── Pune Factory
    │   └── Sanand Plant
    │
    └── Tata Chemicals Ltd (Customer)
        └── Mithapur Works
```

Without Parent Companies, these appear as separate, unrelated customers. With Parent Companies, you can see the entire Tata Group relationship.

---

## Benefits of Using Parent Companies

| Benefit | Description |
|---------|-------------|
| **Consolidated View** | See all subsidiaries of a group together |
| **Better Reporting** | Generate group-level sales reports |
| **Relationship Management** | Understand the full business relationship |
| **Account Planning** | Plan strategies for entire groups |
| **Volume Analysis** | Track total volume from business groups |
| **Credit Management** | Consider group-level credit limits |

---

## Parent Company vs Customer Category

| Aspect | Parent Company | Customer Category |
|--------|----------------|-------------------|
| **Purpose** | Group by ownership | Group by characteristics |
| **Example** | "Tata Group" | "Premium" |
| **Relationship** | Organizational hierarchy | Business classification |
| **Use Case** | "All Tata companies" | "All premium customers" |

**You can use both together:**
- Tata Steel → Parent: "Tata Group" + Category: "Premium"
- Tata Motors → Parent: "Tata Group" + Category: "Corporate"

---

## Parent Company Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Company Name** | Yes | Name of parent organization | "Tata Group" |
| **Description** | No | Additional details | "Indian multinational conglomerate" |

---

## How to Create a Parent Company

### Step 1: Navigate to Create Parent Company

```
Menu → Create → Parent Company
```

**File Path:** `main27/src/componest/second/menu/create/customerParentCompany`

### Step 2: Enter Company Name

1. Enter the **Company Name** (required)
2. Use the official group/holding company name
3. Examples: "Tata Group", "Reliance Industries", "Adani Group"

### Step 3: Add Description (Optional)

1. Enter a **Description** with relevant details
2. Include information about the business group

### Step 4: Save

Click **Save** to create the parent company.

---

## Visual Guide

```
┌────────────────────────────────────────────────────────────┐
│                   CREATE PARENT COMPANY                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Company Name *                                        │  │
│  │ [Tata Group___________________________________]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Description                                           │  │
│  │ [Indian multinational conglomerate headquartered__]  │  │
│  │ [in Mumbai. One of India's largest business groups]  │  │
│  │ [with interests in steel, automotive, IT, etc.____]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                               ┌───────────┐                 │
│                               │   Save    │                 │
│                               └───────────┘                 │
└────────────────────────────────────────────────────────────┘

* = Required field (highlighted in Orange)
```

---

## Examples

### Example 1: Tata Group

```
Company Name: Tata Group
Description: Indian multinational conglomerate headquartered in Mumbai.
             Founded 1868 by Jamsetji Tata.
             Major subsidiaries: Tata Steel, Tata Motors, TCS, Tata Chemicals.
             Combined revenue: $100+ billion USD.
```

### Example 2: Reliance Industries

```
Company Name: Reliance Industries
Description: Indian multinational conglomerate.
             Founded by Dhirubhai Ambani.
             Sectors: Petrochemicals, refining, oil & gas, retail, telecom.
             Headquarters: Mumbai, Maharashtra.
```

### Example 3: Aditya Birla Group

```
Company Name: Aditya Birla Group
Description: Indian multinational conglomerate.
             Operations in 36 countries.
             Sectors: Metals, cement, textiles, carbon black, chemicals.
             Major companies: Hindalco, Grasim, UltraTech Cement.
```

### Example 4: Government of Maharashtra

```
Company Name: Government of Maharashtra
Description: State government departments and agencies.
             Public sector undertakings.
             Requires tender-based procurement process.
```

### Example 5: Local Business Group

```
Company Name: Patel Industries Group
Description: Local manufacturing group based in Ahmedabad.
             Family-owned business with 3 subsidiary companies.
             Operating since 1985.
```

---

## Linking Customers to Parent Companies

### When Creating a New Customer

1. Fill in customer details
2. Find the **Parent Company** dropdown
3. Select the appropriate parent company
4. Save the customer

### For Existing Customers

1. Go to **Edit → Accounts**
2. Click on the customer
3. Select **Parent Company** from dropdown
4. Save changes

---

## View Parent Company Structure

After linking customers, you can:

```
View by Parent Company:

TATA GROUP
├── Tata Steel Limited
│   ├── Orders: 45
│   ├── Revenue: ₹12,50,000
│   └── Category: Premium
│
├── Tata Motors Limited
│   ├── Orders: 32
│   ├── Revenue: ₹8,75,000
│   └── Category: Premium
│
└── Tata Chemicals Ltd
    ├── Orders: 18
    ├── Revenue: ₹4,20,000
    └── Category: Corporate

GROUP TOTAL
├── Total Customers: 3
├── Total Orders: 95
└── Total Revenue: ₹25,45,000
```

---

## Edit Parent Company

### Step 1: Navigate to Edit List

```
Menu → Edit → Parent Companies
```

### Step 2: Find Parent Company

- Scroll through the list
- Look for the company name

### Step 3: Click to Edit

Click on the parent company row to open edit form.

### Step 4: Make Changes

- Update the name or description
- Click **Save** to update

### Step 5: Delete (if needed)

- Click **Delete** button
- Confirm in the dialog
- **Warning:** Cannot delete if customers are linked

---

## Best Practices

| Practice | Reason |
|----------|--------|
| **Use official names** | "Tata Group" not "Tata" |
| **Be consistent** | Don't create duplicates with slight variations |
| **Add descriptions** | Future reference and team knowledge |
| **Create before customers** | Have parent companies ready when adding customers |
| **Review periodically** | Business groups change over time |

---

## Common Scenarios

### Scenario 1: Multi-location Customer

```
Problem: Same company has multiple factories
Solution:
- Create 1 Parent Company: "ABC Industries"
- Create customers for each location:
  - "ABC Industries - Mumbai Plant"
  - "ABC Industries - Delhi Plant"
  - "ABC Industries - Chennai Plant"
- Link all to Parent Company: "ABC Industries"
```

### Scenario 2: Merger/Acquisition

```
Problem: Company A acquires Company B
Solution:
- Create Parent Company: "Company A Holdings"
- Link both original Company A and Company B
- Now you see combined business
```

### Scenario 3: Independent Customer

```
Problem: Customer doesn't belong to any group
Solution:
- Leave Parent Company blank
- Or create "Independent Customers" parent company
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Company name already exists" | Each name must be unique per branch |
| Cannot delete parent company | Remove all linked customers first |
| Parent company not in dropdown | Refresh page or check if saved correctly |
| Duplicate parent companies | Merge by updating customer links, then delete duplicate |

---

## Related Documentation

- [Customer (Account)](./01-customer.md) - Create and manage customers
- [Customer Category](./02-customer-category.md) - Classify customers by type
- [Orders](./06-order.md) - Create orders for customers
