# 📱 VIEW TEMPLATE SYSTEM - Complete Guide

**Complete documentation for configuring operator production entry views**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [What is a View Template?](#what-is-a-view-template)
3. [How View Templates Work](#how-view-templates-work)
4. [Complete Workflow](#complete-workflow)
5. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
6. [Understanding Machine Configuration](#understanding-machine-configuration)
7. [Order Type Integration](#order-type-integration)
8. [Option Type Linking](#option-type-linking)
9. [Specification Display Configuration](#specification-display-configuration)
10. [Table Column Configuration](#table-column-configuration)
11. [Formula System](#formula-system)
12. [20+ Industry Examples](#industry-examples)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The **View Template System** creates customized production entry interfaces for machine operators. Each template defines what information operators see and enter when recording production data on their assigned machines.

### Key Features
- ✅ Machine-specific operator views
- ✅ Order type customization
- ✅ Dynamic specification display
- ✅ Customizable data entry tables
- ✅ Auto-calculated columns with formulas
- ✅ Real-time production tracking
- ✅ Mobile-optimized operator interface

---

## 📝 What is a View Template?

A **View Template** is a configuration that defines:

1. **Which Machine** - Specific machine where this view is used
2. **Which Order Type** - What type of orders this view handles
3. **Display Items** - Product specifications shown at the top
4. **Table Columns** - Data entry fields for production records
5. **Formulas** - Auto-calculations based on entered data
6. **Settings** - Operator requirements, time tracking, media uploads

### Real-World Analogy
Think of a View Template like a **customized production form** that changes based on:
- The machine being operated (Printing Press vs. Cutting Machine)
- The product being made (Bags vs. Rolls vs. Sheets)
- The information needed (Weight, Count, Quality, etc.)

---

## 🔄 How View Templates Work

```
┌─────────────────────────────────────────────────────────────────┐
│                     VIEW TEMPLATE SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: MACHINE SELECTION                                        │
├─────────────────────────────────────────────────────────────────┤
│ • Select Machine Type (Extrusion, Printing, Cutting, etc.)      │
│ • Select Specific Machine (Machine-001, Machine-002, etc.)      │
│                                                                  │
│ WHY: Different machines need different data entry interfaces    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: ORDER TYPE & OPTION TYPES                               │
├─────────────────────────────────────────────────────────────────┤
│ • Select Order Type (Manufacturing Order, Job Work, etc.)       │
│ • Automatically shows allowed option types from order type      │
│ • Select which option types to display in this view             │
│                                                                  │
│ WHY: Links view to specific product types and order workflows   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: SPECIFICATION DISPLAY ITEMS                              │
├─────────────────────────────────────────────────────────────────┤
│ • Select which specifications to show at top of operator view   │
│ • Choose specific fields from each specification               │
│ • Configure display format (text, number, image, etc.)          │
│                                                                  │
│ WHY: Operators see product details they need at a glance        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: TABLE COLUMNS CONFIGURATION                             │
├─────────────────────────────────────────────────────────────────┤
│ • Define data entry columns (Gross Weight, Core Weight, etc.)   │
│ • Set column types (text, number, formula, dropdown, etc.)      │
│ • Configure formulas for auto-calculations                      │
│ • Set required fields and validation rules                      │
│                                                                  │
│ WHY: Creates the actual production data entry table             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: SAVE & DEPLOY                                           │
├─────────────────────────────────────────────────────────────────┤
│ • Review complete template configuration                        │
│ • Preview operator view                                          │
│ • Save template for immediate use                               │
│                                                                  │
│ WHY: Makes template available to operators on assigned machine  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              OPERATOR SEES THIS VIEW ON MACHINE                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete Workflow

### From Order to Production Entry

```
ORDER CREATED
     │
     ▼
┌──────────────────────────────────┐
│ Order Details:                   │
│ • Customer: ABC Industries       │
│ • Order Type: Manufacturing      │
│ • Product: LDPE Shopping Bags    │
│ • Quantity: 10,000 pieces        │
└──────────────────────────────────┘
     │
     ▼
ORDER ASSIGNED TO MACHINE
     │
     ▼
┌──────────────────────────────────┐
│ Machine: Extrusion Machine-001   │
│ Operator: John Smith             │
│ Start Time: 8:00 AM              │
└──────────────────────────────────┘
     │
     ▼
VIEW TEMPLATE LOADS
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│ OPERATOR SEES:                                               │
├──────────────────────────────────────────────────────────────┤
│ 📦 PRODUCT SPECIFICATIONS (Display Items from Step 3)       │
│ • Product: LDPE Shopping Bags                                │
│ • Width: 300 mm                                              │
│ • Length: 450 mm                                             │
│ • Gauge: 40 microns                                          │
│ • Material: LDPE Granules (Natural)                          │
├──────────────────────────────────────────────────────────────┤
│ 📝 PRODUCTION ENTRY TABLE (Columns from Step 4)             │
│ ┌──────┬──────────┬──────────┬──────────┬────────┐         │
│ │ S.No │ Gross Wt │ Core Wt  │ Net Wt   │ Grade  │         │
│ ├──────┼──────────┼──────────┼──────────┼────────┤         │
│ │  1   │ [ENTRY]  │ [ENTRY]  │ [AUTO]   │ [DROP] │         │
│ │  2   │ [ENTRY]  │ [ENTRY]  │ [AUTO]   │ [DROP] │         │
│ └──────┴──────────┴──────────┴──────────┴────────┘         │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
OPERATOR ENTERS DATA
     │
     ▼
DATA SAVED TO ORDER
     │
     ▼
PRODUCTION TRACKING UPDATED
```

---

## 📚 Step-by-Step Setup Guide

### Part 1: Create Machine and Machine Type

Before creating view templates, you need machines configured.

**Step 1.1: Create Machine Type**
1. Navigate to: **Create → Machine → Create Machine Type**
2. Enter details:
   - **Name**: "Extrusion Machine"
   - **Code**: "EXT"
   - **Description**: "LDPE/LLDPE film extrusion machines"

**Step 1.2: Create Specific Machine**
1. Navigate to: **Create → Machine → Create Machine**
2. Enter details:
   - **Machine Type**: Select "Extrusion Machine"
   - **Machine Name**: "Extrusion-001"
   - **Machine Code**: "EXT-001"
   - **Location**: "Production Floor A"

---

### Part 2: Configure Option System

**Step 2.1: Create Option Specifications**

Example: LDPE Film Specification
1. Navigate to: **Create → Options System → Create Option Specification**
2. Configure:
   - **Name**: "LDPE Film"
   - **Code**: "LDPE-FILM"
   - **Specifications**:
     - Width (mm)
     - Length (mm)
     - Gauge (microns)
     - Color
     - Material Type

**Step 2.2: Create Option Type**
1. Navigate to: **Create → Options System → Create Option Type**
2. Configure:
   - **Name**: "Finished Products"
   - **Code**: "FP"
   - **Link Option Specification**: "LDPE Film"

**Step 2.3: Create Option**
1. Navigate to: **Create → Options System → Create Option**
2. Configure:
   - **Option Type**: "Finished Products"
   - **Name**: "LDPE Shopping Bag - 12x18"
   - **Specifications**:
     - Width: 300 mm
     - Length: 450 mm
     - Gauge: 40 microns
     - Color: Natural
     - Material Type: LDPE

---

### Part 3: Create Order Type

**Step 3.1: Configure Order Type**
1. Navigate to: **Create → Order Type**
2. Configure:
   - **Name**: "Manufacturing Order"
   - **Code**: "MFG"
   - **Category**: MANUFACTURING
   - **Inventory Mode**: DEBIT
   - **Allowed Option Types**: Select "Finished Products"

---

### Part 4: Create View Template

**Step 4.1: Start View Template Creation**
1. Navigate to: **Create → Machine → Create View Template**
2. You'll see a 5-step wizard

**Step 4.2: Complete Step 1 - Select Machine**
- **Machine Type**: Select "Extrusion Machine"
- **Specific Machine**: Select "Extrusion-001"
- Click **Next**

**Step 4.3: Complete Step 2 - Select Order Type**
- **Order Type**: Select "Manufacturing Order"
- **Available Option Types**: You'll see "Finished Products" (from allowed option types)
- **Select**: Check "Finished Products"
- Click **Next**

**Step 4.4: Complete Step 3 - Specification Display Items**

This step configures what product information operators see at the top.

1. Click **"+ Add Display Item"**
2. For each display item, configure:

**Display Item 1: Product Name**
   - **Label**: "Product"
   - **Display Type**: Text
   - **Source Type**: optionSpec
   - **Option Type**: "Finished Products"
   - **Select OptionSpec**: Select the specific product spec
   - **Field**: "name"

**Display Item 2: Product Width**
   - **Label**: "Width"
   - **Display Type**: Number
   - **Source Type**: optionSpec
   - **Option Type**: "Finished Products"
   - **Field**: "width"
   - **Unit**: "mm"

**Display Item 3: Product Length**
   - **Label**: "Length"
   - **Display Type**: Number
   - **Source Type**: optionSpec
   - **Option Type**: "Finished Products"
   - **Field**: "length"
   - **Unit**: "mm"

**Display Item 4: Gauge**
   - **Label**: "Gauge"
   - **Display Type**: Number
   - **Source Type**: optionSpec
   - **Option Type**: "Finished Products"
   - **Field**: "gauge"
   - **Unit**: "microns"

**Step 4.5: Complete Step 4 - Configure Table Columns**

This step creates the production data entry table.

**Column 1: Serial Number**
- **Name**: "serialNo"
- **Label**: "S.No"
- **Data Type**: Number
- **Is Read Only**: Yes
- **Source Type**: Calculated (auto-increments)

**Column 2: Gross Weight**
- **Name**: "grossWt"
- **Label**: "Gross Weight"
- **Data Type**: Number
- **Unit**: "kg"
- **Is Required**: Yes
- **Source Type**: Manual

**Column 3: Core Weight**
- **Name**: "coreWt"
- **Label**: "Core Weight"
- **Data Type**: Number
- **Unit**: "kg"
- **Is Required**: Yes
- **Source Type**: Manual

**Column 4: Net Weight (Auto-calculated)**
- **Name**: "netWt"
- **Label**: "Net Weight"
- **Data Type**: Formula
- **Unit**: "kg"
- **Is Read Only**: Yes
- **Formula Type**: CUSTOM
- **Formula Expression**: `grossWt - coreWt`
- **Source Type**: Calculated

**Column 5: Quality Grade**
- **Name**: "grade"
- **Label**: "Quality Grade"
- **Data Type**: Dropdown
- **Dropdown Options**:
  - A Grade
  - B Grade
  - Rejected
- **Is Required**: Yes

**Column 6: Remarks**
- **Name**: "remarks"
- **Label**: "Remarks"
- **Data Type**: Text

**Step 4.6: Complete Step 5 - Save Template**
- **Template Name**: "Extrusion Production Entry"
- **Description**: "Standard extrusion machine production tracking for LDPE bags"
- Click **Save Template**

---

## 🏭 Understanding Machine Configuration

### Machine Type vs. Specific Machine

```
MACHINE TYPE (Category)
     │
     ├── Extrusion Machines
     ├── Printing Machines
     ├── Cutting Machines
     └── Bag Making Machines

SPECIFIC MACHINE (Individual Units)
     │
     ├── Extrusion-001
     ├── Extrusion-002
     ├── Printing-001
     └── Cutting-001
```

### Why Machine Type Matters
- Different machine types have different capabilities
- Template is locked to specific machine (one order type per machine)
- Prevents operator confusion

### Machine Selection Rules
1. **One View Template per Order Type per Machine**
   - Extrusion-001 can have ONE template for "Manufacturing Order"
   - Extrusion-001 can have DIFFERENT template for "Job Work Order"

2. **Same Machine Type ≠ Same Template**
   - Extrusion-001 and Extrusion-002 have separate templates
   - Allows machine-specific customization

---

## 📦 Order Type Integration

### How Order Types Control View Templates

**Order Type Configuration:**
```
Order Type: "Manufacturing Order"
  ├── Allowed Option Types: ["Finished Products", "Raw Materials"]
  ├── Inventory Mode: DEBIT
  └── Form Sections: [Product Info, Material Info, Manufacturing]
```

**View Template sees only Allowed Option Types:**
```
Step 2 of View Template
  ├── Order Type: "Manufacturing Order" (selected)
  └── Available Option Types:
       ├── ✓ Finished Products (from allowed option types)
       └── ✓ Raw Materials (from allowed option types)
```

### Order Type Linking Benefits
1. **Automatic Filtering**: Only relevant option types shown
2. **Data Consistency**: Templates match order structure
3. **Inventory Integration**: Production entries update inventory correctly

---

## 🎯 Option Type Linking

### Understanding Option Types in View Templates

**Option Type Hierarchy:**
```
OPTION SPECIFICATION
  └── Defines structure (fields/specs available)
       │
       ▼
OPTION TYPE
  └── Links to Option Specification
       │
       ▼
OPTIONS (Actual Products)
  └── Instances with specific values
       │
       ▼
VIEW TEMPLATE
  └── Displays option data in operator interface
```

### Example: LDPE Bags

**1. Option Specification: "LDPE Film"**
```json
{
  "name": "LDPE Film",
  "specifications": [
    { "name": "width", "unit": "mm" },
    { "name": "length", "unit": "mm" },
    { "name": "gauge", "unit": "microns" },
    { "name": "color", "unit": "" },
    { "name": "materialType", "unit": "" }
  ]
}
```

**2. Option Type: "Finished Products"**
```json
{
  "name": "Finished Products",
  "linkedSpecification": "LDPE Film"
}
```

**3. Option: "Shopping Bag 12x18"**
```json
{
  "optionType": "Finished Products",
  "name": "Shopping Bag 12x18",
  "specifications": {
    "width": 300,
    "length": 450,
    "gauge": 40,
    "color": "Natural",
    "materialType": "LDPE"
  }
}
```

**4. View Template Display:**
```
┌────────────────────────────────────┐
│ 📦 PRODUCT DETAILS                 │
├────────────────────────────────────┤
│ Product: Shopping Bag 12x18        │
│ Width: 300 mm                      │
│ Length: 450 mm                     │
│ Gauge: 40 microns                  │
│ Material: LDPE                     │
└────────────────────────────────────┘
```

### Selecting Option Types in Step 2

When you select an Order Type, the system:
1. Reads `allowedOptionTypes` from order type
2. Shows only those option types in the list
3. You select which ones to include in THIS view template
4. Selected option types become available in Step 3 for display configuration

---

## 📊 Specification Display Configuration (Step 3)

### What Are Display Items?

Display Items are **read-only information** shown at the top of the operator view. They help operators:
- Verify they're working on correct order
- See product specifications
- View customer details
- Check order requirements

### Display Item Types

1. **Text** - Product names, customer names, addresses
2. **Number** - Quantities, dimensions, weights with units
3. **Formula** - Calculated values from spec fields
4. **Boolean** - Yes/No indicators
5. **Image** - Product images, order images

### Source Types

**1. optionSpec (Product Specifications)**
```
Source: optionSpec
  ├── Select Option Type: "Finished Products"
  ├── Select OptionSpec: Choose specific product spec
  └── Select Field: "width", "length", "gauge", etc.
```

**2. order (Order Information)**
```
Source: order
  └── Fields: orderId, orderDate, quantity, instructions
```

**3. customer (Customer Information)**
```
Source: customer
  └── Fields: name, company, phone, address
```

**4. formula (Calculated Values)**
```
Source: formula
  ├── Expression: "width * length / 1000"
  └── Dependencies: [width, length]
```

### Example: Bag Manufacturing Display

**Display Items Configuration:**
```javascript
[
  {
    label: "Product",
    displayType: "text",
    sourceType: "optionSpec",
    optionType: "Finished Products",
    field: "name"
  },
  {
    label: "Size",
    displayType: "text",
    sourceType: "formula",
    formula: "width + ' x ' + length + ' mm'"
  },
  {
    label: "Gauge",
    displayType: "number",
    sourceType: "optionSpec",
    field: "gauge",
    unit: "microns"
  },
  {
    label: "Order Qty",
    displayType: "number",
    sourceType: "order",
    field: "quantity",
    unit: "pcs"
  },
  {
    label: "Customer",
    displayType: "text",
    sourceType: "customer",
    field: "name"
  }
]
```

**Operator Sees:**
```
┌─────────────────────────────────────────┐
│ 📦 ORDER DETAILS                        │
├─────────────────────────────────────────┤
│ Product: LDPE Shopping Bag              │
│ Size: 300 x 450 mm                      │
│ Gauge: 40 microns                       │
│ Order Qty: 10,000 pcs                   │
│ Customer: ABC Industries                │
└─────────────────────────────────────────┘
```

---

## 📝 Table Column Configuration (Step 4)

### Understanding Column Types

**1. Text Columns**
- Free-form text entry
- Use for: Remarks, Notes, Operator observations
- Example: "Roll appears uniform, no visible defects"

**2. Number Columns**
- Numeric values with optional units
- Validation: Must be valid number
- Use for: Weights, counts, dimensions
- Example: Gross Weight: 25.5 kg

**3. Formula Columns**
- Auto-calculated based on other columns
- Read-only for operators
- Use for: Net weight, totals, percentages
- Example: `Net Weight = Gross Weight - Core Weight`

**4. Dropdown Columns**
- Pre-defined options
- Ensures data consistency
- Use for: Quality grades, status, categories
- Example: Grade: A / B / Rejected

**5. Boolean Columns**
- Yes/No or True/False
- Use for: Quality checks, verifications
- Example: Gauge Check: ✓ / ✗

**6. Date Columns**
- Date picker
- Use for: Production dates, expiry dates
- Example: Manufacturing Date: 2026-01-18

**7. Image Columns**
- Upload photos
- Use for: Quality documentation, defect records
- Example: Photo of finished roll

**8. Audio Columns**
- Voice notes
- Use for: Quick operator remarks
- Example: Voice note about machine issues

### Column Configuration Fields

**Basic Settings:**
- **Name**: Internal variable name (e.g., `grossWt`)
- **Label**: Display name for operators (e.g., "Gross Weight")
- **Data Type**: text/number/formula/dropdown/etc.
- **Unit**: Measurement unit (kg, pcs, mm, etc.)
- **Order**: Column display sequence
- **Width**: Column width in pixels

**Validation Settings:**
- **Is Required**: Operator must fill this field
- **Is Read Only**: Calculated/auto-filled, operator can't edit
- **Is Visible**: Show/hide column

**Source Settings:**
- **Source Type**: manual/order/customer/optionSpec/calculated
- **Source Field**: Which field to pull data from

### Formula Column Setup

**Example: Net Weight Calculation**

1. Add column:
   - Name: `netWt`
   - Label: "Net Weight"
   - Data Type: Formula
   - Unit: kg

2. Configure formula:
   - Formula Type: CUSTOM
   - Expression: `grossWt - coreWt`
   - Dependencies: [grossWt, coreWt]

3. Set properties:
   - Is Read Only: Yes (auto-calculated)
   - Is Visible: Yes

**Result**: When operator enters Gross Weight (25 kg) and Core Weight (1.5 kg), Net Weight automatically shows 23.5 kg

### Pre-defined Formula Templates

**Material Calculations:**
- **Per Bag Gram (LLDPE)**: `(width * length * gauge) / 3300`
- **Per Bag Gram (PP)**: `(width * length * gauge) / 3600`
- **Per Bag Gram (HM)**: `(width * length * gauge) / 3265`
- **Bags per KG**: `1000 / perBagGram`

**Weight Calculations:**
- **Net Weight**: `grossWt - coreWt`
- **Difference Qty**: `targetQty - netWt`
- **Percentage**: `(value / total) * 100`

**Size Calculations:**
- **Roll Size (Bottom Sealing)**: `width`
- **Roll Size (Side Sealing)**: `length`
- **Garment Roll Size**: `length + flap + gusset + innerLip`
- **Gauge Check**: `(width * gauge) / 100`

---

## 🧮 Formula System

### Formula Basics

**Variable Names:**
- Use column `name` field, not label
- Example: Column labeled "Gross Weight" with name `grossWt`
- In formula, use: `grossWt`, not "Gross Weight"

**Operators:**
- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Parentheses: `(` `)`

**Formula Types:**

**1. CUSTOM (Most Flexible)**
```javascript
expression: "grossWt - coreWt"
expression: "(width * length * gauge) / 3300"
expression: "(value / total) * 100"
```

**2. SUM**
```javascript
// Sums specific columns
expression: "SUM(col1, col2, col3)"
```

**3. AVERAGE**
```javascript
// Averages specific columns
expression: "AVERAGE(col1, col2, col3)"
```

**4. COUNT**
```javascript
// Counts non-empty values
expression: "COUNT(col1, col2, col3)"
```

**5. MULTIPLY**
```javascript
// Multiplies columns
expression: "MULTIPLY(quantity, price)"
```

**6. DIVIDE**
```javascript
// Divides columns
expression: "DIVIDE(total, count)"
```

### Real-World Formula Examples

**Example 1: Plastic Film Weight Calculation**
```javascript
Column: "Per Bag Weight"
Formula Type: CUSTOM
Expression: "(width * length * gauge) / 3300"
Dependencies: [width, length, gauge]
Unit: "grams"

// If width=300mm, length=450mm, gauge=40 microns:
// Result = (300 * 450 * 40) / 3300 = 1636.36 grams
```

**Example 2: Production Efficiency**
```javascript
Column: "Efficiency %"
Formula Type: CUSTOM
Expression: "(actualQty / targetQty) * 100"
Dependencies: [actualQty, targetQty]
Unit: "%"

// If actualQty=9500, targetQty=10000:
// Result = (9500 / 10000) * 100 = 95%
```

**Example 3: Material Wastage**
```javascript
Column: "Wastage"
Formula Type: CUSTOM
Expression: "grossWt - netWt - coreWt"
Dependencies: [grossWt, netWt, coreWt]
Unit: "kg"

// If grossWt=25kg, netWt=23kg, coreWt=1.5kg:
// Result = 25 - 23 - 1.5 = 0.5 kg wastage
```

**Example 4: Cost Calculation**
```javascript
Column: "Total Cost"
Formula Type: MULTIPLY
Expression: "quantity * unitPrice"
Dependencies: [quantity, unitPrice]
Unit: "₹"

// If quantity=1000, unitPrice=5:
// Result = 1000 * 5 = ₹5000
```

---

## 📚 Industry Examples

### Example 1: LDPE Shopping Bag Production (Extrusion)

**Machine Setup:**
- Machine Type: Extrusion Machine
- Machine: Extrusion-001

**Order Type:**
- Name: Manufacturing Order
- Allowed Option Types: [Finished Products, Raw Materials]

**Display Items (Step 3):**
```javascript
[
  { label: "Product", sourceType: "optionSpec", field: "name" },
  { label: "Width", sourceType: "optionSpec", field: "width", unit: "mm" },
  { label: "Length", sourceType: "optionSpec", field: "length", unit: "mm" },
  { label: "Gauge", sourceType: "optionSpec", field: "gauge", unit: "microns" },
  { label: "Color", sourceType: "optionSpec", field: "color" },
  { label: "Quantity", sourceType: "order", field: "quantity", unit: "pcs" }
]
```

**Table Columns (Step 4):**
```javascript
[
  { name: "serialNo", label: "S.No", dataType: "number", isReadOnly: true },
  { name: "grossWt", label: "Gross Weight", dataType: "number", unit: "kg", isRequired: true },
  { name: "coreWt", label: "Core Weight", dataType: "number", unit: "kg", isRequired: true },
  { name: "netWt", label: "Net Weight", dataType: "formula", formula: "grossWt - coreWt", unit: "kg", isReadOnly: true },
  { name: "grade", label: "Quality", dataType: "dropdown", dropdownOptions: ["A Grade", "B Grade", "Rejected"] },
  { name: "gaugeCheck", label: "Gauge OK", dataType: "boolean" },
  { name: "remarks", label: "Remarks", dataType: "text" }
]
```

---

### Example 2: Flexo Printing (4-Color Printing)

**Machine Setup:**
- Machine Type: Printing Machine
- Machine: Flexo-001

**Display Items:**
```javascript
[
  { label: "Product", sourceType: "optionSpec", field: "name" },
  { label: "Print Type", sourceType: "optionSpec", field: "printType" },
  { label: "Colors", sourceType: "optionSpec", field: "colorCount" },
  { label: "Design", sourceType: "order", field: "designImage", displayType: "image" },
  { label: "Customer", sourceType: "customer", field: "name" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text", isRequired: true },
  { name: "startTime", label: "Start Time", dataType: "text", isReadOnly: true },
  { name: "endTime", label: "End Time", dataType: "text", isReadOnly: true },
  { name: "printedLength", label: "Printed Length", dataType: "number", unit: "meters", isRequired: true },
  { name: "wasteLength", label: "Waste", dataType: "number", unit: "meters" },
  { name: "printQuality", label: "Quality", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] },
  { name: "colorMatching", label: "Color Match", dataType: "boolean" },
  { name: "photo", label: "Sample Photo", dataType: "image" }
]
```

---

### Example 3: Bag Making Machine (Side Sealing)

**Machine Setup:**
- Machine Type: Bag Making Machine
- Machine: BagMaker-001

**Display Items:**
```javascript
[
  { label: "Bag Type", sourceType: "optionSpec", field: "bagType" },
  { label: "Size", sourceType: "formula", formula: "width + ' x ' + length" },
  { label: "Gauge", sourceType: "optionSpec", field: "gauge", unit: "microns" },
  { label: "Target Quantity", sourceType: "order", field: "quantity", unit: "pcs" },
  { label: "Per Bag Weight", sourceType: "formula", formula: "(width * length * gauge) / 3300", unit: "grams" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch No", dataType: "text", isRequired: true },
  { name: "targetQty", label: "Target Qty", dataType: "number", unit: "pcs", sourceType: "order", sourceField: "quantity" },
  { name: "producedQty", label: "Produced Qty", dataType: "number", unit: "pcs", isRequired: true },
  { name: "rejectedQty", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "okQty", label: "OK Qty", dataType: "formula", formula: "producedQty - rejectedQty", unit: "pcs" },
  { name: "efficiency", label: "Efficiency %", dataType: "formula", formula: "(okQty / targetQty) * 100", unit: "%" },
  { name: "grade", label: "Grade", dataType: "dropdown", dropdownOptions: ["A", "B", "C", "Rejected"] }
]
```

---

### Example 4: Cutting/Slitting Machine

**Machine Setup:**
- Machine Type: Cutting Machine
- Machine: Cutting-001

**Display Items:**
```javascript
[
  { label: "Material Type", sourceType: "optionSpec", field: "materialType" },
  { label: "Roll Width", sourceType: "optionSpec", field: "rollWidth", unit: "mm" },
  { label: "Cut Width", sourceType: "optionSpec", field: "cutWidth", unit: "mm" },
  { label: "No. of Cuts", sourceType: "formula", formula: "FLOOR(rollWidth / cutWidth)" }
]
```

**Table Columns:**
```javascript
[
  { name: "masterRollNo", label: "Master Roll", dataType: "text", isRequired: true },
  { name: "masterGrossWt", label: "Master Gross Wt", dataType: "number", unit: "kg" },
  { name: "masterCoreWt", label: "Master Core Wt", dataType: "number", unit: "kg" },
  { name: "masterNetWt", label: "Master Net Wt", dataType: "formula", formula: "masterGrossWt - masterCoreWt", unit: "kg" },
  { name: "childRollCount", label: "Child Rolls", dataType: "number", isRequired: true },
  { name: "avgChildWt", label: "Avg Child Wt", dataType: "formula", formula: "masterNetWt / childRollCount", unit: "kg" },
  { name: "wastage", label: "Wastage", dataType: "number", unit: "kg" }
]
```

---

### Example 5: Lamination Machine

**Display Items:**
```javascript
[
  { label: "Base Material", sourceType: "optionSpec", field: "baseMaterial" },
  { label: "Laminate Material", sourceType: "optionSpec", field: "laminateMaterial" },
  { label: "Adhesive Type", sourceType: "optionSpec", field: "adhesiveType" },
  { label: "Target GSM", sourceType: "optionSpec", field: "gsm", unit: "gsm" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text" },
  { name: "baseWt", label: "Base Weight", dataType: "number", unit: "kg" },
  { name: "laminateWt", label: "Laminate Wt", dataType: "number", unit: "kg" },
  { name: "adhesiveWt", label: "Adhesive Wt", dataType: "number", unit: "kg" },
  { name: "totalWt", label: "Total Weight", dataType: "formula", formula: "baseWt + laminateWt + adhesiveWt", unit: "kg" },
  { name: "bondStrength", label: "Bond Test", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Weak", "Failed"] },
  { name: "visualCheck", label: "Visual OK", dataType: "boolean" }
]
```

---

### Example 6: Blown Film Extrusion (LDPE/LLDPE)

**Display Items:**
```javascript
[
  { label: "Film Type", sourceType: "optionSpec", field: "filmType" },
  { label: "Lay Flat Width", sourceType: "optionSpec", field: "layFlatWidth", unit: "mm" },
  { label: "Gauge", sourceType: "optionSpec", field: "gauge", unit: "microns" },
  { label: "Material", sourceType: "optionSpec", field: "rawMaterial" },
  { label: "Color/Additive", sourceType: "optionSpec", field: "color" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text", isRequired: true },
  { name: "grossWt", label: "Gross Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "coreWt", label: "Core Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "netWt", label: "Net Wt", dataType: "formula", formula: "grossWt - coreWt", unit: "kg" },
  { name: "length", label: "Length", dataType: "number", unit: "meters" },
  { name: "gaugeCheck", label: "Gauge Check", dataType: "formula", formula: "(layFlatWidth * gauge) / 100", unit: "mm" },
  { name: "uniformity", label: "Uniformity", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] },
  { name: "bubbleStability", label: "Bubble Stable", dataType: "boolean" }
]
```

---

### Example 7: Rotogravure Printing (High Quality)

**Display Items:**
```javascript
[
  { label: "Print Job", sourceType: "order", field: "orderId" },
  { label: "Design Reference", sourceType: "order", field: "designImage", displayType: "image" },
  { label: "Substrate", sourceType: "optionSpec", field: "substrate" },
  { label: "Total Colors", sourceType: "optionSpec", field: "colorCount" },
  { label: "Customer", sourceType: "customer", field: "companyName" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text" },
  { name: "cylinder", label: "Cylinder Set", dataType: "text" },
  { name: "printedMeters", label: "Printed Length", dataType: "number", unit: "meters", isRequired: true },
  { name: "wasteMeters", label: "Waste", dataType: "number", unit: "meters" },
  { name: "colorRegistration", label: "Registration", dataType: "dropdown", dropdownOptions: ["Perfect", "Good", "Off by 1mm", "Off by 2mm+"] },
  { name: "densityCheck", label: "Density OK", dataType: "boolean" },
  { name: "photoComparison", label: "Sample vs Std", dataType: "image" },
  { name: "operatorNotes", label: "Notes", dataType: "text" }
]
```

---

### Example 8: PP/HDPE Woven Sack Manufacturing

**Display Items:**
```javascript
[
  { label: "Sack Type", sourceType: "optionSpec", field: "sackType" },
  { label: "Size", sourceType: "formula", formula: "width + ' x ' + length" },
  { label: "GSM", sourceType: "optionSpec", field: "gsm", unit: "gsm" },
  { label: "Color", sourceType: "optionSpec", field: "fabricColor" },
  { label: "Print", sourceType: "optionSpec", field: "printRequirement" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch", dataType: "text" },
  { name: "targetQty", label: "Target", dataType: "number", unit: "pcs" },
  { name: "producedQty", label: "Produced", dataType: "number", unit: "pcs", isRequired: true },
  { name: "firstQuality", label: "1st Quality", dataType: "number", unit: "pcs" },
  { name: "secondQuality", label: "2nd Quality", dataType: "number", unit: "pcs" },
  { name: "rejected", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "total", label: "Total", dataType: "formula", formula: "firstQuality + secondQuality + rejected", unit: "pcs" },
  { name: "stitchQuality", label: "Stitch Check", dataType: "boolean" },
  { name: "remarks", label: "Remarks", dataType: "text" }
]
```

---

### Example 9: Tissue Paper Converting

**Display Items:**
```javascript
[
  { label: "Product", sourceType: "optionSpec", field: "productName" },
  { label: "Sheet Size", sourceType: "formula", formula: "sheetWidth + ' x ' + sheetLength" },
  { label: "Ply", sourceType: "optionSpec", field: "ply" },
  { label: "Sheets/Pack", sourceType: "optionSpec", field: "sheetsPerPack" },
  { label: "Packs/Carton", sourceType: "optionSpec", field: "packsPerCarton" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch No", dataType: "text" },
  { name: "parentRollWt", label: "Parent Roll Wt", dataType: "number", unit: "kg" },
  { name: "packsProduced", label: "Packs Produced", dataType: "number", unit: "packs", isRequired: true },
  { name: "cartonsProduced", label: "Cartons", dataType: "formula", formula: "FLOOR(packsProduced / packsPerCarton)", unit: "cartons" },
  { name: "loosePacks", label: "Loose Packs", dataType: "formula", formula: "packsProduced % packsPerCarton", unit: "packs" },
  { name: "wastePaper", label: "Waste", dataType: "number", unit: "kg" },
  { name: "packingQuality", label: "Packing Quality", dataType: "dropdown", dropdownOptions: ["Perfect", "Good", "Fair", "Poor"] }
]
```

---

### Example 10: Aluminum Foil Lamination

**Display Items:**
```javascript
[
  { label: "Product Type", sourceType: "optionSpec", field: "productType" },
  { label: "Foil Thickness", sourceType: "optionSpec", field: "foilThickness", unit: "microns" },
  { label: "Paper GSM", sourceType: "optionSpec", field: "paperGsm", unit: "gsm" },
  { label: "Roll Width", sourceType: "optionSpec", field: "rollWidth", unit: "mm" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text" },
  { name: "foilRollWt", label: "Foil Roll Wt", dataType: "number", unit: "kg" },
  { name: "paperRollWt", label: "Paper Roll Wt", dataType: "number", unit: "kg" },
  { name: "adhesiveUsed", label: "Adhesive", dataType: "number", unit: "kg" },
  { name: "finishedRollWt", label: "Finished Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "laminationQuality", label: "Quality", dataType: "dropdown", dropdownOptions: ["A+", "A", "B", "Rejected"] },
  { name: "bondTest", label: "Bond Test Pass", dataType: "boolean" },
  { name: "visualDefects", label: "Defects", dataType: "text" }
]
```

---

### Example 11: Stretch Film Production

**Display Items:**
```javascript
[
  { label: "Film Type", sourceType: "optionSpec", field: "stretchFilmType" },
  { label: "Width", sourceType: "optionSpec", field: "filmWidth", unit: "mm" },
  { label: "Gauge", sourceType: "optionSpec", field: "gauge", unit: "microns" },
  { label: "Stretch %", sourceType: "optionSpec", field: "stretchPercentage", unit: "%" },
  { label: "Material", sourceType: "optionSpec", field: "material" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text", isRequired: true },
  { name: "grossWt", label: "Gross Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "coreWt", label: "Core Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "netWt", label: "Net Wt", dataType: "formula", formula: "grossWt - coreWt", unit: "kg" },
  { name: "length", label: "Length", dataType: "number", unit: "meters" },
  { name: "stretchTest", label: "Stretch Test", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Failed"] },
  { name: "clingTest", label: "Cling OK", dataType: "boolean" },
  { name: "visualCheck", label: "Visual", dataType: "dropdown", dropdownOptions: ["Clear", "Haze", "Gels", "Lines"] }
]
```

---

### Example 12: Corrugated Box Manufacturing

**Display Items:**
```javascript
[
  { label: "Box Type", sourceType: "optionSpec", field: "boxType" },
  { label: "Dimensions", sourceType: "formula", formula: "length + ' x ' + width + ' x ' + height" },
  { label: "Ply", sourceType: "optionSpec", field: "ply" },
  { label: "Burst Factor", sourceType: "optionSpec", field: "burstFactor" },
  { label: "Printing", sourceType: "optionSpec", field: "printType" }
]
```

**Table Columns:**
```javascript
[
  { name: "bundleNo", label: "Bundle No", dataType: "text" },
  { name: "sheetCount", label: "Sheet Count", dataType: "number", unit: "sheets" },
  { name: "boxesProduced", label: "Boxes Produced", dataType: "number", unit: "pcs", isRequired: true },
  { name: "grade1", label: "Grade 1", dataType: "number", unit: "pcs" },
  { name: "grade2", label: "Grade 2", dataType: "number", unit: "pcs" },
  { name: "rejected", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "crushTest", label: "Crush Test", dataType: "dropdown", dropdownOptions: ["Pass", "Marginal", "Fail"] },
  { name: "printQuality", label: "Print Quality", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] }
]
```

---

### Example 13: Paper Cup/Container Manufacturing

**Display Items:**
```javascript
[
  { label: "Product", sourceType: "optionSpec", field: "productName" },
  { label: "Capacity", sourceType: "optionSpec", field: "capacity", unit: "ml" },
  { label: "Paper GSM", sourceType: "optionSpec", field: "paperGsm", unit: "gsm" },
  { label: "PE Coating", sourceType: "optionSpec", field: "peCoating" },
  { label: "Print Design", sourceType: "order", field: "designImage", displayType: "image" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch", dataType: "text" },
  { name: "targetQty", label: "Target", dataType: "number", unit: "pcs" },
  { name: "producedQty", label: "Produced", dataType: "number", unit: "pcs", isRequired: true },
  { name: "okQty", label: "OK Qty", dataType: "number", unit: "pcs" },
  { name: "rejectedQty", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "leakTest", label: "Leak Test", dataType: "dropdown", dropdownOptions: ["Pass", "Fail"] },
  { name: "rimQuality", label: "Rim Quality", dataType: "boolean" },
  { name: "printAlignment", label: "Print Align", dataType: "boolean" }
]
```

---

### Example 14: Zipper Pouch Manufacturing

**Display Items:**
```javascript
[
  { label: "Pouch Type", sourceType: "optionSpec", field: "pouchType" },
  { label: "Size", sourceType: "formula", formula: "width + ' x ' + length" },
  { label: "Material", sourceType: "optionSpec", field: "materialStructure" },
  { label: "Zipper Type", sourceType: "optionSpec", field: "zipperType" },
  { label: "Print Colors", sourceType: "optionSpec", field: "printColors" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch", dataType: "text" },
  { name: "targetQty", label: "Target", dataType: "number", unit: "pcs" },
  { name: "producedQty", label: "Produced", dataType: "number", unit: "pcs", isRequired: true },
  { name: "grade1", label: "1st Grade", dataType: "number", unit: "pcs" },
  { name: "grade2", label: "2nd Grade", dataType: "number", unit: "pcs" },
  { name: "rejected", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "zipperTest", label: "Zipper Test", dataType: "dropdown", dropdownOptions: ["Smooth", "Tight", "Loose", "Failed"] },
  { name: "sealTest", label: "Seal Test", dataType: "boolean" },
  { name: "printCheck", label: "Print OK", dataType: "boolean" }
]
```

---

### Example 15: Non-Woven Fabric Production

**Display Items:**
```javascript
[
  { label: "Fabric Type", sourceType: "optionSpec", field: "fabricType" },
  { label: "GSM", sourceType: "optionSpec", field: "gsm", unit: "gsm" },
  { label: "Width", sourceType: "optionSpec", field: "fabricWidth", unit: "mm" },
  { label: "Color", sourceType: "optionSpec", field: "color" },
  { label: "Treatment", sourceType: "optionSpec", field: "treatment" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text" },
  { name: "grossWt", label: "Gross Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "coreWt", label: "Core Wt", dataType: "number", unit: "kg" },
  { name: "netWt", label: "Net Wt", dataType: "formula", formula: "grossWt - coreWt", unit: "kg" },
  { name: "length", label: "Length", dataType: "number", unit: "meters" },
  { name: "gsmActual", label: "Actual GSM", dataType: "number", unit: "gsm" },
  { name: "uniformity", label: "Uniformity", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] },
  { name: "strengthTest", label: "Strength OK", dataType: "boolean" }
]
```

---

### Example 16: Steel Wire/Rod Processing

**Display Items:**
```javascript
[
  { label: "Product", sourceType: "optionSpec", field: "productType" },
  { label: "Diameter", sourceType: "optionSpec", field: "diameter", unit: "mm" },
  { label: "Grade", sourceType: "optionSpec", field: "steelGrade" },
  { label: "Coating", sourceType: "optionSpec", field: "coating" },
  { label: "Customer", sourceType: "customer", field: "companyName" }
]
```

**Table Columns:**
```javascript
[
  { name: "coilNo", label: "Coil No", dataType: "text", isRequired: true },
  { name: "grossWt", label: "Gross Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "tareWt", label: "Tare Wt", dataType: "number", unit: "kg" },
  { name: "netWt", label: "Net Wt", dataType: "formula", formula: "grossWt - tareWt", unit: "kg" },
  { name: "length", label: "Length", dataType: "number", unit: "meters" },
  { name: "diameterCheck", label: "Dia Check", dataType: "number", unit: "mm" },
  { name: "tensileTest", label: "Tensile Test", dataType: "dropdown", dropdownOptions: ["Pass", "Marginal", "Fail"] },
  { name: "visualDefects", label: "Visual Check", dataType: "text" }
]
```

---

### Example 17: Plastic Injection Molding

**Display Items:**
```javascript
[
  { label: "Part Name", sourceType: "optionSpec", field: "partName" },
  { label: "Mold Number", sourceType: "optionSpec", field: "moldNumber" },
  { label: "Material", sourceType: "optionSpec", field: "plasticMaterial" },
  { label: "Color", sourceType: "optionSpec", field: "color" },
  { label: "Cavities", sourceType: "optionSpec", field: "cavityCount" }
]
```

**Table Columns:**
```javascript
[
  { name: "shotNo", label: "Shot No", dataType: "text" },
  { name: "cycleTime", label: "Cycle Time", dataType: "number", unit: "sec" },
  { name: "partsProduced", label: "Parts/Shot", dataType: "number", unit: "pcs" },
  { name: "okParts", label: "OK Parts", dataType: "number", unit: "pcs" },
  { name: "rejectedParts", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "flashDefect", label: "Flash", dataType: "boolean" },
  { name: "shortShot", label: "Short Shot", dataType: "boolean" },
  { name: "dimensionCheck", label: "Dimension OK", dataType: "boolean" },
  { name: "defectReason", label: "Defect Reason", dataType: "text" }
]
```

---

### Example 18: PET Bottle Blow Molding

**Display Items:**
```javascript
[
  { label: "Bottle Type", sourceType: "optionSpec", field: "bottleType" },
  { label: "Capacity", sourceType: "optionSpec", field: "capacity", unit: "ml" },
  { label: "Neck Size", sourceType: "optionSpec", field: "neckSize", unit: "mm" },
  { label: "Color", sourceType: "optionSpec", field: "color" },
  { label: "Preform Weight", sourceType: "optionSpec", field: "preformWeight", unit: "grams" }
]
```

**Table Columns:**
```javascript
[
  { name: "cavityNo", label: "Cavity", dataType: "text" },
  { name: "targetQty", label: "Target", dataType: "number", unit: "pcs" },
  { name: "producedQty", label: "Produced", dataType: "number", unit: "pcs", isRequired: true },
  { name: "gradeA", label: "Grade A", dataType: "number", unit: "pcs" },
  { name: "gradeB", label: "Grade B", dataType: "number", unit: "pcs" },
  { name: "rejected", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "weightCheck", label: "Weight OK", dataType: "boolean" },
  { name: "visualDefects", label: "Visual Check", dataType: "dropdown", dropdownOptions: ["Perfect", "Minor", "Major", "Critical"] },
  { name: "leakTest", label: "Leak Test", dataType: "boolean" }
]
```

---

### Example 19: Garment Bag Manufacturing

**Display Items:**
```javascript
[
  { label: "Product", sourceType: "optionSpec", field: "productName" },
  { label: "Length", sourceType: "optionSpec", field: "length", unit: "inches" },
  { label: "Flap", sourceType: "optionSpec", field: "flap", unit: "inches" },
  { label: "Gusset", sourceType: "optionSpec", field: "gusset", unit: "inches" },
  { label: "Inner Lip", sourceType: "optionSpec", field: "innerLip", unit: "inches" },
  { label: "Roll Size", sourceType: "formula", formula: "length + flap + gusset + innerLip", unit: "inches" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text" },
  { name: "grossWt", label: "Gross Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "coreWt", label: "Core Wt", dataType: "number", unit: "kg" },
  { name: "netWt", label: "Net Wt", dataType: "formula", formula: "grossWt - coreWt", unit: "kg" },
  { name: "rollSize", label: "Roll Size", dataType: "number", unit: "inches" },
  { name: "perforation", label: "Perforation OK", dataType: "boolean" },
  { name: "uniformity", label: "Uniformity", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] },
  { name: "remarks", label: "Remarks", dataType: "text" }
]
```

---

### Example 20: Food Packaging Film (Multi-layer)

**Display Items:**
```javascript
[
  { label: "Film Structure", sourceType: "optionSpec", field: "layerStructure" },
  { label: "Total Thickness", sourceType: "optionSpec", field: "totalThickness", unit: "microns" },
  { label: "Width", sourceType: "optionSpec", field: "filmWidth", unit: "mm" },
  { label: "Barrier Type", sourceType: "optionSpec", field: "barrierType" },
  { label: "Food Contact Approved", sourceType: "optionSpec", field: "foodGrade", displayType: "boolean" }
]
```

**Table Columns:**
```javascript
[
  { name: "rollNo", label: "Roll No", dataType: "text", isRequired: true },
  { name: "grossWt", label: "Gross Wt", dataType: "number", unit: "kg", isRequired: true },
  { name: "coreWt", label: "Core Wt", dataType: "number", unit: "kg" },
  { name: "netWt", label: "Net Wt", dataType: "formula", formula: "grossWt - coreWt", unit: "kg" },
  { name: "length", label: "Length", dataType: "number", unit: "meters" },
  { name: "layerAdherence", label: "Layer Bond", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] },
  { name: "barrierTest", label: "Barrier Test", dataType: "dropdown", dropdownOptions: ["Pass", "Marginal", "Fail"] },
  { name: "sealStrength", label: "Seal Test", dataType: "boolean" },
  { name: "visualCheck", label: "Visual", dataType: "text" }
]
```

---

### Example 21: Paper Printing (Offset/Digital)

**Display Items:**
```javascript
[
  { label: "Job Name", sourceType: "order", field: "orderId" },
  { label: "Paper Type", sourceType: "optionSpec", field: "paperType" },
  { label: "Size", sourceType: "optionSpec", field: "paperSize" },
  { label: "GSM", sourceType: "optionSpec", field: "gsm", unit: "gsm" },
  { label: "Colors", sourceType: "optionSpec", field: "printColors" },
  { label: "Finishing", sourceType: "optionSpec", field: "finishing" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch", dataType: "text" },
  { name: "targetSheets", label: "Target Sheets", dataType: "number", unit: "sheets" },
  { name: "printedSheets", label: "Printed", dataType: "number", unit: "sheets", isRequired: true },
  { name: "okSheets", label: "OK Sheets", dataType: "number", unit: "sheets" },
  { name: "wasteSheets", label: "Waste", dataType: "number", unit: "sheets" },
  { name: "colorMatch", label: "Color Match", dataType: "dropdown", dropdownOptions: ["Perfect", "Good", "Fair", "Poor"] },
  { name: "registration", label: "Registration", dataType: "dropdown", dropdownOptions: ["Perfect", "Good", "Off"] },
  { name: "finishing Quality", label: "Finishing", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair"] }
]
```

---

### Example 22: Aluminum Profile Extrusion

**Display Items:**
```javascript
[
  { label: "Profile Type", sourceType: "optionSpec", field: "profileType" },
  { label: "Alloy", sourceType: "optionSpec", field: "alloyGrade" },
  { label: "Length", sourceType: "optionSpec", field: "standardLength", unit: "meters" },
  { label: "Finish", sourceType: "optionSpec", field: "surfaceFinish" },
  { label: "Customer", sourceType: "customer", field: "companyName" }
]
```

**Table Columns:**
```javascript
[
  { name: "batchNo", label: "Batch", dataType: "text" },
  { name: "barCount", label: "Bar Count", dataType: "number", unit: "pcs", isRequired: true },
  { name: "avgLength", label: "Avg Length", dataType: "number", unit: "meters" },
  { name: "totalWeight", label: "Total Weight", dataType: "number", unit: "kg", isRequired: true },
  { name: "gradeA", label: "Grade A", dataType: "number", unit: "pcs" },
  { name: "gradeB", label: "Grade B", dataType: "number", unit: "pcs" },
  { name: "rejected", label: "Rejected", dataType: "number", unit: "pcs" },
  { name: "dimensionCheck", label: "Dimension OK", dataType: "boolean" },
  { name: "surfaceQuality", label: "Surface", dataType: "dropdown", dropdownOptions: ["Excellent", "Good", "Fair", "Poor"] }
]
```

---

## 🏆 Best Practices

### 1. Naming Conventions

**Template Names:**
- Be descriptive and specific
- ✅ "Extrusion Production Entry - LDPE Bags"
- ❌ "Template 1"

**Column Names (Internal):**
- Use camelCase
- No spaces
- ✅ `grossWt`, `coreWt`, `netWt`
- ❌ `Gross Weight`, `gross_wt`

**Column Labels (Display):**
- Use proper capitalization
- Can have spaces
- ✅ "Gross Weight", "Net Weight"

### 2. Formula Best Practices

**Always specify dependencies:**
```javascript
// ✅ Good
{
  formula: "grossWt - coreWt",
  dependencies: ["grossWt", "coreWt"]
}

// ❌ Bad
{
  formula: "grossWt - coreWt",
  dependencies: []
}
```

**Use parentheses for clarity:**
```javascript
// ✅ Good
formula: "(width * length * gauge) / 3300"

// ❌ Ambiguous
formula: "width * length * gauge / 3300"
```

**Test formulas before deployment:**
- Create test order
- Enter sample data
- Verify calculations are correct

### 3. Display Item Organization

**Order matters:**
1. Product/Job identification first
2. Specifications next
3. Customer/Order details last

**Example:**
```javascript
[
  { label: "Product" },      // 1. What
  { label: "Width" },         // 2. Specs
  { label: "Length" },
  { label: "Gauge" },
  { label: "Customer" },      // 3. Who
  { label: "Order Qty" }      // 4. How much
]
```

### 4. Column Configuration

**Mark read-only fields:**
- Formulas should always be read-only
- Serial numbers should be read-only
- Order data pulled from order should be read-only

**Mark required fields:**
- Critical production data (weights, counts)
- Quality checks
- NOT optional fields like remarks

**Use appropriate data types:**
- Weights/dimensions → number
- Quality grades → dropdown
- Pass/fail checks → boolean
- Operator notes → text

### 5. Validation Strategy

**Required fields first:**
```javascript
[
  { name: "grossWt", isRequired: true },
  { name: "coreWt", isRequired: true },
  { name: "grade", isRequired: true },
  { name: "remarks", isRequired: false }  // Optional
]
```

**Dropdown for consistency:**
```javascript
// ✅ Use dropdown for standardized values
{ name: "grade", dataType: "dropdown", dropdownOptions: ["A", "B", "C"] }

// ❌ Don't use text for values that should be standardized
{ name: "grade", dataType: "text" }
```

### 6. Testing Templates

**Before deploying to production:**
1. Create test order
2. Assign to test machine
3. Have operator test data entry
4. Verify all formulas calculate correctly
5. Check all dropdowns work
6. Test image/audio upload (if enabled)
7. Verify data saves correctly

---

## 🔧 Troubleshooting

### Issue 1: Option Types Not Showing in Step 2

**Problem:** After selecting Order Type, no option types appear

**Solution:**
1. Verify Order Type has `allowedOptionTypes` configured
2. Navigate to: Create → Order Type → Edit the order type
3. Ensure "Allowed Option Types" section has option types selected
4. Save order type
5. Refresh View Template wizard

---

### Issue 2: Formula Not Calculating

**Problem:** Formula column shows empty or error

**Causes:**
1. **Wrong variable names** - Using column label instead of name
   - ❌ Formula: `"Gross Weight" - "Core Weight"`
   - ✅ Formula: `grossWt - coreWt`

2. **Missing dependencies** - Dependencies array empty
   - ✅ Add all column names used in formula to dependencies

3. **Division by zero** - Formula tries to divide by 0
   - Add validation or conditional logic

**Solution:**
```javascript
{
  name: "netWt",
  formula: {
    type: "CUSTOM",
    expression: "grossWt - coreWt",
    dependencies: ["grossWt", "coreWt"]  // ← MUST include
  }
}
```

---

### Issue 3: Display Items Not Showing Data

**Problem:** Display items show blank in operator view

**Causes:**
1. **Wrong source field** - Field name doesn't exist in option spec
2. **Option not selected** - Order doesn't have option selected
3. **Wrong option type** - Selected different option type than configured

**Solution:**
1. Verify option specification has the field you're trying to display
2. When creating order, ensure you select the option
3. Ensure display item's option type matches the option in order

---

### Issue 4: Cannot Save Template - "Template Already Exists"

**Problem:** Error when saving: "A view template already exists for this order type on this machine"

**Explanation:** One machine can only have ONE view template per order type

**Solution:**
1. **Option A**: Edit existing template instead of creating new one
2. **Option B**: Use different machine
3. **Option C**: Use different order type
4. **Option D**: Delete existing template first (if you really want to replace it)

---

### Issue 5: Operator Cannot See Template

**Problem:** Operator logs in but doesn't see the view template

**Causes:**
1. **Wrong machine assigned** - Order assigned to different machine
2. **Wrong order type** - Order is different order type than template
3. **Template not saved** - Template still in draft

**Solution:**
1. Verify order is assigned to correct machine
2. Verify order type matches template's order type
3. Ensure template is saved (not just previewed)

---

### Issue 6: Dropdown Options Not Appearing

**Problem:** Dropdown column shows empty

**Solution:**
```javascript
{
  name: "grade",
  dataType: "dropdown",
  dropdownOptions: [
    { label: "A Grade", value: "a" },
    { label: "B Grade", value: "b" },
    { label: "Rejected", value: "rejected" }
  ]  // ← Make sure this is populated
}
```

---

## 📖 Quick Reference

### Wizard Steps Summary

| Step | Purpose | What to Configure |
|------|---------|-------------------|
| 1 | Machine Selection | Select machine type and specific machine |
| 2 | Order Type | Select order type and which option types to use |
| 3 | Display Items | Configure what info operators see at top |
| 4 | Table Columns | Configure production data entry table |
| 5 | Save | Review and save template |

### Common Formula Patterns

```javascript
// Subtraction
"grossWt - coreWt"

// Percentage
"(value / total) * 100"

// Per Bag Weight (LLDPE)
"(width * length * gauge) / 3300"

// Multiple operations
"(length + flap + gusset + innerLip)"

// Conditional (requires custom logic)
"targetQty > actualQty ? targetQty - actualQty : 0"
```

### Data Type Reference

| Data Type | Use For | Example |
|-----------|---------|---------|
| text | Free text, notes | "Good quality, uniform color" |
| number | Quantities, weights, dimensions | 25.5 kg |
| formula | Auto-calculations | Net Wt = Gross - Core |
| dropdown | Standardized options | A Grade / B Grade / Rejected |
| boolean | Yes/No checks | ✓ Gauge OK |
| date | Dates | 2026-01-18 |
| image | Photos | Quality check photo |
| audio | Voice notes | Operator remarks |

---

## 🎓 Summary

The View Template System is the bridge between:
- **Your Orders** (what needs to be produced)
- **Your Machines** (where it's produced)
- **Your Operators** (who produces it)

By creating well-configured view templates, you ensure:
✅ Operators see relevant product information
✅ Data entry is fast and error-free
✅ Automatic calculations reduce mistakes
✅ Production tracking is accurate
✅ Quality standards are enforced

**Next Steps:**
1. Review your machines and ensure all are configured
2. Review your order types and allowed option types
3. Create your first view template using this guide
4. Test with a sample order
5. Deploy to production

---

**Document Version:** 1.0
**Last Updated:** 2026-01-18
**For Support:** Refer to application help system or contact technical support
