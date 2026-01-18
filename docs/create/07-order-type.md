# Order Type Documentation

## What is an Order Type?

An **Order Type** is a template that defines how order forms work. It controls:

- Which form sections appear (products, materials, printing)
- Which fields are visible/required
- Order numbering format
- Default production steps
- Calculation formulas

---

## Why Do You Need Order Types?

| Purpose | Description |
|---------|-------------|
| **Form Customization** | Different products need different fields |
| **Standardization** | Ensure consistent data collection |
| **Workflow** | Auto-assign production steps |
| **Numbering** | Auto-generate order numbers |
| **Calculations** | Built-in formulas for weight, cost |
| **Flexibility** | Manufacturing vs. billing orders |

---

## Order Type Categories

| Category | Description | Use Case |
|----------|-------------|----------|
| **Manufacturing** | Production orders | Factory production |
| **Billing** | Financial documents | Invoices, quotations |

### Billing Types (for Billing category)

| Type | Description |
|------|-------------|
| Invoice | Final bill |
| Estimate | Price estimate |
| Quotation | Price quote |
| Challan | Delivery note |
| Credit Note | Return credit |
| Debit Note | Additional charge |

---

## Order Type Fields Explained

### Basic Information

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Type Name** | Yes | Display name | "Plastic Bag Order" |
| **Type Code** | Yes | Short unique code | "PBO" |
| **Description** | No | Details | "Orders for plastic bags" |
| **Category** | Yes | Manufacturing or Billing | Manufacturing |

### Numbering Configuration

| Field | Description | Example |
|-------|-------------|---------|
| **Number Prefix** | Order ID prefix | "ORD" |
| **Number Format** | ID template | "{PREFIX}-{SEQUENCE}" |
| **Sequence Padding** | Digit padding | 4 → "0001" |

Result: `ORD-0001`, `ORD-0002`, etc.

### Form Sections Configuration

| Section | Description |
|---------|-------------|
| **Product Information** | Product selection and dimensions |
| **Material Information** | Material specs and mixing |
| **Printing Options** | Print configuration |
| **Manufacturing Steps** | Production workflow |

### Dynamic Calculations

| Field | Description |
|-------|-------------|
| **Name** | Calculation name |
| **Formula** | Mathematical expression |
| **Unit** | Result unit |
| **Show in Order** | Display to user |

---

## How to Create an Order Type

### Step 1: Navigate to Create Order Type

```
Menu → Create → Order Type
```

**File Path:** `main27/src/componest/second/menu/create/CreateOrderType`

### Step 2: Enter Basic Information

1. Enter **Type Name** (e.g., "Plastic Bag Manufacturing")
2. Enter **Type Code** (e.g., "PBM")
3. Add **Description**
4. Select **Category** (Manufacturing or Billing)

### Step 3: Configure Numbering

1. Enter **Number Prefix** (e.g., "PBM")
2. Set **Number Format** (e.g., "{PREFIX}-{SEQUENCE}")
3. Set **Sequence Padding** (e.g., 4)

### Step 4: Configure Form Sections

Enable/disable sections:
- ☑ Product Information
- ☑ Material Information
- ☑ Printing Options
- ☑ Manufacturing Steps

### Step 5: Set Default Steps

1. Select production steps to auto-assign
2. Steps will be added to every order of this type

### Step 6: Add Calculations (Optional)

1. Click **Add Calculation**
2. Enter name (e.g., "Net Weight")
3. Enter formula (e.g., "Width * Height * Thickness * Quantity")
4. Select unit (e.g., "kg")

### Step 7: Save

Click **Save** to create order type.

---

## Visual Guide

