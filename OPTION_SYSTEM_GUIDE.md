# 🎯 Option System - Complete Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
4. [Industry Examples](#industry-examples)
5. [Specifications Deep Dive](#specifications-deep-dive)
6. [Integration with Other Modules](#integration-with-other-modules)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is the Option System?

The **Option System** is the foundation of 27 Manufacturing that defines **products** and **materials** your company works with. It creates the building blocks for orders, inventory, and production tracking.

**Key Capabilities:**
- **Define Products** - Create product catalogs with detailed specifications
- **Specify Variations** - Track different sizes, colors, materials, grades
- **Enable Production** - Products link to machines, orders, and view templates
- **Drive Inventory** - Products tracked in inventory with spec-based identification
- **Support Formulas** - Specifications used in calculations (area, weight, etc.)

```
┌─────────────────────────────────────────────────────────────┐
│                    OPTION SYSTEM                             │
│                                                              │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │  Option Type   │────────▶│ Specifications  │            │
│  │  (Product)     │         │ (Properties)    │            │
│  └────────────────┘         └─────────────────┘            │
│         │                            │                      │
│         │                            │                      │
│         ▼                            ▼                      │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │   Orders       │         │   Inventory     │            │
│  │                │         │                 │            │
│  └────────────────┘         └─────────────────┘            │
│         │                            │                      │
│         │                            │                      │
│         ▼                            ▼                      │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │ View Template  │         │    Formulas     │            │
│  │  (Production)  │         │ (Calculations)  │            │
│  └────────────────┘         └─────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. Option Type (Product/Material)**
- A category of items you manufacture or use
- Examples: "LDPE Film Roll", "Printed Pouch", "Steel Wire"
- Defined once, used across all modules

**2. Specifications**
- Properties that define product variations
- Examples: Width (300mm), Thickness (25 microns), Color (Blue)
- Used for precise product identification
- Enable formula calculations

**3. Specification Types**
- **Number** - Numeric values (width, length, weight)
- **Text** - Free text (batch number, notes)
- **Dropdown** - Predefined choices (color, grade)
- **Checkbox** - Yes/No values (laminated, printed)

**4. Required vs Optional**
- **Required** - Must be filled when creating order/inventory
- **Optional** - Can be left blank

**5. Variable Names (For Formulas)**
- Auto-generated from specification name
- Used in inventory formulas
- Example: "Width (mm)" → `width`

---

## Prerequisites

Before creating option types, understand:

### 1. Your Product Catalog

**Questions to Answer:**
- What products do you manufacture?
- What raw materials do you purchase?
- What intermediate products (WIP) do you produce?
- What are the key properties of each product?

**Example Mapping:**
```
LDPE Bag Manufacturer:

Raw Materials:
├─ LDPE Granules
│  └─ Properties: Bag weight, Grade, Color, Melt index
├─ Printing Ink
│  └─ Properties: Color, Can size, Type
└─ Color Masterbatch
   └─ Properties: Color, Concentration, Bag weight

Intermediate Products:
└─ LDPE Film Roll
   └─ Properties: Width, Length, Thickness, Color

Finished Products:
├─ LDPE Bag (Plain)
│  └─ Properties: Length, Width, Thickness, Color
└─ LDPE Bag (Printed)
   └─ Properties: Length, Width, Thickness, Design, Colors
```

### 2. Product Variations

**Understand what varies:**
```
Example: Plastic Film Roll

Fixed Properties (same for all):
└─ Material: LDPE (always)

Variable Properties (changes per order):
├─ Width: 300mm, 400mm, 500mm, etc.
├─ Thickness: 25, 50, 75 microns
├─ Length: 500m, 1000m, custom
└─ Color: Natural, White, Black, Blue, etc.
```

### 3. Measurement Units

**Common units to know:**
```
Dimensions:
├─ mm (millimeters)
├─ cm (centimeters)
├─ m (meters)
├─ inches

Weight:
├─ grams
├─ kg (kilograms)
├─ MT (metric tons)

Volume:
├─ ml (milliliters)
├─ LTR (liters)

Area:
├─ SQM (square meters)
├─ SQFT (square feet)

Thickness:
├─ microns
├─ mm
├─ gauge
```

---

## Step-by-Step Setup Guide

### Step 1: Plan Your Option Type

**Before creating, document:**
```
Option Type: LDPE Film Roll

Basic Info:
├─ Name: LDPE Film Roll
├─ Code: LDPE-FILM-001
├─ Category: Intermediate Product
└─ Description: Blown film for bag manufacturing

Specifications Needed:
├─ Width (mm) - Number - Required
├─ Length (m) - Number - Required
├─ Thickness (microns) - Number - Required
├─ Color - Dropdown - Required
├─ Grade - Dropdown - Required
├─ Batch Number - Text - Optional
└─ Manufacturing Date - Date - Optional

Dropdown Options:
├─ Color: Natural, White, Black, Blue, Red, Green
└─ Grade: Virgin, Recycled, Mix
```

---

### Step 2: Create Option Type

**Action:** Create → Options System → Create Option Type

#### 2.1 Basic Information
```
Option Type Name: LDPE Film Roll
Option Type Code: LDPE-FILM-001
Category: Intermediate Product (or Raw Material / Finished Product)
Description: LDPE blown film rolls for flexible packaging
Status: Active
```

**Guidelines:**
- **Name**: Descriptive and clear (shows in dropdowns)
- **Code**: Unique identifier (good for reports and tracking)
- **Category**: Helps organize option types
- **Description**: Explains what this is (helpful for team)

---

#### 2.2 Add Specifications

**Specification 1: Width**
```
Field Name: Width
Data Type: Number
Unit: mm
Required: Yes
Default Value: 300
Minimum: 100
Maximum: 1500
Use in Formulas: Yes
Description: Film width in millimeters
```

**Specification 2: Length**
```
Field Name: Length
Data Type: Number
Unit: m
Required: Yes
Default Value: 500
Minimum: 100
Maximum: 5000
Use in Formulas: Yes
Description: Film length in meters
```

**Specification 3: Thickness**
```
Field Name: Thickness
Data Type: Number
Unit: microns
Required: Yes
Default Value: 25
Minimum: 15
Maximum: 200
Use in Formulas: Yes
Description: Film thickness in microns
```

**Specification 4: Color**
```
Field Name: Color
Data Type: Dropdown
Required: Yes
Options:
  - Natural
  - White
  - Black
  - Blue
  - Red
  - Green
  - Yellow
  - Custom
Default: Natural
Description: Film color
```

**Specification 5: Grade**
```
Field Name: Grade
Data Type: Dropdown
Required: Yes
Options:
  - Virgin (100% new resin)
  - Recycled (100% recycled)
  - Mix (Virgin + Recycled blend)
Default: Virgin
Description: Material grade quality
```

**Specification 6: Batch Number (Optional)**
```
Field Name: Batch Number
Data Type: Text
Required: No
Max Length: 50
Description: Production batch tracking number
```

---

#### 2.3 Configure Formula Settings

**Enable Formula Variables:**
```
Specifications available for formulas:
☑ Width (mm) → Variable: width
☑ Length (m) → Variable: length
☑ Thickness (microns) → Variable: thickness
☐ Color → (Not numerical, can't use in formulas)
☐ Grade → (Not numerical, can't use in formulas)
☐ Batch Number → (Not numerical)
```

**These variables can be used in:**
- Inventory formulas (calculate area, weight)
- View template calculations
- Order type calculations

---

#### 2.4 Link to Machines (Optional)

**If this option type is produced/used by specific machines:**
```
Compatible Machines:
☑ Extrusion-001
☑ Extrusion-002
☑ Extrusion-003
☐ Printing-001 (Not used for extrusion)
☐ Bag Making-001 (Not used for extrusion)
```

**Why link machines?**
- View templates can auto-filter products
- Operators see only relevant products
- Better production tracking

---

#### 2.5 Link to Order Types (Optional)

**Which order types can use this product:**
```
Allowed Order Types:
☑ Manufacturing Order (Produce this item)
☑ Purchase Order (Buy this item)
☐ Sales Order (Sell this item)
```

---

### Step 3: Save and Test

**After creating:**
1. Click **Save Option Type**
2. Go to Create → Order → Create Order
3. Select an order type
4. Check if option type appears in product selection
5. Verify all specifications show correctly
6. Test dropdown values
7. Ensure required fields are marked with *

---

### Step 4: Create Related Option Types

**For complete workflow, create all related products:**
```
1. Raw Material: LDPE Granules
2. Intermediate: LDPE Film Roll (created above)
3. Finished Product: LDPE Bag
```

**Now create LDPE Bag option type:**
```
Option Type Name: LDPE Bag
Specifications:
├─ Bag Length (mm) - Number - Required
├─ Bag Width (mm) - Number - Required
├─ Gusset (mm) - Number - Optional
├─ Thickness (microns) - Number - Required
├─ Color - Dropdown - Required
├─ Printing - Dropdown (None/1-Color/Multi-Color)
├─ Handle Type - Dropdown (None/Loop/D-Cut)
└─ Quantity Per Bundle - Number - Default: 100
```

---

## Industry Examples

### Example 1: LDPE Bag Manufacturing - Complete Option Types

#### Raw Material 1: LDPE Granules
```
Option Type Name: LDPE Granules
Code: RM-LDPE-GR

Specifications:
1. Bag Weight (kg)
   ├─ Type: Number
   ├─ Required: Yes
   ├─ Default: 25
   └─ Range: 10-50

2. Melt Flow Index (MFI)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 0.1-10

3. Density (g/cm³)
   ├─ Type: Number
   ├─ Required: Yes
   ├─ Default: 0.92
   └─ Range: 0.90-0.95

4. Grade
   ├─ Type: Dropdown
   ├─ Options: Virgin, Recycled, Mix
   └─ Default: Virgin

5. Color Masterbatch
   ├─ Type: Dropdown
   ├─ Options: None, Included
   └─ Default: None

6. Supplier
   ├─ Type: Text
   └─ Required: No

7. Batch Number
   ├─ Type: Text
   └─ Required: No
```

#### Raw Material 2: Printing Ink
```
Option Type Name: Printing Ink
Code: RM-INK

Specifications:
1. Ink Color
   ├─ Type: Dropdown
   ├─ Options: Cyan, Magenta, Yellow, Black, White, Custom
   └─ Required: Yes

2. Ink Type
   ├─ Type: Dropdown
   ├─ Options: Solvent-based, Water-based
   └─ Required: Yes

3. Can Size (LTR)
   ├─ Type: Number
   ├─ Options: 1, 5, 10, 20
   └─ Required: Yes

4. Viscosity (seconds)
   ├─ Type: Number
   └─ Required: No

5. Batch Number
   ├─ Type: Text
   └─ Required: Yes

6. Expiry Date
   ├─ Type: Date
   └─ Required: Yes
```

#### Intermediate Product: LDPE Film Roll
```
(Already created above)
```

#### Finished Product 1: LDPE Bag (Plain)
```
Option Type Name: LDPE Bag Plain
Code: FG-BAG-PLAIN

Specifications:
1. Bag Length (mm)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 100-1000

2. Bag Width (mm)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 100-800

3. Gusset Width (mm)
   ├─ Type: Number
   ├─ Required: No
   ├─ Default: 0
   └─ Range: 0-200

4. Thickness (microns)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 15-100

5. Color
   ├─ Type: Dropdown
   ├─ Options: Natural, White, Black, Blue, Red
   └─ Required: Yes

6. Seal Type
   ├─ Type: Dropdown
   ├─ Options: Side Seal, Bottom Seal, Gusseted
   └─ Required: Yes

7. Perforation
   ├─ Type: Checkbox
   └─ Default: No

8. Handle Type
   ├─ Type: Dropdown
   ├─ Options: None, Loop Handle, D-Cut Handle, Punch Handle
   └─ Default: None

9. Packing (Bags per Bundle)
   ├─ Type: Number
   ├─ Default: 100
   └─ Range: 50-500
```

#### Finished Product 2: LDPE Bag (Printed)
```
Option Type Name: LDPE Bag Printed
Code: FG-BAG-PRINT

Specifications:
(All specifications from Plain Bag, PLUS:)

10. Printing Type
    ├─ Type: Dropdown
    ├─ Options: Flexo, Rotogravure
    └─ Required: Yes

11. Number of Colors
    ├─ Type: Dropdown
    ├─ Options: 1, 2, 3, 4, 5, 6
    └─ Required: Yes

12. Design Name/Code
    ├─ Type: Text
    ├─ Required: Yes
    └─ Max Length: 100

13. Design File Reference
    ├─ Type: Text
    └─ Required: No

14. Customer Logo
    ├─ Type: Checkbox
    └─ Default: Yes

15. Barcode
    ├─ Type: Checkbox
    └─ Default: No
```

---

### Example 2: Flexographic Printing - Complete Option Types

#### Raw Material: Unprinted Film
```
Option Type Name: Unprinted Substrate Film
Code: RM-FILM-SUB

Specifications:
1. Width (mm)
   ├─ Required: Yes
   └─ Range: 200-1500

2. Length (m)
   ├─ Required: Yes
   └─ Range: 500-5000

3. Material Type
   ├─ Type: Dropdown
   ├─ Options: LDPE, HDPE, PP, BOPP, PET
   └─ Required: Yes

4. Thickness (microns)
   ├─ Required: Yes
   └─ Range: 12-200

5. Treatment Level (Dynes)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 36-42

6. Corona Treated
   ├─ Type: Checkbox
   └─ Default: Yes

7. Core ID (mm)
   ├─ Type: Dropdown
   ├─ Options: 76mm (3"), 152mm (6")
   └─ Default: 76mm
```

#### Consumable: Printing Ink (See Example 1)

#### Finished Product: Printed Film Roll
```
Option Type Name: Printed Film Roll
Code: FG-PRINT-FILM

Specifications:
1-7: (Same as Unprinted Film)

8. Printing Process
   ├─ Type: Dropdown
   ├─ Options: Flexo, Rotogravure, Digital
   └─ Required: Yes

9. Number of Colors
   ├─ Type: Number
   ├─ Range: 1-10
   └─ Required: Yes

10. Design Name
    ├─ Type: Text
    ├─ Required: Yes

11. Customer Name
    ├─ Type: Text
    ├─ Required: Yes

12. Job Number
    ├─ Type: Text
    ├─ Required: Yes

13. Registration Mark
    ├─ Type: Checkbox
    └─ Default: Yes

14. Color Codes (Pantone/CMYK)
    ├─ Type: Text
    └─ Max Length: 200

15. Repeat Length (mm)
    ├─ Type: Number
    └─ Required: Yes (for rotogravure)
```

---

### Example 3: Steel Wire Processing

#### Raw Material: Steel Wire Coil
```
Option Type Name: Steel Wire Coil
Code: RM-STEEL-WIRE

Specifications:
1. Wire Diameter (mm)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 0.5-25

2. Coil Weight (kg)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 50-2000

3. Coil Length (m)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Calculated from weight and diameter

4. Steel Grade
   ├─ Type: Dropdown
   ├─ Options: Mild Steel, SS304, SS316, High Carbon
   └─ Required: Yes

5. Surface Finish
   ├─ Type: Dropdown
   ├─ Options: Bright, Black, Galvanized, Copper Coated
   └─ Required: Yes

6. Tensile Strength (N/mm²)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 300-2000

7. Coil ID (mm)
   ├─ Type: Number
   └─ Common: 400, 500, 600

8. Heat Number
   ├─ Type: Text
   ├─ Required: Yes (for traceability)

9. Mill Test Certificate
   ├─ Type: Text (Certificate number)
   └─ Required: Yes
```

#### Finished Product: Cut Wire Pieces
```
Option Type Name: Cut Wire Pieces
Code: FG-WIRE-CUT

Specifications:
1-5: (Inherit from raw material)

6. Cut Length (mm)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 50-6000

7. Pieces Per Bundle
   ├─ Type: Number
   ├─ Default: 100
   └─ Range: 10-1000

8. Bundle Weight (kg)
   ├─ Type: Number (calculated)

9. Tolerance (+/- mm)
   ├─ Type: Number
   ├─ Default: 2
   └─ Range: 0.5-10

10. Straightness
    ├─ Type: Dropdown
    ├─ Options: Standard, High Precision
    └─ Default: Standard
```

---

### Example 4: Corrugated Box Manufacturing

#### Raw Material: Kraft Paper Roll
```
Option Type Name: Kraft Paper Roll
Code: RM-KRAFT

Specifications:
1. Width (mm)
   ├─ Required: Yes
   └─ Range: 500-2000

2. GSM (grams per square meter)
   ├─ Type: Number
   ├─ Required: Yes
   ├─ Common: 120, 150, 180, 200, 250
   └─ Range: 80-400

3. Roll Diameter (mm)
   ├─ Type: Number
   └─ For calculating length

4. Core ID (mm)
   ├─ Type: Dropdown
   ├─ Options: 76mm, 152mm
   └─ Default: 76mm

5. Paper Type
   ├─ Type: Dropdown
   ├─ Options: Kraft Liner, Test Liner, Fluting Medium
   └─ Required: Yes

6. Burst Factor (BF)
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 12-35

7. Color
   ├─ Type: Dropdown
   ├─ Options: Natural Brown, White Top, Fully Bleached
   └─ Default: Natural Brown
```

#### Intermediate: Corrugated Sheet
```
Option Type Name: Corrugated Sheet
Code: WIP-CORRUGATED-SHEET

Specifications:
1. Sheet Length (mm)
   ├─ Required: Yes
   └─ Range: 300-3000

2. Sheet Width (mm)
   ├─ Required: Yes
   └─ Range: 200-2500

3. Flute Type
   ├─ Type: Dropdown
   ├─ Options: 3-ply (Single Wall), 5-ply (Double Wall), 7-ply (Triple Wall)
   └─ Required: Yes

4. Flute Profile
   ├─ Type: Dropdown
   ├─ Options: A-Flute, B-Flute, C-Flute, E-Flute, F-Flute
   └─ Required: Yes

5. Top Liner GSM
   ├─ Type: Number
   └─ Common: 120, 150, 180

6. Fluting GSM
   ├─ Type: Number
   └─ Common: 120, 125, 140

7. Bottom Liner GSM
   ├─ Type: Number
   └─ Common: 120, 150, 180

8. Overall GSM
   ├─ Type: Number (calculated)

9. Burst Strength (kg/cm²)
   ├─ Type: Number
   └─ Tested value

10. Customer Order Number
    ├─ Type: Text
```

#### Finished Product: Corrugated Box
```
Option Type Name: Corrugated Box
Code: FG-BOX

Specifications:
1. Box Length (mm) - Inside dimension
   ├─ Required: Yes
   └─ Range: 100-1500

2. Box Width (mm) - Inside dimension
   ├─ Required: Yes
   └─ Range: 100-1200

3. Box Height (mm) - Inside dimension
   ├─ Required: Yes
   └─ Range: 50-1000

4. Box Style
   ├─ Type: Dropdown
   ├─ Options: RSC (Regular Slotted Container), HSC (Half Slotted), Die Cut, Others
   └─ Required: Yes

5-9: (Same as Corrugated Sheet specs)

10. Printing
    ├─ Type: Dropdown
    ├─ Options: None, 1-Color, 2-Color, Multi-Color
    └─ Default: None

11. Box Load Capacity (kg)
    ├─ Type: Number
    └─ Maximum weight the box can hold

12. Stacking Strength (kg)
    ├─ Type: Number
    └─ Edge Crush Test (ECT) derived

13. Customer Name
    ├─ Type: Text

14. Product Description (to be packed)
    ├─ Type: Text
```

---

### Example 5: Garment Manufacturing - Fabric & Accessories

#### Raw Material 1: Fabric Roll
```
Option Type Name: Fabric Roll
Code: RM-FABRIC

Specifications:
1. Fabric Type
   ├─ Type: Dropdown
   ├─ Options: Cotton, Polyester, Cotton-Poly Blend, Linen, Silk, Rayon
   └─ Required: Yes

2. Width (inches)
   ├─ Type: Number
   ├─ Common: 36, 44, 54, 60
   └─ Required: Yes

3. Length (meters)
   ├─ Type: Number
   └─ Required: Yes

4. GSM
   ├─ Type: Number
   ├─ Required: Yes
   └─ Range: 80-400

5. Color
   ├─ Type: Text (or Dropdown)
   └─ Required: Yes

6. Design/Pattern
   ├─ Type: Text
   ├─ Options: Solid, Striped, Checked, Floral, Custom
   └─ Required: Yes

7. Finish
   ├─ Type: Dropdown
   ├─ Options: Raw, Dyed, Printed, Embroidered
   └─ Required: Yes

8. Quality Grade
   ├─ Type: Dropdown
   ├─ Options: A (Premium), B (Standard), C (Economy)
   └─ Default: B

9. Shrinkage (%)
   ├─ Type: Number
   └─ Common: 2-5%

10. Roll Number
    ├─ Type: Text
    └─ For tracking
```

#### Raw Material 2: Buttons
```
Option Type Name: Button
Code: ACC-BUTTON

Specifications:
1. Button Type
   ├─ Type: Dropdown
   ├─ Options: Plastic, Metal, Wood, Shell, Fabric-covered
   └─ Required: Yes

2. Size (mm)
   ├─ Type: Number
   ├─ Common: 10, 12, 15, 18, 20, 25
   └─ Required: Yes

3. Holes
   ├─ Type: Dropdown
   ├─ Options: 2-hole, 4-hole, Shank
   └─ Required: Yes

4. Color
   ├─ Type: Text
   └─ Required: Yes

5. Design Code
   ├─ Type: Text

6. Pack Quantity
   ├─ Type: Number
   ├─ Common: 100, 144 (gross), 1000
   └─ Default: 144
```

#### Raw Material 3: Zipper
```
Option Type Name: Zipper
Code: ACC-ZIPPER

Specifications:
1. Length (inches)
   ├─ Type: Number
   ├─ Common: 5, 7, 9, 12, 14, 18, 22
   └─ Required: Yes

2. Type
   ├─ Type: Dropdown
   ├─ Options: Metal, Nylon (Coil), Plastic (Vislon), Invisible
   └─ Required: Yes

3. Color
   ├─ Type: Text
   └─ Required: Yes

4. Zipper Closure
   ├─ Type: Dropdown
   ├─ Options: Open-end, Closed-end, Two-way
   └─ Required: Yes

5. Pull Type
   ├─ Type: Dropdown
   ├─ Options: Standard, Auto-lock, Pin-lock, Custom
   └─ Default: Standard

6. Pack Quantity
   ├─ Type: Number
   └─ Default: 100
```

#### Finished Product: Garment (Shirt Example)
```
Option Type Name: Men's Shirt
Code: FG-SHIRT-MENS

Specifications:
1. Size
   ├─ Type: Dropdown
   ├─ Options: XS, S, M, L, XL, XXL, XXXL
   └─ Required: Yes

2. Fabric Type
   ├─ Type: Dropdown
   ├─ Options: Cotton, Polyester, Blend
   └─ Required: Yes

3. Color
   ├─ Type: Text/Dropdown
   └─ Required: Yes

4. Pattern
   ├─ Type: Dropdown
   ├─ Options: Solid, Striped, Checked, Printed
   └─ Required: Yes

5. Collar Type
   ├─ Type: Dropdown
   ├─ Options: Regular, Button-down, Cutaway, Band
   └─ Required: Yes

6. Sleeve Length
   ├─ Type: Dropdown
   ├─ Options: Full Sleeve, Half Sleeve, Short Sleeve
   └─ Required: Yes

7. Number of Buttons
   ├─ Type: Number
   └─ Common: 6-8

8. Pocket
   ├─ Type: Dropdown
   ├─ Options: No Pocket, 1 Pocket, 2 Pockets
   └─ Default: 1 Pocket

9. Fit
   ├─ Type: Dropdown
   ├─ Options: Slim Fit, Regular Fit, Loose Fit
   └─ Default: Regular Fit

10. Customer/Brand
    ├─ Type: Text
    └─ Required: Yes

11. Style Number
    ├─ Type: Text
    └─ Required: Yes

12. Barcode/SKU
    ├─ Type: Text
```

---

## Specifications Deep Dive

### Specification Data Types

#### 1. Number

**When to use:**
- Measurements (width, length, thickness, weight)
- Counts (quantity, pieces)
- Percentages (shrinkage, tolerance)
- Technical values (GSM, density, tensile strength)

**Configuration options:**
```
Field Name: Width
Data Type: Number
Unit: mm (displayed next to input field)
Required: Yes/No
Default Value: 300
Minimum Value: 100
Maximum Value: 1500
Decimal Places: 0 (whole number) or 1, 2, 3
Formula Variable: width (auto-generated)
```

**Example uses:**
```
Width (mm): 300
Thickness (microns): 25.5
Weight (kg): 1250
GSM: 150
Quantity: 5000
```

---

#### 2. Text

**When to use:**
- Names (customer, design name, product code)
- Codes (batch number, job number, barcode)
- Notes (special instructions, remarks)
- Free-form descriptions

**Configuration options:**
```
Field Name: Batch Number
Data Type: Text
Required: Yes/No
Max Length: 50 characters
Default Value: (optional)
Validation: None / Alphanumeric / Custom regex
Formula Variable: Not applicable (can't use in formulas)
```

**Example uses:**
```
Batch Number: LOT-2024-001
Customer Name: ABC Industries
Design Name: Floral Print Blue
Special Instructions: Handle with care - fragile
Job Number: J-2024-0512
```

---

#### 3. Dropdown

**When to use:**
- Predefined choices (colors, grades, types)
- Standardized values (sizes, options)
- Limited selections (Yes/No alternatives, but use Checkbox instead)

**Configuration options:**
```
Field Name: Color
Data Type: Dropdown
Required: Yes/No
Options:
  - Natural
  - White
  - Black
  - Blue
  - Red
  - Custom
Default Value: Natural
Allow Multiple Selection: No (single choice only)
Formula Variable: Not applicable (categorical data)
```

**Example uses:**
```
Color: Blue (from dropdown)
Grade: Virgin / Recycled / Mix
Material: LDPE / HDPE / PP / PET
Size: S / M / L / XL / XXL
Quality: A / B / C
```

**Best practices:**
- Keep options clear and mutually exclusive
- Order logically (most common first, or alphabetical)
- Add "Other" or "Custom" option if needed
- Don't create too many options (>20 gets unwieldy)

---

#### 4. Checkbox

**When to use:**
- Yes/No values
- Binary choices (Present/Absent, Enabled/Disabled)
- Feature flags (Laminated, Printed, Perforated)

**Configuration options:**
```
Field Name: Laminated
Data Type: Checkbox
Required: No (checkbox is optional by nature)
Default Value: Unchecked / Checked
Label: "Is this product laminated?"
Formula Variable: Not applicable
```

**Example uses:**
```
☑ Laminated (Yes)
☐ UV Coating (No)
☑ Recyclable (Yes)
☐ Food Grade (No)
☑ Logo Printed (Yes)
```

---

#### 5. Date

**When to use:**
- Manufacturing dates
- Expiry dates
- Order due dates
- Delivery dates

**Configuration options:**
```
Field Name: Manufacturing Date
Data Type: Date
Required: Yes/No
Default Value: Today / Custom date / None
Min Date: (earliest allowed)
Max Date: (latest allowed)
Format: DD/MM/YYYY or MM/DD/YYYY
```

**Example uses:**
```
Manufacturing Date: 15/01/2024
Expiry Date: 15/01/2026
Due Date: 20/02/2024
```

---

### Required vs Optional Specifications

**Required specifications:**
- Must be filled when creating order/inventory entry
- System will not allow saving without these fields
- Mark with asterisk (*) in UI

**When to make required:**
```
Always required:
├─ Core product dimensions (width, length, thickness)
├─ Essential properties (material type, grade, color)
└─ Customer identification (for customer-specific products)

Can be optional:
├─ Tracking codes (batch number, job number)
├─ Additional notes
├─ Non-critical features
└─ Information that varies by use case
```

**Example:**
```
Option Type: LDPE Film Roll

Required:
├─ Width (mm) ✅ (Cannot produce without knowing width)
├─ Length (m) ✅ (Cannot produce without knowing length)
├─ Thickness (microns) ✅ (Critical specification)
└─ Color ✅ (Must be specified)

Optional:
├─ Batch Number ⚪ (Can be added later)
├─ Manufacturing Date ⚪ (Auto-filled if needed)
└─ Notes ⚪ (Not always needed)
```

---

## Integration with Other Modules

### 1. Integration with Orders

**How option types work in orders:**
```
Create Order:
1. Select Order Type (Manufacturing / Sales / Purchase)
2. Select Option Type (Product) → Shows option types linked to order type
3. Fill Specifications → Shows all specs defined for that option type
4. Quantity → Enter how many
5. Save → Order created with full product details
```

**Example:**
```
Order Type: Manufacturing Order
Option Type: LDPE Film Roll (selected)

Specifications auto-populate:
├─ Width: [300] mm
├─ Length: [1000] m
├─ Thickness: [25] microns
├─ Color: [Natural] ▼
└─ Grade: [Virgin] ▼

Quantity: 10 rolls
```

---

### 2. Integration with Inventory

**How option types work in inventory:**
```
Create Inventory:
1. Name inventory (e.g., "Raw Materials")
2. Link Option Types → Select which products to track
3. Select Specifications for Formulas → Check specs to use in calculations
4. Create Formulas → Use spec variables (width, length, thickness)
5. Save → Inventory tracking enabled

Add Inventory Entry:
1. Select Option Type
2. Fill Specifications
3. Formulas auto-calculate values
4. Save → Stock updated
```

**Example:**
```
Inventory: Raw Materials

Linked Option Types:
☑ LDPE Film Roll

Specifications for Formulas:
☑ Width (mm) → width
☑ Length (m) → length
☑ Thickness (microns) → thickness

Formula:
Film Area (SQM) = (width / 1000) * length
Film Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * 0.92

Add Stock:
├─ Option Type: LDPE Film Roll
├─ Width: 500 mm
├─ Length: 1000 m
├─ Thickness: 50 microns
├─ Calculated Area: 500 SQM
└─ Calculated Weight: 23 KG
```

---

### 3. Integration with View Templates

**How option types work in production:**
```
Create View Template:
1. Select Machine
2. Select Order Type
3. Select Option Types to display → Products for this machine
4. Configure columns (specs to show/enter)
5. Save → Operators see this view

Operator Production Entry:
1. Login → See assigned machine
2. View Template loads
3. See products (option types) available
4. Enter production data (specs)
5. Save → Production recorded
```

**Example:**
```
View Template: Extrusion Machine Production

Machine: Extrusion-001
Order Type: Manufacturing Order
Option Types Displayed:
☑ LDPE Film Roll
☐ HDPE Film Roll

Columns for LDPE Film Roll:
├─ Width (mm) → Operator enters
├─ Length (m) → Operator enters
├─ Thickness (microns) → Operator enters
├─ Color → Operator selects
├─ Quantity (Rolls) → Operator enters
└─ Total Area (SQM) → Auto-calculated: (width/1000) * length * quantity
```

---

### 4. Integration with Excel Export Types

**How option types work in exports:**
```
Create Excel Export Type:
1. Name export template
2. Link Option Types → Products to include in export
3. Link Specifications → Which specs to show as columns
4. Configure column order
5. Save → Export template ready

Export Orders:
1. Select date range / order type
2. Select Excel Export Type
3. Click Export
4. Excel file generated with spec columns
```

**Example:**
```
Excel Export Type: Daily Production Report

Linked Option Types:
☑ LDPE Film Roll
☑ LDPE Bag

Columns:
├─ Order Number
├─ Date
├─ Option Type (Product)
├─ Width (mm) → From specification
├─ Length/Bag Length (mm) → From specification
├─ Thickness (microns) → From specification
├─ Color → From specification
├─ Quantity
└─ Status

Export Result:
Excel file with all orders and their specifications as columns
```

---

## Best Practices

### 1. Option Type Naming

**DO:**
```
✅ LDPE Film Roll (Clear, descriptive)
✅ Printed Pouch 3-Side Seal (Specific)
✅ Corrugated Box RSC (Includes type)
✅ Steel Wire Galvanized (Includes finish)
```

**DON'T:**
```
❌ Film (Too generic)
❌ Product 1 (Not descriptive)
❌ Bag (What kind of bag?)
❌ Box (What material? What type?)
```

---

### 2. Specification Organization

**Order specifications logically:**
```
1. Core Dimensions (Width, Length, Height, Thickness)
2. Material Properties (Material Type, Grade, GSM)
3. Appearance (Color, Finish, Pattern)
4. Technical Specs (Strength, Density, Viscosity)
5. Production Details (Batch Number, Date)
6. Customer Info (Customer Name, Design Code)
7. Optional Features (Lamination, Printing, Coating)
8. Packing (Quantity per bundle/box)
```

**Example (well-organized):**
```
Option Type: LDPE Bag

Dimensions:
1. Bag Length (mm)
2. Bag Width (mm)
3. Gusset (mm)
4. Thickness (microns)

Material:
5. Material Type (LDPE/HDPE)
6. Grade (Virgin/Recycled)

Appearance:
7. Color
8. Printing (Yes/No)
9. Design Name (if printed)

Features:
10. Handle Type
11. Perforation
12. Seal Type

Packing:
13. Bags per Bundle
```

---

### 3. Using Dropdowns Effectively

**When to use dropdown vs text:**
```
Use Dropdown:
✅ Limited, predefined choices (Colors: Red, Blue, Green)
✅ Standardized values (Sizes: S, M, L, XL)
✅ Quality/Grade levels (A, B, C)
✅ Yes/No choices → Actually use Checkbox instead

Use Text:
✅ Customer names (varies widely)
✅ Design names (unique per customer)
✅ Batch numbers (alphanumeric codes)
✅ Special instructions (free-form)
```

**Dropdown best practices:**
```
✅ Keep options under 20 for usability
✅ Order logically (common first, or alphabetical)
✅ Use consistent naming (all caps vs title case)
✅ Add "Other" or "Custom" option for flexibility

❌ Don't create too many specific options
❌ Don't use dropdown for numeric values (use Number type)
❌ Don't make options too similar (confusing)
```

---

### 4. Formula-Ready Specifications

**Design specs for formula use:**
```
If you plan to use specifications in inventory formulas:

1. Use Number type (not Text or Dropdown)
2. Use consistent units (always mm, not mix of mm and cm)
3. Mark "Use in Formulas" during spec creation
4. Give clear field names (auto-generates good variable names)

Good Spec Names:
├─ "Width (mm)" → Variable: width
├─ "Length (m)" → Variable: length
├─ "Bag Weight (kg)" → Variable: bagWeight
└─ "Thickness (microns)" → Variable: thickness

Bad Spec Names:
├─ "W" → Variable: w (unclear)
├─ "Measurement 1" → Variable: measurement1 (unclear)
└─ "Size" → Variable: size (too generic)
```

---

### 5. Avoiding Over-Specification

**Don't create too many specs:**
```
❌ Too Many Specs (overwhelming):
1. Width
2. Width Tolerance +
3. Width Tolerance -
4. Measured Width
5. Target Width
6. Min Width
7. Max Width
... (30+ specifications)

✅ Right Amount (focused):
1. Width (mm) → Main specification
2. Tolerance (+/- mm) → One field for both directions
3. Quality Grade → Implies tighter or looser tolerances

Result: 3 specifications instead of 30
```

**Include only specifications that:**
- Actually vary between orders
- Are needed for production
- Affect costing/billing
- Are used in formulas
- Are required for quality control

---

### 6. Standardization Across Option Types

**Maintain consistency:**
```
If multiple option types have similar specs, use identical naming:

Option Type 1: LDPE Film Roll
├─ Width (mm)
├─ Length (m)
├─ Thickness (microns)
└─ Color

Option Type 2: HDPE Film Roll
├─ Width (mm) ← Same naming
├─ Length (m) ← Same naming
├─ Thickness (microns) ← Same naming
└─ Color ← Same naming

Benefits:
✅ Easier to understand
✅ Consistent formulas
✅ Better reporting
✅ Simpler training
```

---

## Troubleshooting

### Issue 1: Option Type Not Appearing in Orders

**Symptoms:**
- Created option type but can't see it when creating order

**Diagnosis:**
```
Check:
1. Is option type status "Active"?
2. Is option type linked to the order type being used?
3. Are you looking in the right order type?
```

**Solution:**
```
Step 1: Verify Option Type Status
1. Go to Create → Options System → View Option Types
2. Find your option type
3. Check status column → Should say "Active"
4. If "Inactive", edit and change to Active

Step 2: Link to Order Type
1. Edit Option Type
2. Scroll to "Allowed Order Types" section
3. Check the order types where this should appear:
   ☑ Manufacturing Order
   ☑ Sales Order
   ☑ Purchase Order
4. Save

Step 3: Try Creating Order Again
1. Create new order with correct order type
2. Option type should now appear in product dropdown
```

---

### Issue 2: Specification Not Usable in Formula

**Symptoms:**
- Created number specification but can't use it in inventory formula
- Variable name doesn't appear in formula builder

**Diagnosis:**
```
Specification not enabled for formulas
```

**Solution:**
```
Step 1: Edit Option Type
1. Go to Create → Options System → View Option Types
2. Find option type → Click Edit

Step 2: Enable Formula Use
1. Find the specification
2. Check box "Use in Formulas" or "Enable Formula Variable"
3. Note the variable name generated (e.g., width, length, thickness)
4. Save option type

Step 3: Verify in Inventory
1. Go to Create → Inventory → Edit Inventory (or create new)
2. In "Specifications for Formulas" section
3. Select the option type
4. Check the specification
5. Variable name should appear
6. Now use this variable in formulas
```

---

### Issue 3: Dropdown Options Need Updating

**Symptoms:**
- Need to add/remove/change dropdown options
- Existing orders have old values

**Diagnosis:**
```
Dropdown options can be updated, but affects:
- Future orders (will see new options)
- Existing orders (may show old values if option removed)
```

**Solution:**
```
Step 1: Edit Option Type
1. Find option type → Click Edit
2. Find dropdown specification
3. Click "Edit Options"

Step 2: Modify Options
Add new option:
├─ Click "+ Add Option"
└─ Enter new value

Remove option:
├─ Click "×" next to option
└─ Warning: Existing orders using this value will still show it

Change option:
├─ Edit the text directly
└─ Changes apply to new orders only

Step 3: Consider Impact
Before removing options:
1. Check if any existing orders use this value
2. If yes, keep option or create migration plan
3. If no, safe to remove

Best Practice:
Instead of removing, add new option and stop using old one
```

---

### Issue 4: Too Many Option Types Created

**Symptoms:**
- Dropdown lists are overwhelming
- Hard to find the right product
- Similar products duplicated

**Diagnosis:**
```
Over-creation of option types instead of using specifications
```

**Example of problem:**
```
❌ Bad Approach:
- LDPE Bag 200x300
- LDPE Bag 250x350
- LDPE Bag 300x400
- LDPE Bag 300x450
... (50 option types for size variations)

✅ Good Approach:
- LDPE Bag (1 option type)
  └─ Specifications:
     ├─ Bag Length (mm) → Operator enters 200, 250, 300, etc.
     └─ Bag Width (mm) → Operator enters 300, 350, 400, etc.
```

**Solution:**
```
Step 1: Identify Similar Option Types
1. List all option types
2. Group similar ones (e.g., all LDPE bags)
3. Identify what varies (usually dimensions)

Step 2: Create Master Option Type
1. Create one option type: "LDPE Bag"
2. Add specifications for all variations:
   ├─ Bag Length (mm) - Number
   ├─ Bag Width (mm) - Number
   ├─ Thickness (microns) - Number
   └─ Other varying properties

Step 3: Migrate Data (If needed)
1. Create new orders using master option type
2. Gradually phase out old option types
3. Set old option types to "Inactive" (don't delete)
4. Historical data remains intact

Step 4: Clean Up
After migration complete:
1. Archive old option types
2. Update documentation
3. Train team on new structure
```

---

### Issue 5: Formula Variable Name Conflict

**Symptoms:**
- Two specifications from different option types have same variable name
- Formula doesn't know which to use

**Example:**
```
Option Type 1: Film Roll
└─ Width (mm) → Variable: width

Option Type 2: Sheet
└─ Width (mm) → Variable: width

Conflict in inventory formula: width (which one?)
```

**Solution:**
```
Option 1: System Auto-Differentiates
Most systems append option type prefix:
├─ filmRollWidth (from Film Roll)
└─ sheetWidth (from Sheet)

Option 2: Rename Specifications
Make names unique:
├─ Film Width (mm) → Variable: filmWidth
└─ Sheet Width (mm) → Variable: sheetWidth

Option 3: Separate Inventories
Create separate inventories:
├─ Film Inventory (uses filmRollWidth)
└─ Sheet Inventory (uses sheetWidth)

Recommended: Option 2 (clearest approach)
```

---

## Conclusion

The Option System is the foundation of 27 Manufacturing that defines all products and materials in your workflow.

✅ **Flexible Product Definitions** - Create any product with custom specifications
✅ **Specification-Driven** - Track exactly what matters for each product
✅ **Formula Integration** - Use specs in automatic calculations
✅ **Module Integration** - Works seamlessly with orders, inventory, production
✅ **Industry Agnostic** - Adapt to any manufacturing process

**Key Success Factors:**
1. Plan your product catalog before creating option types
2. Use consistent specification naming across similar products
3. Enable formula variables for numeric specifications
4. Keep dropdown options manageable (under 20)
5. Mark truly required fields as required
6. Test with real orders after creating

**Next Steps:**
1. Document your product catalog
2. Create option types for all products/materials
3. Test by creating sample orders
4. Link option types to inventories
5. Configure view templates for production

---

**Document Version:** 1.0
**Last Updated:** 2026-01-18
**For:** 27 Manufacturing Platform
**Support:** Contact your system administrator for technical assistance
