# Customer Category Documentation

## What is a Customer Category?

A **Customer Category** is a classification label that groups customers based on shared characteristics. It helps organize your customer base for:

- Better management
- Targeted pricing
- Reporting and analytics
- Service level differentiation

---

## Why Do You Need Customer Categories?

| Purpose | Description | Example |
|---------|-------------|---------|
| **Classification** | Group similar customers together | All large buyers → "Premium" |
| **Pricing Strategy** | Different rates for different categories | Premium gets 10% discount |
| **Priority Handling** | Prioritize orders based on category | Premium orders processed first |
| **Reporting** | Analyze sales by customer type | "65% revenue from Premium customers" |
| **Service Levels** | Different SLAs for different categories | Premium gets 24-hour delivery |

---

## Common Category Examples

| Category Name | Description | Typical Characteristics |
|---------------|-------------|------------------------|
| **Premium** | High-value customers | High order volume, long relationship |
| **Corporate** | Large businesses | Multiple branches, bulk orders |
| **Non-Premium** | Standard customers | Regular pricing, standard service |
| **MSME** | Small businesses | Growing accounts, price-sensitive |
| **Export** | International customers | Foreign currency, shipping logistics |
| **Government** | Government agencies | Tender-based, strict compliance |
| **New** | Recently added | Trial period, potential growth |
| **VIP** | Special treatment | Executive relationship |

---

## Category Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Category Name** | Yes | Unique identifier | "Premium" |
| **Description** | No | Detailed explanation | "High-volume customers with priority service" |

---

## How to Create a Customer Category

### Step 1: Navigate to Create Category

```
Menu → Create → Customer Category
```

**File Path:** `main27/src/componest/second/menu/create/customerCategory`

### Step 2: Enter Category Name

1. Enter a unique **Category Name** (required)
2. Keep it short and descriptive
3. Examples: "Premium", "Corporate", "Export"

### Step 3: Add Description (Optional)

1. Enter a **Description** explaining the category
2. This helps other users understand the criteria

### Step 4: Save

Click **Save** to create the category.

---

## Visual Guide

```
┌────────────────────────────────────────────────────────────┐
│                 CREATE CUSTOMER CATEGORY                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Category Name *                                       │  │
│  │ [Premium___________________________________]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Description                                           │  │
│  │ [High-value customers who place large orders______]  │  │
│  │ [regularly. Eligible for priority processing and___]  │  │
│  │ [special discounts.________________________________]  │  │
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

### Example 1: Premium Category

```
Category Name: Premium
Description: High-value customers with annual order value above ₹50 lakhs.
             Eligible for 10% discount and priority order processing.
             Direct account manager assigned.
```

### Example 2: Corporate Category

```
Category Name: Corporate
Description: Large businesses and corporations with multiple branches.
             Central billing possible. Volume-based pricing applicable.
             Dedicated support line available.
```

### Example 3: MSME Category

```
Category Name: MSME
Description: Micro, Small and Medium Enterprises.
             Flexible payment terms. Growth incentive program eligible.
             Minimum order quantity relaxed.
```

### Example 4: Export Category

```
Category Name: Export
Description: International customers.
             Foreign currency billing (USD/EUR).
             Export documentation provided.
             Customs clearance assistance available.
```

### Example 5: New Customer Category

```
Category Name: New
Description: Recently onboarded customers (less than 3 months).
             Under evaluation for permanent category assignment.
             Standard pricing applied.
```

---

## Edit Customer Category

### Step 1: Navigate to Edit List

```
Menu → Edit → Customer Categories
```

### Step 2: Find Category

- Scroll through the list
- Look for the category name

### Step 3: Click to Edit

Click on the category row to open edit form.

### Step 4: Make Changes

- Update the name or description
- Click **Save** to update

### Step 5: Delete (if needed)

- Click **Delete** button
- Confirm in the dialog
- **Warning:** Cannot delete if customers are assigned to this category

---

## How to Use Categories

### Assigning Categories to Customers

When creating or editing a customer:

1. Find the **Customer Category** dropdown
2. Select the appropriate category
3. Save the customer

### Filtering by Category

In customer lists, you can:
- Filter to show only specific categories
- Sort by category
- Group reports by category

---

## Best Practices

| Practice | Reason |
|----------|--------|
| **Use clear names** | "Premium" is better than "Cat1" |
| **Add descriptions** | Helps team understand criteria |
| **Limit categories** | 5-10 categories is usually enough |
| **Review regularly** | Update categories as business grows |
| **Document criteria** | Write down what qualifies for each category |

---

## Category Hierarchy

Customer Categories work alongside Parent Companies:

```
Parent Company (Tata Group)
├── Category: Premium
│   ├── Tata Steel Limited
│   └── Tata Motors Limited
│
└── Category: Corporate
    ├── Tata Chemicals Ltd
    └── Tata Consultancy Services
```

This allows you to:
- See all "Tata Group" companies together
- Also see all "Premium" customers across all parent companies

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Category name already exists" | Each name must be unique per branch |
| Cannot delete category | Remove all customers from category first |
| Category not showing in dropdown | Refresh the page or check if saved correctly |

---

## Related Documentation

- [Customer (Account)](./01-customer.md) - Create and manage customers
- [Parent Company](./03-parent-company.md) - Group customers under organizations
- [Orders](./06-order.md) - Create orders for categorized customers