```
┌──────────────────────────────────────────────────────────────────┐
│                     CREATE ORDER TYPE                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  BASIC INFORMATION                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Type Name *                    │ Type Code *                 │ │
│  │ [Plastic Bag Manufacturing__]  │ [PBM_____]                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Description                                                  │ │
│  │ [Manufacturing orders for all types of plastic bags_____]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Category *                     │ Billing Type               │ │
│  │ [▼ Manufacturing_________]     │ [N/A_______________]      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  NUMBERING CONFIGURATION                                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Number Prefix    │ Number Format         │ Padding          │ │
│  │ [PBM________]    │ [{PREFIX}-{SEQUENCE}] │ [4____]         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  Preview: PBM-0001                                                │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  FORM SECTIONS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ☑ Product Information                                        │ │
│  │ ☑ Material Information                                       │ │
│  │ ☑ Printing Options                                           │ │
│  │ ☑ Manufacturing Steps                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  DEFAULT STEPS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ [▼ Select Steps_______________________________________]     │ │
│  │                                                              │ │
│  │ Selected: Extrusion → Printing → Cutting → Packing          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  DYNAMIC CALCULATIONS                                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ # │ Name       │ Formula                      │ Unit        │ │
│  ├───┼────────────┼──────────────────────────────┼─────────────┤ │
│  │ 1 │ Net Weight │ Width*Height*Thick*Qty/1000  │ kg          │ │
│  │ 2 │ Material   │ NetWeight * 1.05             │ kg          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                        [+ Add Calculation]       │
│                                                                   │
│                                           ┌──────────┐           │
│                                           │   Save   │           │
│                                           └──────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Examples

### Example 1: Plastic Bag Manufacturing

```
Type Name: Plastic Bag Manufacturing
Type Code: PBM
Category: Manufacturing
Description: Production orders for plastic bags

Numbering:
- Prefix: PBM
- Format: {PREFIX}-{SEQUENCE}
- Padding: 4
- Result: PBM-0001

Sections Enabled:
- ☑ Product Information
- ☑ Material Information
- ☑ Printing Options
- ☑ Manufacturing Steps

Default Steps:
1. Extrusion
2. Printing (if enabled)
3. Cutting
4. Quality Check
5. Packing

Calculations:
1. Net Weight = Width * Height * Thickness * Quantity / 1000000 (kg)
2. Material Required = Net Weight * 1.05 (kg)
3. Production Time = Quantity / 1000 * 2 (hours)
```

### Example 2: Film Roll Production

```
Type Name: Film Roll Production
Type Code: FRP
Category: Manufacturing

Numbering:
- Prefix: FRP
- Format: {PREFIX}/{YEAR}/{SEQUENCE}
- Padding: 5
- Result: FRP/2024/00001

Sections Enabled:
- ☑ Product Information
- ☑ Material Information
- ☐ Printing Options (not needed)
- ☑ Manufacturing Steps

Default Steps:
1. Extrusion
2. Slitting
3. Rewinding
4. Quality Check
5. Packing
```

### Example 3: Sales Invoice (Billing)

```
Type Name: Sales Invoice
Type Code: INV
Category: Billing
Billing Type: Invoice

Numbering:
- Prefix: INV
- Format: {PREFIX}-{YEAR}-{SEQUENCE}
- Padding: 6
- Result: INV-2024-000001

Sections Enabled:
- ☑ Product Information
- ☐ Material Information
- ☐ Printing Options
- ☐ Manufacturing Steps

Calculations:
1. Subtotal = Sum of line items
2. GST = Subtotal * 0.18
3. Total = Subtotal + GST
```

### Example 4: Quotation

```
Type Name: Price Quotation
Type Code: QUO
Category: Billing
Billing Type: Quotation

Numbering:
- Prefix: QUO
- Format: {PREFIX}-{SEQUENCE}
- Padding: 4
- Result: QUO-0001

Validity: 30 days
```

---

## Calculation Formulas

### Available Variables

| Variable | Description |
|----------|-------------|
| Width | Product width |
| Height | Product height |
| Thickness | Product thickness |
| Quantity | Order quantity |
| Density | Material density |
| PrintLength | Print length |
| PrintWidth | Print width |

### Example Formulas

```
// Weight calculation
NetWeight = Width * Height * Thickness * Quantity * Density / 1000000

// Material with wastage
MaterialRequired = NetWeight * 1.05

// Print area
PrintArea = PrintLength * PrintWidth

// Production hours
ProductionTime = Quantity / MachineCapacity

// Cost calculation
ProductionCost = MaterialRequired * MaterialRate + PrintArea * PrintRate
```

---

## Best Practices

| Practice | Reason |
|----------|--------|
| **Use meaningful codes** | Easy identification |
| **Keep prefixes short** | Clean order numbers |
| **Enable only needed sections** | Simpler forms |
| **Set default steps** | Consistent workflow |
| **Test calculations** | Ensure accuracy |
| **Document formulas** | Future reference |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Type code already exists | Each code must be unique |
| Calculations not working | Check formula syntax |
| Sections not showing | Ensure enabled in type |
| Steps not assigning | Verify default steps |
| Numbers not incrementing | Check sequence configuration |

---

## Related Documentation

- [Order](./06-order.md) - Create orders using order types
- [Option Type](./05-option-type.md) - Define products for orders
- [Machine](./04-machine.md) - Production equipment
- [Customer](./01-customer.md) - Order customers
