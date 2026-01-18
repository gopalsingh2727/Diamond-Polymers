# Option Type Documentation

## What is an Option Type?

An **Option Type** defines a category of products, materials, or components with their specifications. It's a template that describes:

- What the item is (e.g., "Plastic Bag", "LDPE Material")
- What measurements/specifications it has (width, height, thickness)
- Whether to track inventory
- What units to use

---

## Why Do You Need Option Types?

| Purpose | Description |
|---------|-------------|
| **Standardization** | Define consistent specifications for all items |
| **Order Forms** | Auto-populate dimension fields in orders |
| **Calculations** | Enable formula-based calculations (weight, cost) |
| **Inventory** | Track stock levels by type |
| **Quality** | Ensure all items meet specified criteria |

---

## Option Type Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Product** | Finished goods you manufacture | Plastic Bag, Pouch, Film |
| **Material** | Raw materials used | LDPE, HDPE, PP Granules |
| **Printing** | Printing specifications | Flexo Print, Gravure |
| **Packaging** | Packaging materials | Carton Box, Pallet |

---

## Option Type Fields Explained

### Basic Information

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Option Type Name** | Yes | Unique name | "Plastic Bag" |
| **Category** | No | Classification | "Product" |
| **Description** | No | Details | "Standard plastic bags" |
| **Track Inventory** | No | Enable stock tracking | Yes/No |

### Inventory Configuration (if tracking enabled)

| Field | Description | Example |
|-------|-------------|---------|
| **Inventory Units** | Units to track | kg, pcs, meters |
| **Primary Unit** | Default unit | kg |

### Specification Template

| Field | Description | Example |
|-------|-------------|---------|
| **Dimension Name** | Measurement name | "Width" |
| **Data Type** | Type of value | Number, String |
| **Unit** | Measurement unit | cm, mm, kg |
| **Default Value** | Pre-filled value | "10" |
| **Visible** | Show to users | Yes/No |
| **Required** | Must be filled | Yes/No |
| **Allow Formula** | Can use formulas | Yes/No |

---

## How to Create an Option Type

### Step 1: Navigate to Create Option Type

```
Menu → Create → Option Type
```

**File Path:** `main27/src/componest/second/menu/create/CreateOptionType`

### Step 2: Enter Basic Information

1. Enter **Option Type Name** (required)
2. Select **Category** from dropdown
3. Add **Description** (optional)

### Step 3: Configure Inventory (Optional)

1. Check **Track Inventory** if needed
2. Select **Inventory Units** (can select multiple)
3. Choose **Primary Unit**
4. Click "Seed Default Units" for common units

### Step 4: Add Specifications

For each specification:

1. Click **Add Specification**
2. Enter **Dimension Name** (e.g., "Width")
3. Select **Data Type** (Number or String)
4. Select **Unit** (cm, mm, m, kg, g, %)
5. Set **Default Value** (optional)
6. Toggle **Visible/Hidden**
7. Mark as **Required** if needed
8. Enable **Allow Formula** for calculated fields

### Step 5: Save

Click **Save** to create the option type.

---

## Visual Guide

```
┌──────────────────────────────────────────────────────────────────┐
│                      CREATE OPTION TYPE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  BASIC INFORMATION                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Option Type Name *          │ Category                       │ │
│  │ [Plastic Bag____________]   │ [▼ Product_______________]    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Description                                                  │ │
│  │ [Standard plastic bags with various size options________]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ☑ Track Inventory                                               │
│                                                                   │
│  INVENTORY CONFIGURATION                                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Inventory Units:  ☑ kg  ☑ pcs  ☐ ltr  ☐ m                   │ │
│  │ Primary Unit:     [▼ kg_____]                                │ │
│  │                              [Seed Default Units]            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  SPECIFICATIONS TEMPLATE                                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ # │ Name     │ Type   │ Unit │ Default │ Visible │ Required │ │
│  ├───┼──────────┼────────┼──────┼─────────┼─────────┼──────────┤ │
│  │ 1 │ Width    │ Number │ cm   │ -       │ ✓       │ ✓        │ │
│  │ 2 │ Height   │ Number │ cm   │ -       │ ✓       │ ✓        │ │
│  │ 3 │ Thickness│ Number │ mic  │ 50      │ ✓       │ ☐        │ │
│  │ 4 │ GSM      │ Number │ gsm  │ -       │ ☐       │ ☐        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                       [+ Add Specification]      │
│                                                                   │
│                         ┌──────────┐  ┌──────────┐               │
│                         │  Import  │  │   Save   │               │
│                         └──────────┘  └──────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Examples

### Example 1: Plastic Bag (Product)

```
Option Type Name: Plastic Bag
Category: Product
Description: Standard plastic bags manufactured in various sizes
Track Inventory: Yes
Primary Unit: kg

Specifications:
1. Width      | Number | cm  | Required | Visible
2. Height     | Number | cm  | Required | Visible
3. Thickness  | Number | mic | Required | Visible
4. GSM        | Number | gsm | Optional | Visible
5. Gusset     | Number | cm  | Optional | Visible
```

### Example 2: LDPE Material (Material)

```
Option Type Name: LDPE Granules
Category: Material
Description: Low-density polyethylene raw material
Track Inventory: Yes
Primary Unit: kg

Specifications:
1. MFI (Melt Flow Index) | Number | g/10min | Required | Visible
2. Density              | Number | g/cm³   | Required | Visible
3. Grade                | String | -       | Required | Visible
```

### Example 3: Flexo Printing (Printing)

```
Option Type Name: Flexo Printing
Category: Printing
Description: Flexographic printing options

Specifications:
1. Print Length | Number | cm    | Required | Visible
2. Print Width  | Number | cm    | Required | Visible
3. Colors       | Number | count | Required | Visible
4. Plate Type   | String | -     | Optional | Visible
```

---

## Formula Support

Option Types can have formula-based specifications:

```
Example: Auto-calculate weight

Specifications:
1. Width     | Number | cm | Input
2. Height    | Number | cm | Input
3. Thickness | Number | mic | Input
4. Quantity  | Number | pcs | Input
5. Weight    | Formula | kg | = (Width * Height * Thickness * Quantity) / 1000000
```

---

## Bulk Import Option Types

### Template Format

| Column | Required | Description |
|--------|----------|-------------|
| optionTypeName | Yes | Unique name |
| category | No | Product/Material/Printing/Packaging |
| description | No | Details |
| trackInventory | No | TRUE/FALSE |
| primaryUnit | No | kg/pcs/ltr/m |
| spec1_name | No | First spec name |
| spec1_type | No | number/string |
| spec1_unit | No | Unit |
| ... | ... | Up to 10 specs |

**Maximum:** 100 option types per import

---

## Related Documentation

- [Order](./06-order.md) - Use option types in orders
- [Order Type](./07-order-type.md) - Configure which option types are allowed
- [Machine](./04-machine.md) - Process products defined by option types
