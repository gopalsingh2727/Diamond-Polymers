# Order Documentation

## What is an Order?

An **Order** is a manufacturing or billing request from a customer. Orders contain:

- Customer information
- Product/material specifications
- Production workflow steps
- Printing requirements
- Status and priority tracking

---

## Why Do You Need Orders?

| Purpose | Description |
|---------|-------------|
| **Production Planning** | Schedule and track manufacturing |
| **Customer Fulfillment** | Record what customer wants |
| **Inventory Management** | Track material usage |
| **Quality Control** | Document specifications |
| **Billing** | Generate invoices |
| **Analytics** | Track sales and production metrics |

---

## Order Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Manufacturing** | Production orders | Make products |
| **Billing** | Invoice/quotation | Financial documents |

---

## Order Status Flow

```
┌──────────────────┐
│ Wait for Approval │
└────────┬─────────┘
         │
         ▼
    ┌─────────┐
    │ Pending │
    └────┬────┘
         │
         ▼
   ┌──────────┐
   │ Approved │
   └────┬─────┘
         │
         ▼
 ┌─────────────┐
 │ In Progress │
 └──────┬──────┘
         │
         ▼
  ┌───────────┐
  │ Completed │
  └─────┬─────┘
         │
         ▼
 ┌────────────┐
 │ Dispatched │
 └────────────┘

Side branches:
- Any status → Cancelled
- Any status → Issue
```

---

## Order Priority Levels

| Priority | Color | Description |
|----------|-------|-------------|
| **Urgent** | Red | Immediate attention required |
| **High** | Orange | Priority processing |
| **Normal** | Blue | Standard processing |
| **Low** | Gray | Can wait |

---

## Order Form Sections

### 1. Core Information (Always Visible)

| Field | Required | Description |
|-------|----------|-------------|
| **Order Type** | Yes | Select type (Manufacturing/Billing) |
| **Customer** | Yes | Who is ordering |
| **Status** | No | Current state |
| **Priority** | No | Processing priority |

### 2. Product Information (If enabled)

| Field | Description |
|-------|-------------|
| **Product Type** | Category of product |
| **Product Name** | Specific product |
| **Quantity** | How many units |
| **Product Specification** | Size/dimensions template |
| **Product Dimensions** | Actual measurements |

### 3. Material Information (If enabled)

| Field | Description |
|-------|-------------|
| **Material Type** | Category of material |
| **Material Specification** | Grade/quality |
| **Mixing** | Whether mixing is needed |
| **Material Properties** | MOL, Density |
| **Material Dimensions** | Measurements |

### 4. Printing Options (If enabled)

| Field | Description |
|-------|-------------|
| **Enable Printing** | Yes/No |
| **Print Length** | Length of print area |
| **Print Width** | Width of print area |
| **Print Type** | Flexo, Gravure, Digital, Offset |
| **Print Color** | Color details |
| **Print Image/Notes** | Design reference |

### 5. Manufacturing Steps (If enabled)

| Field | Description |
|-------|-------------|
| **Step Name** | Production step |
| **Notes** | Step-specific instructions |

---

## How to Create an Order

### Step 1: Navigate to Create Order

```
Menu → Create → Order
```

**File Path:** `main27/src/componest/second/menu/create/CreateOrder`

### Step 2: Select Order Type

1. Click **Order Type** dropdown
2. Select appropriate type
3. Form will reconfigure based on type settings

### Step 3: Select Customer

1. Click **Customer** dropdown
2. Search or scroll to find customer
3. Select customer

### Step 4: Fill Product Information

1. Select **Product Type**
2. Select **Product Name** (filtered by type)
3. Enter **Quantity**
4. Select **Product Specification** if needed
5. Fill **Product Dimensions**

### Step 5: Fill Material Information (If required)

1. Select **Material Type**
2. Select **Material Specification**
3. Choose **Mixing** option
4. Fill **Material Dimensions**

### Step 6: Configure Printing (If needed)

1. Enable **Printing** toggle
2. Enter print dimensions
3. Select **Print Type**
4. Add color and design notes

### Step 7: Add Manufacturing Steps

1. Select production **Steps**
2. Add **Notes** for each step

### Step 8: Set Status and Priority

1. Select **Status** (default: Pending)
2. Select **Priority** (default: Normal)

### Step 9: Save

Click **Save** or press **Ctrl+Enter** to create order.

---

## Visual Guide

```
┌──────────────────────────────────────────────────────────────────┐
│                        CREATE ORDER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CORE INFORMATION                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Order Type *                      │ Customer *               │ │
│  │ [▼ Manufacturing___________]      │ [▼ Search customer__]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Status                            │ Priority                 │ │
│  │ [▼ Pending_______________]        │ [▼ Normal__________]    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  PRODUCT INFORMATION                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Product Type              │ Product Name                     │ │
│  │ [▼ Plastic Bag_______]    │ [▼ LD Bag_______________]       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Quantity     │ Specification                                 │ │
│  │ [5000____]   │ [▼ Standard (3 dimensions)______]            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Product Dimensions:                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Width    │  │ Height   │  │ Thickness│                       │
│  │ [30] cm  │  │ [40] cm  │  │ [50] mic │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  MATERIAL INFORMATION                                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Material Type          │ Material Specification              │ │
│  │ [▼ LDPE____________]   │ [▼ Grade A (0.92 density)_____]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Mixing: ○ Yes  ● No                                             │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  PRINTING OPTIONS                                                 │
│  Enable Printing: ● Yes  ○ No                                    │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐                 │
│  │ Length   │  │ Width    │  │ Print Type     │                 │
│  │ [25] cm  │  │ [30] cm  │  │ [▼ Flexo____] │                 │
│  └──────────┘  └──────────┘  └────────────────┘                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Print Color: [2 Colors - Red and Blue___________________]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│                                           ┌──────────┐           │
│                                           │   Save   │           │
│                                           └──────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Tab** | Move to next field |
| **Shift+Tab** | Move to previous field |
| **Enter** | Select dropdown option |
| **Space** | Toggle Yes/No options |
| **Ctrl+Enter** | Save order |
| **Escape** | Close modal/go back |

---

## Examples

### Example 1: Basic Plastic Bag Order

```
Order Type: Manufacturing
Customer: ABC Plastics Ltd

Product:
- Type: Plastic Bag
- Name: LD Bag
- Quantity: 10,000 pcs
- Width: 30 cm
- Height: 40 cm
- Thickness: 50 microns

Material:
- Type: LDPE
- Specification: Grade A
- Mixing: No

Printing: No

Status: Pending
Priority: Normal
```

### Example 2: Printed Pouch with Mixing

```
Order Type: Manufacturing
Customer: Food Packaging Co.

Product:
- Type: Pouch
- Name: Stand-up Pouch
- Quantity: 5,000 pcs
- Width: 15 cm
- Height: 20 cm
- Gusset: 5 cm
- Thickness: 100 microns

Material:
- Type: Laminate
- Specification: PET/PE Laminate
- Mixing: Yes (80% primary, 20% recycled)

Printing:
- Enable: Yes
- Length: 18 cm
- Width: 13 cm
- Type: Gravure
- Colors: 4 Colors (CMYK)

Status: Approved
Priority: High
```

### Example 3: Urgent Order

```
Order Type: Manufacturing
Customer: Emergency Supplies Pvt Ltd

Product:
- Type: Film Roll
- Name: Stretch Film
- Quantity: 500 kg
- Width: 50 cm
- Thickness: 23 microns

Material:
- Type: LLDPE
- Specification: Premium Grade

Printing: No

Status: Approved
Priority: URGENT

Notes: Customer needs by tomorrow. Expedite production.
```

---

## Calculated Fields

Orders can have auto-calculated values:

```
Example: Weight Calculation

Inputs:
- Width: 30 cm
- Height: 40 cm
- Thickness: 50 microns
- Quantity: 10,000 pcs
- Material Density: 0.92 g/cm³

Calculated:
Weight = (30 × 40 × 0.005 × 10000 × 0.92) / 1000
Weight = 55.2 kg
```

---

## Best Practices

| Practice | Reason |
|----------|--------|
| **Select correct order type** | Determines available fields |
| **Fill all specifications** | Accurate production |
| **Set appropriate priority** | Proper scheduling |
| **Add notes** | Clear instructions |
| **Verify calculations** | Ensure accuracy |
| **Check customer details** | Correct delivery |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Order type fields not showing | Select order type first |
| Product not in dropdown | Create product in Option Types |
| Customer not found | Create customer in Accounts |
| Calculations wrong | Check specification formulas |
| Cannot save | Fill all required fields |

---

## Related Documentation

- [Customer](./01-customer.md) - Manage customer accounts
- [Order Type](./07-order-type.md) - Configure order form templates
- [Option Type](./05-option-type.md) - Define products and materials
- [Machine](./04-machine.md) - Production equipment
