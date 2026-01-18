# 📦 Inventory System - Complete Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
4. [Industry Examples](#industry-examples)
5. [Formula System](#formula-system)
6. [Integration with Production](#integration-with-production)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is the Inventory System?

The **Inventory System** in 27 Manufacturing is a flexible, specification-driven inventory management solution that allows you to:

- Track multiple types of inventory (Raw Materials, Finished Goods, WIP, Consumables)
- Link inventory to specific **Option Types** (products/materials)
- Define **specifications** for precise inventory tracking (dimensions, weight, color, grade)
- Create **dynamic calculations** using formulas for automatic quantity computation
- Track inventory in multiple **units** (KG, PCS, LTR, MTR, SQM, etc.)
- Integrate seamlessly with production orders and machine operations

```
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY SYSTEM                         │
│                                                             │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │ Option Types   │────────▶│   Inventory     │            │
│  │ (Products)     │         │   Records       │            │
│  └────────────────┘         └─────────────────┘            │
│          │                           │                      │
│          │                           │                      │
│          ▼                           ▼                      │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │ Specifications │────────▶│   Formulas      │            │
│  │ (Width, Length)│         │   (Auto Calc)   │            │
│  └────────────────┘         └─────────────────┘            │
│                                      │                      │
│                                      ▼                      │
│                             ┌─────────────────┐             │
│                             │ Inventory Units │             │
│                             │ (KG, PCS, MTR)  │             │
│                             └─────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. Inventory Types**
- Categories of inventory (e.g., "Raw Materials", "Finished Goods", "WIP")
- Each inventory type can track multiple option types
- Used for organizing and reporting

**2. Option Types (Products/Materials)**
- The actual products or materials being tracked
- Must be created BEFORE creating inventory
- Examples: LDPE Film, Printing Ink, Cardboard Boxes

**3. Specifications**
- Properties of products (Width, Length, Thickness, Color, Grade)
- Used for precise inventory identification
- Can be used in formulas for automatic calculations

**4. Dynamic Calculations**
- Formulas that automatically compute inventory quantities
- Use specifications as variables
- Examples: Area = Width × Length, Weight = Area × Thickness × Density

**5. Inventory Units**
- Units of measurement (KG, PCS, LTR, MTR, SQM, etc.)
- Multiple units can be tracked simultaneously
- Backend-configured units available for selection

---

## Prerequisites

Before creating inventory, ensure these are set up:

### 1. Option Types (Products/Materials)
**Location:** Create → Options System → Create Option Type

You need option types with specifications defined:

```
Example Option Type: LDPE Film Roll
├─ Name: LDPE Film Roll
├─ Code: LDPE-FILM
└─ Specifications:
   ├─ Width (mm) - Number
   ├─ Length (m) - Number
   ├─ Thickness (microns) - Number
   ├─ Color - Text
   └─ Grade - Text
```

### 2. Inventory Units (Backend Configuration)
Common units that should exist in your system:
- **KG** - Kilograms (weight)
- **PCS** - Pieces (count)
- **LTR** - Liters (volume)
- **MTR** - Meters (length)
- **SQM** - Square Meters (area)
- **ROLL** - Rolls (packaging)
- **BOX** - Boxes (packaging)

**Note:** If units are missing, contact your system administrator to add them via backend.

### 3. Understanding Your Production Flow
Map out what you need to track:
- Raw materials → What do you purchase?
- WIP (Work in Progress) → What's being manufactured?
- Finished goods → What do you sell/deliver?
- Consumables → What gets used up (ink, adhesive, etc.)?

---

## Step-by-Step Setup Guide

### Step 1: Plan Your Inventory Structure

**Before creating inventory, answer these questions:**

1. **What are you tracking?**
   - Raw materials (plastic granules, paper rolls, steel sheets)
   - Finished products (bags, boxes, printed materials)
   - WIP items (partially processed materials)
   - Consumables (ink, adhesive, packaging materials)

2. **What specifications matter?**
   - Dimensions (width, length, thickness)
   - Physical properties (weight, density, strength)
   - Appearance (color, finish, grade)
   - Quality (grade, batch number)

3. **How do you measure quantities?**
   - Weight (KG)
   - Count (PCS)
   - Length (MTR)
   - Area (SQM)
   - Volume (LTR)

### Step 2: Create Option Types

**Action:** Go to Create → Options System → Create Option Type

For each product/material, create an option type with relevant specifications.

**Example: LDPE Film Raw Material**

```
Option Type Details:
├─ Name: LDPE Film Roll
├─ Code: LDPE-FILM
├─ Category: Raw Materials
└─ Specifications:
   ├─ Width (mm) - Number - Required
   ├─ Length (m) - Number - Required
   ├─ Thickness (microns) - Number - Required
   ├─ Color - Dropdown (Natural/White/Black)
   └─ Grade - Dropdown (Virgin/Recycled)
```

**Repeat for all products/materials you need to track.**

### Step 3: Create Inventory

**Action:** Go to Create → Inventory Management → Create Inventory

#### 3.1 Basic Information

```
Name: Raw Material Inventory
Description: Tracking of all raw materials for plastic manufacturing
Status: Active
```

**Guidelines:**
- Use descriptive names (e.g., "Raw Materials - Plastic Films", "Finished Goods - Bags")
- Description helps team understand the inventory purpose
- Active = Currently in use, Inactive = Archived

#### 3.2 Link Option Types

Select which option types will be tracked in this inventory.

```
For "Raw Material Inventory", select:
☑ LDPE Film Roll
☑ HDPE Granules
☑ Color Masterbatch
☑ Adhesive Resin
```

**Why this matters:**
- Only linked option types can be added to this inventory
- Helps organize inventory by category
- Enables specification-based tracking

#### 3.3 Select Specifications for Formulas

Choose specifications that will be used in calculations.

```
From LDPE Film Roll:
☑ Width (mm) → Variable name: width
☑ Length (m) → Variable name: length
☑ Thickness (microns) → Variable name: thickness

From HDPE Granules:
☑ Bag Weight (kg) → Variable name: bagWeight
```

**Variable Names:**
- Automatically generated (e.g., "width", "length")
- Used in formulas
- Must be unique

#### 3.4 Create Dynamic Calculations

Add formulas for automatic quantity computation.

**Example 1: Film Area Calculation**
```
Field Name: Total Area
Formula: (width / 1000) * length
Result Unit: SQM
Description: Calculate total film area in square meters
```

**Example 2: Film Weight Calculation**
```
Field Name: Net Weight
Formula: ((width / 1000) * length) * (thickness / 1000) * 0.92
Result Unit: KG
Description: Calculate film weight (0.92 = LDPE density g/cm³)
```

**Formula Syntax:**
- Use specification variable names: `width`, `length`, `thickness`
- Standard operators: `+`, `-`, `*`, `/`, `(`, `)`
- Numbers can be decimals: `0.92`, `1000`

#### 3.5 Select Inventory Units

Choose which units to track.

```
For Raw Material Inventory:
☑ KG (weight tracking)
☑ MTR (length tracking)
☑ SQM (area tracking)
☑ ROLL (packaging count)
```

**Why multiple units?**
- Purchase in ROLL, track in KG and SQM
- Different stakeholders need different views
- Enables conversion and reporting flexibility

### Step 4: Save and Test

1. Click **Create Inventory**
2. Navigate to Inventory Management → View Inventory
3. Add a test inventory entry
4. Verify calculations work correctly
5. Adjust formulas if needed (Edit Inventory)

---

## Industry Examples

### Example 1: LDPE Bag Manufacturing - Raw Materials

**Business Context:**
Plastic bag manufacturer needs to track raw material inventory including LDPE film rolls, color masterbatch, and printing ink.

**Setup:**

#### Option Types Created:
```
1. LDPE Film Roll
   ├─ Width (mm)
   ├─ Length (m)
   ├─ Thickness (microns)
   ├─ Color (Natural/White/Black)
   └─ Grade (Virgin/Recycled)

2. Color Masterbatch
   ├─ Color Name
   ├─ Bag Weight (kg)
   └─ Supplier Code

3. Printing Ink
   ├─ Ink Type (Solvent/Water-based)
   ├─ Color
   ├─ Can Size (LTR)
   └─ Batch Number
```

#### Inventory Configuration:
```
Inventory Name: Raw Materials - Plastic Manufacturing
Linked Option Types: LDPE Film Roll, Color Masterbatch, Printing Ink

Specifications for Formulas:
From LDPE Film Roll:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ Thickness (microns) → thickness

From Color Masterbatch:
  ☑ Bag Weight (kg) → bagWeight

Dynamic Calculations:
1. Film Area (SQM) = (width / 1000) * length
2. Film Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * 0.92
3. Masterbatch Total (KG) = bagWeight * 1

Inventory Units: KG, PCS, MTR, SQM, ROLL
```

**Usage:**
- Receive LDPE film roll: Enter width, length, thickness → Auto-calculates area and weight
- Receive masterbatch: Enter bag weight → Tracks in KG
- Receive ink: Enter can size → Tracks in LTR and PCS (cans)

---

### Example 2: Flexo Printing - Finished Goods Inventory

**Business Context:**
Printing company needs to track finished printed rolls with specifications for width, length, design, and color count.

**Setup:**

#### Option Types Created:
```
Printed Roll (Finished)
├─ Width (mm)
├─ Length (m)
├─ Design Name
├─ Color Count (1-8 colors)
├─ Substrate (LDPE/HDPE/PP)
└─ Customer Name
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Printed Rolls
Linked Option Types: Printed Roll (Finished)

Specifications for Formulas:
  ☑ Width (mm) → width
  ☑ Length (m) → length

Dynamic Calculations:
1. Total Area (SQM) = (width / 1000) * length
2. Linear Meters (MTR) = length * 1

Inventory Units: ROLL, MTR, SQM
```

**Usage:**
- Production completes printed roll → Add to inventory with width, length, design
- Auto-calculates total area for billing
- Track rolls by customer and design

---

### Example 3: Steel Wire Processing - Multiple Unit Tracking

**Business Context:**
Wire processing unit receives steel wire in coils, processes it, and needs to track by weight (MT), length (MTR), and coil count.

**Setup:**

#### Option Types Created:
```
Steel Wire Coil
├─ Wire Diameter (mm)
├─ Coil Weight (kg)
├─ Coil Length (m)
├─ Steel Grade (SS304/SS316/Mild Steel)
└─ Surface Finish (Bright/Black)
```

#### Inventory Configuration:
```
Inventory Name: Raw Materials - Steel Wire
Linked Option Types: Steel Wire Coil

Specifications for Formulas:
  ☑ Coil Weight (kg) → coilWeight
  ☑ Coil Length (m) → coilLength

Dynamic Calculations:
1. Total Weight (MT) = coilWeight / 1000
2. Total Length (MTR) = coilLength * 1

Inventory Units: KG, MT, MTR, PCS (coils)
```

**Usage:**
- Receive wire coil → Enter coil weight and length
- Track in multiple units: 50 coils = 1250 KG = 1.25 MT = 25000 MTR
- Reports can show any unit based on requirement

---

### Example 4: Corrugated Box Manufacturing - WIP Tracking

**Business Context:**
Box manufacturer needs to track work-in-progress corrugated sheets between corrugation and box making.

**Setup:**

#### Option Types Created:
```
Corrugated Sheet (WIP)
├─ Sheet Length (mm)
├─ Sheet Width (mm)
├─ Flute Type (3-ply/5-ply/7-ply)
├─ GSM (grams per square meter)
└─ Customer Order Number
```

#### Inventory Configuration:
```
Inventory Name: WIP - Corrugated Sheets
Linked Option Types: Corrugated Sheet (WIP)

Specifications for Formulas:
  ☑ Sheet Length (mm) → length
  ☑ Sheet Width (mm) → width
  ☑ GSM → gsm

Dynamic Calculations:
1. Sheet Area (SQM) = (length / 1000) * (width / 1000)
2. Sheet Weight (KG) = ((length / 1000) * (width / 1000)) * (gsm / 1000)

Inventory Units: PCS, SQM, KG
```

**Usage:**
- Corrugation machine produces sheets → Add to WIP inventory
- Track sheet count, total area, and estimated weight
- Box making machine consumes from WIP inventory

---

### Example 5: Food Packaging - Multi-Layer Film Inventory

**Business Context:**
Food packaging manufacturer produces multi-layer laminated films and needs to track by layer composition, barrier properties, and dimensions.

**Setup:**

#### Option Types Created:
```
Multi-Layer Laminated Film
├─ Width (mm)
├─ Length (m)
├─ Total Thickness (microns)
├─ Layer Structure (e.g., PET/AL/PE)
├─ Barrier Type (Oxygen/Moisture/Light)
├─ Application (Snacks/Pharma/Dairy)
└─ Customer Name
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Laminated Films
Linked Option Types: Multi-Layer Laminated Film

Specifications for Formulas:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ Total Thickness (microns) → thickness

Dynamic Calculations:
1. Film Area (SQM) = (width / 1000) * length
2. Estimated Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * 1.1

Inventory Units: ROLL, MTR, SQM, KG
```

**Note:** 1.1 is average density for multi-layer films (varies by composition)

---

### Example 6: Textile Manufacturing - Fabric Roll Inventory

**Business Context:**
Textile manufacturer needs to track fabric rolls by width, length, GSM, and color for garment production.

**Setup:**

#### Option Types Created:
```
Fabric Roll
├─ Fabric Type (Cotton/Polyester/Blend)
├─ Width (inches)
├─ Length (meters)
├─ GSM (grams per square meter)
├─ Color
├─ Design/Pattern
└─ Quality Grade (A/B/C)
```

#### Inventory Configuration:
```
Inventory Name: Raw Materials - Fabric Rolls
Linked Option Types: Fabric Roll

Specifications for Formulas:
  ☑ Width (inches) → width
  ☑ Length (meters) → length
  ☑ GSM → gsm

Dynamic Calculations:
1. Fabric Area (SQM) = (width * 0.0254) * length
2. Fabric Weight (KG) = ((width * 0.0254) * length) * (gsm / 1000)

Inventory Units: ROLL, MTR, SQM, KG
```

**Usage:**
- Receive fabric rolls from supplier or own weaving
- Track by roll count, total meters, area, and weight
- Cutting department consumes based on garment requirements

---

### Example 7: Aluminum Foil Production - Jumbo Roll to Slit Roll

**Business Context:**
Aluminum foil manufacturer receives jumbo rolls, slits them into smaller widths, and needs to track both.

**Setup:**

#### Option Types Created:
```
Aluminum Foil Jumbo Roll (Raw Material)
├─ Width (mm)
├─ Length (m)
├─ Thickness (microns)
├─ Alloy Grade (8011/1235/3003)
├─ Temper (O/H14/H18)
└─ Core ID (mm)

Aluminum Foil Slit Roll (Finished Goods)
├─ Width (mm)
├─ Length (m)
├─ Thickness (microns)
├─ Alloy Grade
└─ Customer Order Number
```

#### Inventory Configuration 1:
```
Inventory Name: Raw Materials - Jumbo Rolls
Linked Option Types: Aluminum Foil Jumbo Roll

Specifications for Formulas:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ Thickness (microns) → thickness

Dynamic Calculations:
1. Roll Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * 2.7
   (2.7 = aluminum density g/cm³)

Inventory Units: ROLL, KG, MTR
```

#### Inventory Configuration 2:
```
Inventory Name: Finished Goods - Slit Rolls
Linked Option Types: Aluminum Foil Slit Roll

Specifications for Formulas:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ Thickness (microns) → thickness

Dynamic Calculations:
1. Roll Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * 2.7

Inventory Units: ROLL, KG, MTR
```

**Usage:**
- Receive jumbo rolls → Add to raw materials
- Slitting machine produces smaller rolls → Add to finished goods
- Track weight conversion and yield

---

### Example 8: Paper Cup Manufacturing - Component Inventory

**Business Context:**
Paper cup manufacturer needs to track paper board sheets, PE coating material, and finished cup blanks.

**Setup:**

#### Option Types Created:
```
Paper Board Sheet
├─ Sheet Length (mm)
├─ Sheet Width (mm)
├─ GSM
├─ Coating Type (PE/PLA/Uncoated)
└─ Supplier

PE Coating Granules
├─ Bag Weight (kg)
├─ Melt Index
└─ Grade (LDPE/HDPE)

Cup Blank (Die-cut)
├─ Cup Size (oz)
├─ Blank Diameter (mm)
├─ Sheet Count
└─ Customer Order
```

#### Inventory Configuration:
```
Inventory Name: Raw Materials - Paper & Coating
Linked Option Types: Paper Board Sheet, PE Coating Granules

Specifications for Formulas:
From Paper Board Sheet:
  ☑ Sheet Length (mm) → length
  ☑ Sheet Width (mm) → width
  ☑ GSM → gsm

From PE Coating Granules:
  ☑ Bag Weight (kg) → bagWeight

Dynamic Calculations:
1. Paper Weight (KG) = ((length / 1000) * (width / 1000)) * (gsm / 1000)
2. Coating Total (KG) = bagWeight * 1

Inventory Units: PCS (sheets), KG, BUNDLE
```

**Usage:**
- Receive paper board → Auto-calculate weight from dimensions
- Track PE coating granules by bag weight
- Monitor raw material consumption vs cup production

---

### Example 9: Injection Molding - Granules and Finished Parts

**Business Context:**
Plastic injection molding unit tracks raw granules and finished molded parts with cavities consideration.

**Setup:**

#### Option Types Created:
```
Plastic Granules
├─ Material Type (PP/PE/ABS/Nylon)
├─ Bag Weight (kg)
├─ Grade (Virgin/Recycled)
├─ Melt Flow Index
└─ Color

Molded Part (Finished)
├─ Part Name
├─ Part Weight (grams)
├─ Cavity Count (1-32)
├─ Material Used
└─ Customer
```

#### Inventory Configuration 1:
```
Inventory Name: Raw Materials - Plastic Granules
Linked Option Types: Plastic Granules

Specifications for Formulas:
  ☑ Bag Weight (kg) → bagWeight

Dynamic Calculations:
1. Total Weight (KG) = bagWeight * 1

Inventory Units: KG, BAG
```

#### Inventory Configuration 2:
```
Inventory Name: Finished Goods - Molded Parts
Linked Option Types: Molded Part (Finished)

Specifications for Formulas:
  ☑ Part Weight (grams) → partWeight
  ☑ Cavity Count → cavities

Dynamic Calculations:
1. Parts Per KG = 1000 / partWeight
2. Shot Weight (grams) = partWeight * cavities

Inventory Units: PCS, KG, BOX
```

**Usage:**
- Track granules consumption by weight
- Track finished parts by piece count
- Calculate material efficiency (input KG vs output PCS)

---

### Example 10: Blown Film Extrusion - Resin to Film Roll

**Business Context:**
Film extrusion unit tracks resin granules (input) and blown film rolls (output) with yield monitoring.

**Setup:**

#### Option Types Created:
```
LDPE/LLDPE Resin
├─ Bag Weight (kg)
├─ Resin Grade (Film/Injection)
├─ Melt Index
├─ Density (g/cm³)
└─ Supplier

Blown Film Roll
├─ Width (mm)
├─ Length (m)
├─ Thickness (microns)
├─ Film Type (LDPE/LLDPE/Blend)
└─ Additive (Slip/Anti-block)
```

#### Inventory Configuration:
```
Inventory Name: Production Flow - Resin to Film
Linked Option Types: LDPE/LLDPE Resin, Blown Film Roll

Specifications for Formulas:
From Resin:
  ☑ Bag Weight (kg) → resinWeight
  ☑ Density (g/cm³) → density

From Film Roll:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ Thickness (microns) → thickness

Dynamic Calculations:
1. Resin Total (KG) = resinWeight * 1
2. Film Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * density
3. Film Area (SQM) = (width / 1000) * length

Inventory Units: KG, ROLL, MTR, SQM
```

**Usage:**
- Track resin input in KG
- Track film output in ROLL, MTR, SQM, KG
- Monitor conversion efficiency: Input Resin KG vs Output Film KG

---

### Example 11: Zipper Pouch Manufacturing - Multi-Component

**Business Context:**
Zipper pouch manufacturer tracks laminated film, zippers, and finished pouches with size variations.

**Setup:**

#### Option Types Created:
```
Laminated Film for Pouches
├─ Width (mm)
├─ Length (m)
├─ Film Structure (PET/PE, OPP/PE)
├─ Thickness (microns)
└─ Print Design

Zipper Roll
├─ Zipper Type (PE/PP)
├─ Width (mm)
├─ Length (m)
├─ Color
└─ Profile Type

Finished Zipper Pouch
├─ Pouch Length (mm)
├─ Pouch Width (mm)
├─ Zipper Included (Yes/No)
├─ Design Name
└─ Customer
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Zipper Pouches
Linked Option Types: Finished Zipper Pouch

Specifications for Formulas:
  ☑ Pouch Length (mm) → pouchLength
  ☑ Pouch Width (mm) → pouchWidth

Dynamic Calculations:
1. Pouch Area (SQM) = ((pouchLength / 1000) * (pouchWidth / 1000)) * 2
   (× 2 for front and back)
2. Pouches Per SQM = 1 / (((pouchLength / 1000) * (pouchWidth / 1000)) * 2)

Inventory Units: PCS, BOX, CARTON
```

**Usage:**
- Track raw materials (film, zipper) separately
- Track finished pouches by piece count
- Calculate film consumption based on pouch dimensions

---

### Example 12: Non-Woven Fabric - Roll Production

**Business Context:**
Non-woven fabric manufacturer produces rolls from polypropylene granules and needs to track by weight, area, and GSM.

**Setup:**

#### Option Types Created:
```
Polypropylene Granules
├─ Bag Weight (kg)
├─ Melt Flow Index
├─ Grade (Spunbond/Meltblown)
└─ Color Masterbatch Included

Non-Woven Fabric Roll
├─ Width (mm)
├─ Length (m)
├─ GSM (grams per square meter)
├─ Color
├─ Finish Type (Soft/Stiff)
└─ Application (Medical/Agriculture/Packaging)
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Non-Woven Rolls
Linked Option Types: Non-Woven Fabric Roll

Specifications for Formulas:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ GSM → gsm

Dynamic Calculations:
1. Roll Area (SQM) = (width / 1000) * length
2. Roll Weight (KG) = ((width / 1000) * length) * (gsm / 1000)

Inventory Units: ROLL, KG, SQM, MTR
```

**Usage:**
- Production enters roll dimensions and GSM
- System auto-calculates area and weight
- Track by roll count for packaging, by area for sales, by weight for yield

---

### Example 13: Rotogravure Printing - Ink Consumption Tracking

**Business Context:**
Rotogravure printing facility needs to track printing ink inventory by color, batch, and usage for cost analysis.

**Setup:**

#### Option Types Created:
```
Rotogravure Ink
├─ Ink Color
├─ Can Size (LTR)
├─ Ink Type (Solvent/Water-based)
├─ Batch Number
├─ Viscosity
└─ Supplier

Printed Substrate Roll
├─ Width (mm)
├─ Length (m)
├─ Substrate Type (PET/BOPP/Paper)
├─ Design Name
├─ Color Count (1-10)
└─ Customer
```

#### Inventory Configuration:
```
Inventory Name: Consumables - Printing Inks
Linked Option Types: Rotogravure Ink

Specifications for Formulas:
  ☑ Can Size (LTR) → canSize

Dynamic Calculations:
1. Total Liters (LTR) = canSize * 1

Inventory Units: LTR, CAN, KG
```

**Usage:**
- Track ink by color and batch number
- Monitor consumption per print job
- Calculate ink cost per square meter printed

---

### Example 14: Garment Manufacturing - Accessory Inventory

**Business Context:**
Garment manufacturer tracks buttons, zippers, labels, and packaging materials for different product lines.

**Setup:**

#### Option Types Created:
```
Button
├─ Button Type (Plastic/Metal/Wood)
├─ Size (mm)
├─ Color
├─ Design Code
└─ Pack Quantity

Zipper
├─ Length (inches)
├─ Type (Metal/Nylon/Invisible)
├─ Color
├─ Pull Type
└─ Pack Quantity

Woven Label
├─ Width (mm)
├─ Length (mm)
├─ Design
├─ Roll Length (m)
└─ Customer Name
```

#### Inventory Configuration:
```
Inventory Name: Accessories - Garment Components
Linked Option Types: Button, Zipper, Woven Label

Specifications for Formulas:
From Button:
  ☑ Pack Quantity → btnPackQty

From Zipper:
  ☑ Pack Quantity → zipPackQty

From Label:
  ☑ Roll Length (m) → labelRollLength

Dynamic Calculations:
1. Button Total (PCS) = btnPackQty * 1
2. Zipper Total (PCS) = zipPackQty * 1
3. Label Length (MTR) = labelRollLength * 1

Inventory Units: PCS, PACK, ROLL, MTR
```

**Usage:**
- Receive accessories in packs
- Track individual piece count
- Monitor consumption per garment type

---

### Example 15: PET Bottle Blow Molding - Preform to Bottle

**Business Context:**
Bottle manufacturer tracks PET preforms (input) and blown bottles (output) with different sizes and colors.

**Setup:**

#### Option Types Created:
```
PET Preform
├─ Weight (grams)
├─ Neck Finish (mm)
├─ Color (Clear/Amber/Green)
├─ Application (Water/CSD/Oil)
└─ Box Quantity

PET Bottle (Blown)
├─ Capacity (ml)
├─ Bottle Weight (grams)
├─ Neck Finish (mm)
├─ Color
├─ Customer
└─ Box Quantity
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - PET Bottles
Linked Option Types: PET Bottle (Blown)

Specifications for Formulas:
  ☑ Bottle Weight (grams) → bottleWeight
  ☑ Box Quantity → boxQty

Dynamic Calculations:
1. Bottles Per KG = 1000 / bottleWeight
2. Total Bottles (PCS) = boxQty * 1

Inventory Units: PCS, BOX, KG
```

**Usage:**
- Track preforms by weight and piece count
- Track bottles by capacity and piece count
- Monitor blow molding efficiency

---

### Example 16: Tissue Paper Converting - Jumbo to Finished Rolls

**Business Context:**
Tissue paper converter receives jumbo rolls, converts them to smaller rolls/sheets, and needs to track conversion yield.

**Setup:**

#### Option Types Created:
```
Tissue Jumbo Roll
├─ Width (mm)
├─ Diameter (mm)
├─ Core ID (mm)
├─ GSM
├─ Ply Count (1/2/3)
└─ Grade (Virgin/Recycled)

Finished Tissue Roll
├─ Width (mm)
├─ Sheets Per Roll
├─ Sheet Size (mm)
├─ Ply Count
└─ Brand Name

Tissue Sheet Pack
├─ Sheet Size (mm)
├─ Sheets Per Pack
├─ Ply Count
└─ Brand Name
```

#### Inventory Configuration:
```
Inventory Name: Production Flow - Tissue Converting
Linked Option Types: Tissue Jumbo Roll, Finished Tissue Roll, Tissue Sheet Pack

Specifications for Formulas:
From Jumbo:
  ☑ Width (mm) → jumboWidth
  ☑ Diameter (mm) → jumboDiameter

From Finished Roll:
  ☑ Sheets Per Roll → sheetsPerRoll

From Sheet Pack:
  ☑ Sheets Per Pack → sheetsPerPack

Dynamic Calculations:
1. Jumbo Length (MTR) = 3.14 * ((jumboDiameter / 2) ^ 2) / jumboWidth
2. Finished Rolls = sheetsPerRoll * 1
3. Sheet Packs = sheetsPerPack * 1

Inventory Units: ROLL, PACK, MTR, PCS
```

**Note:** Jumbo length calculation is approximate based on roll diameter.

---

### Example 17: Aluminum Profile Extrusion - Length-Based Tracking

**Business Context:**
Aluminum extrusion company produces profiles in various lengths and needs to track by weight, length, and piece count.

**Setup:**

#### Option Types Created:
```
Aluminum Profile
├─ Profile Code (e.g., P-1001)
├─ Section Dimensions (mm)
├─ Length (mm)
├─ Alloy (6061/6063/6082)
├─ Temper (T4/T5/T6)
├─ Surface Finish (Mill/Anodized/Powder)
├─ Weight Per Meter (kg/m)
└─ Customer
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Aluminum Profiles
Linked Option Types: Aluminum Profile

Specifications for Formulas:
  ☑ Length (mm) → length
  ☑ Weight Per Meter (kg/m) → weightPerMeter

Dynamic Calculations:
1. Profile Length (MTR) = length / 1000
2. Profile Weight (KG) = (length / 1000) * weightPerMeter

Inventory Units: PCS, MTR, KG, BUNDLE
```

**Usage:**
- Extrusion produces profiles of specific lengths
- Track by piece count, total length, and weight
- Bundle profiles for delivery

---

### Example 18: Stretch Film Production - Width and Micron Variations

**Business Context:**
Stretch film manufacturer produces films in various widths and micron thickness with high volume tracking.

**Setup:**

#### Option Types Created:
```
Stretch Film Roll
├─ Width (mm)
├─ Length (m)
├─ Thickness (microns)
├─ Film Type (Machine/Hand)
├─ Core Size (inches)
├─ Color (Clear/Black/Colored)
└─ Grade (Standard/Heavy Duty)
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Stretch Film
Linked Option Types: Stretch Film Roll

Specifications for Formulas:
  ☑ Width (mm) → width
  ☑ Length (m) → length
  ☑ Thickness (microns) → thickness

Dynamic Calculations:
1. Film Area (SQM) = (width / 1000) * length
2. Film Weight (KG) = ((width / 1000) * length) * (thickness / 1000) * 0.92

Inventory Units: ROLL, KG, MTR, SQM
```

**Usage:**
- High-volume production tracking
- Multiple width variations (250mm to 500mm)
- Weight calculation for freight and billing

---

### Example 19: Paper Bag Manufacturing - Size and Handle Variations

**Business Context:**
Paper bag manufacturer produces bags in different sizes with/without handles and needs to track inventory accordingly.

**Setup:**

#### Option Types Created:
```
Paper Bag
├─ Length (mm)
├─ Width (mm)
├─ Gusset (mm)
├─ Paper GSM
├─ Handle Type (None/Twisted/Flat)
├─ Print Design
├─ Finish (Matt/Glossy)
└─ Customer
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Paper Bags
Linked Option Types: Paper Bag

Specifications for Formulas:
  ☑ Length (mm) → length
  ☑ Width (mm) → width
  ☑ Gusset (mm) → gusset
  ☑ Paper GSM → gsm

Dynamic Calculations:
1. Bag Area (SQM) = (((length * width * 2) + (width * gusset * 2)) / 1000000)
2. Bag Weight (kg) = (((length * width * 2) + (width * gusset * 2)) / 1000000) * (gsm / 1000)

Inventory Units: PCS, BUNDLE, CARTON, KG
```

**Usage:**
- Track bag inventory by size and design
- Calculate paper consumption
- Monitor production vs customer orders

---

### Example 20: Flexographic Printing Plate Inventory

**Business Context:**
Printing company needs to track printing plates (cylinders/plates) for repeat jobs and customer-specific designs.

**Setup:**

#### Option Types Created:
```
Flexo Printing Plate
├─ Plate Type (Cylinder/Flat)
├─ Size/Circumference (mm)
├─ Design Code
├─ Customer Name
├─ Color/Station
├─ Repeat Length (mm)
├─ Storage Location
└─ Last Used Date
```

#### Inventory Configuration:
```
Inventory Name: Production Assets - Printing Plates
Linked Option Types: Flexo Printing Plate

Specifications for Formulas:
  ☑ Circumference (mm) → circumference

Dynamic Calculations:
1. Plate Size (MTR) = circumference / 1000

Inventory Units: PCS, SET
```

**Usage:**
- Track plates by customer and design
- Locate plates for repeat orders
- Monitor plate usage and maintenance schedule

---

### Example 21: Adhesive/Glue Inventory for Lamination

**Business Context:**
Lamination facility uses different types of adhesives (solvent-based, solventless, water-based) and needs to track consumption.

**Setup:**

#### Option Types Created:
```
Adhesive/Glue
├─ Adhesive Type (Solvent-based/Solventless/Water-based)
├─ Component (Single/Part A/Part B)
├─ Drum Size (kg)
├─ Batch Number
├─ Viscosity
├─ Application (Dry Lamination/Wet Lamination/Extrusion Coating)
└─ Supplier
```

#### Inventory Configuration:
```
Inventory Name: Consumables - Lamination Adhesives
Linked Option Types: Adhesive/Glue

Specifications for Formulas:
  ☑ Drum Size (kg) → drumSize

Dynamic Calculations:
1. Total Weight (KG) = drumSize * 1

Inventory Units: KG, DRUM, LTR
```

**Usage:**
- Track adhesive by type and batch
- Monitor consumption per lamination job
- Calculate adhesive cost per SQM laminated

---

### Example 22: Label Sticker Inventory - Die-Cut Labels

**Business Context:**
Label printing and die-cutting company produces stickers/labels in various shapes and sizes on rolls.

**Setup:**

#### Option Types Created:
```
Label Sticker Roll
├─ Label Shape (Round/Square/Custom)
├─ Label Length (mm)
├─ Label Width (mm)
├─ Roll Width (mm)
├─ Labels Per Roll
├─ Material (Paper/Vinyl/PET)
├─ Adhesive Type (Permanent/Removable)
├─ Design Name
└─ Customer
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Label Stickers
Linked Option Types: Label Sticker Roll

Specifications for Formulas:
  ☑ Label Length (mm) → labelLength
  ☑ Label Width (mm) → labelWidth
  ☑ Labels Per Roll → labelsPerRoll

Dynamic Calculations:
1. Total Labels (PCS) = labelsPerRoll * 1
2. Label Area Each (SQM) = (labelLength / 1000) * (labelWidth / 1000)

Inventory Units: ROLL, PCS (labels), MTR
```

**Usage:**
- Track labels by design and customer
- Monitor label count per roll
- Calculate material usage and waste

---

### Example 23: Woven Sack/HDPE Bag Manufacturing

**Business Context:**
HDPE/PP woven sack manufacturer produces bags for cement, fertilizer, and grain packaging with varying sizes and lamination options.

**Setup:**

#### Option Types Created:
```
Woven Sack/Bag
├─ Length (cm)
├─ Width (cm)
├─ Fabric GSM
├─ Lamination (Yes/No)
├─ Print Colors (0-6)
├─ Bag Type (Open Mouth/Valve)
├─ Application (Cement/Fertilizer/Grain)
└─ Customer
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Woven Sacks
Linked Option Types: Woven Sack/Bag

Specifications for Formulas:
  ☑ Length (cm) → length
  ☑ Width (cm) → width
  ☑ Fabric GSM → gsm

Dynamic Calculations:
1. Bag Area (SQM) = ((length / 100) * (width / 100)) * 2
2. Bag Weight (kg) = (((length / 100) * (width / 100)) * 2) * (gsm / 1000)

Inventory Units: PCS, BUNDLE (1000 pcs), KG
```

**Usage:**
- Track bags by size and specification
- Bundle bags for delivery (typically 1000 pcs per bundle)
- Calculate fabric consumption and production efficiency

---

### Example 24: Offset/Digital Paper Printing - Sheet Inventory

**Business Context:**
Commercial printing press tracks printed sheets for books, brochures, and marketing materials.

**Setup:**

#### Option Types Created:
```
Printed Sheet
├─ Sheet Size (A4/A3/Custom)
├─ Length (mm)
├─ Width (mm)
├─ Paper GSM
├─ Paper Type (Matte/Glossy/Art Paper)
├─ Print Colors (1C/4C/4C+4C)
├─ Job Name
├─ Customer
└─ Sheet Count
```

#### Inventory Configuration:
```
Inventory Name: WIP - Printed Sheets
Linked Option Types: Printed Sheet

Specifications for Formulas:
  ☑ Sheet Count → sheetCount
  ☑ Length (mm) → length
  ☑ Width (mm) → width

Dynamic Calculations:
1. Total Sheets (PCS) = sheetCount * 1
2. Total Area (SQM) = ((length / 1000) * (width / 1000)) * sheetCount

Inventory Units: PCS, REAM (500 sheets), KG
```

**Usage:**
- Track printed sheets before binding/finishing
- Monitor sheet count for job completion
- Calculate paper usage and wastage

---

### Example 25: Pharmaceutical Blister Pack - Multi-Component

**Business Context:**
Pharmaceutical packaging manufacturer produces blister packs with PVC film, aluminum foil, and tablets/capsules.

**Setup:**

#### Option Types Created:
```
Blister Pack (Finished)
├─ Pack Size (10's/20's/30's)
├─ Tablet/Capsule Size
├─ PVC Thickness (microns)
├─ Foil Thickness (microns)
├─ Print Design
├─ Product Name
├─ Batch Number
└─ Expiry Date
```

#### Inventory Configuration:
```
Inventory Name: Finished Goods - Blister Packs
Linked Option Types: Blister Pack (Finished)

Specifications for Formulas:
  ☑ Pack Size → packSize

Dynamic Calculations:
1. Total Packs (PCS) = packSize * 1

Inventory Units: PCS, BOX (100 packs), CARTON (1000 packs)
```

**Usage:**
- Track finished blister packs by product and batch
- Monitor inventory by expiry date
- Maintain traceability for pharmaceutical compliance

---

## Formula System

### Understanding Dynamic Calculations

Dynamic calculations allow you to create formulas that automatically compute inventory quantities based on product specifications.

**Key Benefits:**
- **Automation** - No manual calculation needed
- **Accuracy** - Eliminates human error
- **Consistency** - Same formula applied to all entries
- **Flexibility** - Update formula once, applies to all records

### Formula Components

#### 1. Specification Variables
Variables are created from selected specifications:

```
Specification: Width (mm)
Variable Name: width

Specification: Length (m)
Variable Name: length

Specification: Thickness (microns)
Variable Name: thickness
```

**Variable Naming:**
- Auto-generated from specification name
- Lowercase, no spaces
- Example: "Bag Weight (kg)" → `bagWeight`

#### 2. Operators

Supported mathematical operators:

```
+  Addition        Example: width + length
-  Subtraction     Example: grossWeight - tareWeight
*  Multiplication  Example: width * length
/  Division        Example: totalWeight / pieceCount
() Parentheses     Example: (width + length) * 2
^  Power           Example: diameter ^ 2
```

#### 3. Numbers

Constants can be used in formulas:

```
Whole numbers:      1000, 500, 25
Decimals:           0.92, 1.5, 0.0254
Scientific:         2.7 (aluminum density)
```

### Common Formula Patterns

#### Pattern 1: Area Calculation
```
Field Name: Total Area
Formula: (width / 1000) * length
Result Unit: SQM
Description: Width in mm, length in m → Area in SQM

Example:
width = 300 mm
length = 500 m
Result = (300 / 1000) * 500 = 0.3 * 500 = 150 SQM
```

#### Pattern 2: Weight from Dimensions
```
Field Name: Film Weight
Formula: ((width / 1000) * length) * (thickness / 1000) * density
Result Unit: KG
Description: Plastic film weight calculation

Example (LDPE Film):
width = 400 mm
length = 1000 m
thickness = 25 microns
density = 0.92 g/cm³
Result = ((400 / 1000) * 1000) * (25 / 1000) * 0.92 = 9.2 KG
```

#### Pattern 3: Unit Conversion
```
Field Name: Length in Meters
Formula: length / 1000
Result Unit: MTR
Description: Convert mm to meters

Example:
length = 5000 mm
Result = 5000 / 1000 = 5 MTR
```

#### Pattern 4: Perimeter/Circumference
```
Field Name: Bag Perimeter
Formula: (length + width) * 2
Result Unit: MM
Description: Total edge length for sealing

Example:
length = 300 mm
width = 200 mm
Result = (300 + 200) * 2 = 1000 MM
```

#### Pattern 5: Volume
```
Field Name: Box Volume
Formula: (length / 1000) * (width / 1000) * (height / 1000)
Result Unit: Cubic Meters
Description: Calculate box volume

Example:
length = 500 mm
width = 300 mm
height = 200 mm
Result = (500 / 1000) * (300 / 1000) * (200 / 1000) = 0.03 m³
```

#### Pattern 6: Pieces from Total
```
Field Name: Pieces Per KG
Formula: 1000 / pieceWeight
Result Unit: PCS/KG
Description: Calculate how many pieces in 1 KG

Example:
pieceWeight = 25 grams
Result = 1000 / 25 = 40 pieces per KG
```

### Material Density Constants

Use these density values for weight calculations:

**Plastics:**
```
LDPE:  0.92 g/cm³
HDPE:  0.95 g/cm³
PP:    0.90 g/cm³
PET:   1.38 g/cm³
PVC:   1.40 g/cm³
PS:    1.05 g/cm³
```

**Metals:**
```
Aluminum:        2.7 g/cm³
Steel:           7.85 g/cm³
Stainless Steel: 8.0 g/cm³
Copper:          8.96 g/cm³
```

**Paper:**
```
Use GSM (grams per square meter) directly
Weight (kg) = (Area in SQM) * (GSM / 1000)
```

### Formula Examples by Industry

#### Plastic Film Industry
```
1. Film Area (SQM)
   = (width / 1000) * length

2. Film Weight (KG)
   = ((width / 1000) * length) * (thickness / 1000) * 0.92

3. Film Running Meters (MTR)
   = length * 1

4. Film Yield (SQM per KG)
   = ((width / 1000) * length) / (((width / 1000) * length) * (thickness / 1000) * 0.92)
```

#### Corrugated Box Industry
```
1. Sheet Area (SQM)
   = (length / 1000) * (width / 1000)

2. Sheet Weight (KG)
   = ((length / 1000) * (width / 1000)) * (gsm / 1000)

3. Boxes from Sheet
   = sheetLength / boxLength

4. Board Requirement (SQM per Box)
   = ((boxLength * boxWidth * 2) + (boxWidth * boxHeight * 4)) / 1000000
```

#### Textile Industry
```
1. Fabric Area (SQM)
   = (widthInInches * 0.0254) * lengthInMeters

2. Fabric Weight (KG)
   = ((widthInInches * 0.0254) * lengthInMeters) * (gsm / 1000)

3. Garments from Fabric
   = (fabricLength / garmentLength) * (fabricWidth / garmentWidth)
```

#### Steel/Aluminum Industry
```
1. Sheet Weight (KG)
   = ((length / 1000) * (width / 1000)) * thickness * density

2. Wire Weight (KG)
   = ((diameter / 2) ^ 2) * 3.14 * (length / 1000) * density

3. Profile Weight (KG)
   = (length / 1000) * weightPerMeter
```

### Advanced Formula Tips

**1. Multi-Step Calculations**
Break complex calculations into steps:

```
Step 1: Area = (width / 1000) * length
Step 2: Volume = Area * (thickness / 1000)
Step 3: Weight = Volume * density

Combined:
((width / 1000) * length) * (thickness / 1000) * density
```

**2. Conditional Logic Alternative**
Since formulas don't support IF statements, create separate inventory types:

```
Instead of: IF(thickness < 50) THEN formula1 ELSE formula2

Create two inventories:
- Thin Film Inventory (thickness < 50 microns)
- Thick Film Inventory (thickness >= 50 microns)
```

**3. Rounding Considerations**
System automatically rounds to 2 decimal places for display.

**4. Division by Zero Protection**
Avoid formulas that could divide by zero:

```
❌ Bad: totalWeight / pieceCount
   (If pieceCount = 0, formula fails)

✅ Good: Ensure pieceCount is always > 0 via validation
```

**5. Unit Consistency**
Always convert to consistent units within formulas:

```
❌ Bad: width * length
   (If width is in mm and length is in m, result is incorrect)

✅ Good: (width / 1000) * length
   (Convert mm to m first, then multiply)
```

---

## Integration with Production

### How Inventory Integrates with Orders

```
┌──────────────────┐
│  Create Order    │
│  (Customer)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│  Allocate        │──────▶│  Reduce Raw      │
│  Raw Materials   │       │  Material Stock  │
└────────┬─────────┘       └──────────────────┘
         │
         ▼
┌──────────────────┐
│  Assign Machine  │
│  Start Production│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│  Operator Entry  │──────▶│  Add Finished    │
│  (View Template) │       │  Goods to Stock  │
└────────┬─────────┘       └──────────────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│  Mark Order      │──────▶│  Update WIP      │
│  Complete        │       │  Inventory       │
└──────────────────┘       └──────────────────┘
```

### Inventory Movements

**1. Receive Raw Materials**
```
Action: Purchase Order → Goods Received
Inventory: Raw Materials (+)
Transaction: Add inventory with specifications
```

**2. Issue Materials to Production**
```
Action: Manufacturing Order → Material Allocation
Inventory: Raw Materials (-)
          WIP (+)
Transaction: Transfer with tracking
```

**3. Production Completion**
```
Action: Operator Entry → Production Complete
Inventory: WIP (-)
          Finished Goods (+)
Transaction: Conversion with yield tracking
```

**4. Delivery to Customer**
```
Action: Sales Order → Dispatch
Inventory: Finished Goods (-)
Transaction: Deduction with customer reference
```

### Real-Time Inventory Tracking

**Operator View Template Integration:**
When operators enter production data:

1. **Select Product** (from linked option types)
2. **Enter Specifications** (width, length, thickness, etc.)
3. **System Auto-Calculates** (using formulas)
4. **Inventory Updated** (finished goods added)
5. **Raw Material Consumption** (auto-deducted based on formulas)

**Example Flow:**
```
Operator produces LDPE bag roll:
├─ Select: LDPE Bag Roll (option type)
├─ Enter: Width = 300mm, Length = 500m, Thickness = 25 microns
├─ System Calculates: Area = 150 SQM, Weight = 3.45 KG
├─ Inventory Added: 1 ROLL, 150 SQM, 3.45 KG
└─ Raw Material Reduced: LDPE Granules -3.45 KG (based on formula)
```

### Stock Alerts and Reorder Points

Configure minimum stock levels:

```
Raw Material: LDPE Granules
├─ Current Stock: 1500 KG
├─ Minimum Level: 500 KG
├─ Reorder Point: 1000 KG
└─ Alert: Send notification when stock < 1000 KG
```

**Best Practice:**
- Set reorder points based on lead time
- Account for production rate
- Buffer for unexpected demand

---

## Best Practices

### 1. Option Type Design

**DO:**
- Create option types with clear, descriptive names
- Define ALL relevant specifications upfront
- Use consistent units across similar products
- Include quality/grade specifications

**DON'T:**
- Create too many option types (consolidate where possible)
- Skip specification definitions (needed for formulas)
- Mix measurement systems (metric vs imperial)

### 2. Inventory Organization

**Recommended Structure:**

```
Raw Materials Inventory
├─ Plastic Films
├─ Granules/Resins
├─ Inks/Adhesives
└─ Packaging Materials

WIP Inventory
├─ Extruded Films
├─ Printed Rolls
└─ Die-Cut Components

Finished Goods Inventory
├─ Product Line A
├─ Product Line B
└─ Custom Orders

Consumables Inventory
├─ Production Supplies
└─ Maintenance Items
```

### 3. Formula Accuracy

**Testing Formulas:**
1. Create inventory with test data
2. Enter known specifications
3. Verify calculated results manually
4. Adjust formula if needed
5. Test edge cases (very small/large values)

**Example Test:**
```
Test: LDPE Film Weight Calculation

Input:
width = 500 mm
length = 1000 m
thickness = 50 microns
density = 0.92 g/cm³

Manual Calculation:
Area = (500 / 1000) * 1000 = 500 SQM
Volume = 500 * (50 / 1000000) = 0.025 m³
Weight = 0.025 * 920 = 23 KG

Formula:
((width / 1000) * length) * (thickness / 1000) * 0.92
= ((500 / 1000) * 1000) * (50 / 1000) * 0.92
= 500 * 0.05 * 0.92
= 23 KG ✅
```

### 4. Data Entry Standards

**Establish Conventions:**
- Specification naming: Consistent across option types
- Unit formats: Always use base units (mm, m, kg)
- Decimal precision: 2 decimal places for most values
- Code formats: PREFIX-NUMBER (e.g., LDPE-001)

**Example Standard:**
```
Option Type: Plastic Film Roll
Required Fields:
  ✅ Width (mm) - Whole number
  ✅ Length (m) - Up to 2 decimals
  ✅ Thickness (microns) - Whole number
  ✅ Color - Dropdown selection
  ✅ Grade - Dropdown selection

Optional Fields:
  ⚪ Batch Number
  ⚪ Supplier
  ⚪ Date Received
```

### 5. Inventory Audit

**Regular Verification:**
- Physical count vs system count
- Investigate discrepancies
- Adjust inventory with notes
- Track adjustment reasons

**Audit Frequency:**
- Fast-moving items: Monthly
- Slow-moving items: Quarterly
- Critical items: Weekly
- Full audit: Annually

### 6. User Training

**Key Topics:**
1. Understanding specifications
2. Entering data accurately
3. Interpreting calculated values
4. Handling exceptions
5. Reporting discrepancies

### 7. Integration Testing

Before going live:
- Test complete order flow (create → produce → deliver)
- Verify inventory movements at each stage
- Check formula calculations with real production data
- Train operators on View Template usage
- Run parallel systems for 1 week

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Formula Returns Incorrect Result

**Symptoms:**
- Calculated value doesn't match manual calculation
- Values are off by 1000x or 100x

**Diagnosis:**
```
Check unit conversions:
❌ width * length (if width in mm, length in m)
✅ (width / 1000) * length (convert mm to m)

Check decimal placement:
❌ thickness * 0.92 (if thickness is in microns)
✅ (thickness / 1000) * 0.92 (convert microns to mm)
```

**Solution:**
1. Edit inventory
2. Review formula in Dynamic Calculations section
3. Test with known values
4. Update formula
5. Re-test

#### Issue 2: Specification Not Available in Formula

**Symptoms:**
- Want to use a specification but it's not in the variable list

**Diagnosis:**
- Specification not selected in "Specifications for Formulas" section

**Solution:**
1. Edit inventory
2. Go to "Specifications for Formulas" section
3. Find the option type containing the needed specification
4. Check the specification checkbox
5. Note the variable name generated
6. Save inventory
7. Now use the variable in formulas

#### Issue 3: Can't Link Option Type to Inventory

**Symptoms:**
- Option type doesn't appear in the list

**Diagnosis:**
- Option type doesn't exist yet
- Option type is inactive

**Solution:**
1. Go to Create → Options System → Create Option Type
2. Create the option type with needed specifications
3. Ensure status is "Active"
4. Return to Create Inventory
5. Option type should now appear

#### Issue 4: Inventory Unit Not Available

**Symptoms:**
- Need a unit (e.g., "SQFT") but it doesn't appear

**Diagnosis:**
- Unit not configured in backend

**Solution:**
1. Contact system administrator
2. Request unit addition in backend Inventory Type model
3. Once added, it will appear in Create Inventory

**Alternative:**
- Use existing unit and apply conversion in formula
- Example: Convert SQFT to SQM using `area * 0.0929`

#### Issue 5: Formula Variable Name Conflict

**Symptoms:**
- Two specifications from different option types have the same variable name

**Diagnosis:**
```
Option Type 1: Film Roll → Width (mm) → variable: width
Option Type 2: Sheet → Width (mm) → variable: width
Conflict: Which "width" to use in formula?
```

**Solution:**
Variable names are automatically made unique by appending option type info. Check the actual variable name shown in the Specifications section.

**If still conflicts:**
1. Create separate inventories for each option type
2. Use descriptive specification names (e.g., "Film Width", "Sheet Width")

#### Issue 6: Calculated Value Shows as 0 or NaN

**Symptoms:**
- Formula should calculate a value but shows 0 or NaN

**Diagnosis:**
```
Possible causes:
- Division by zero
- Missing specification value
- Wrong variable name in formula
- Specification value is 0
```

**Solution:**
1. Check that all specification values are entered
2. Verify variable names match exactly
3. Check for division by zero scenarios
4. Test with different values

#### Issue 7: Inventory Not Updating After Production

**Symptoms:**
- Operator enters production but inventory doesn't change

**Diagnosis:**
- View Template not linked to inventory
- Order type not configured correctly
- Inventory integration not enabled

**Solution:**
1. Verify View Template uses same option type as inventory
2. Check order type has option types linked
3. Ensure production entry is complete (not draft)

#### Issue 8: Need to Track Negative Inventory

**Symptoms:**
- Want to issue materials before receiving them

**Diagnosis:**
- System doesn't allow negative inventory by default

**Solution:**
**Option 1:** Receive materials first, then issue
**Option 2:** Enable negative inventory (contact admin)
**Option 3:** Use "Pending Receipt" inventory type for tracking

---

## Appendix: Complete Workflow Examples

### Workflow 1: LDPE Bag Manufacturing (End-to-End)

**Step 1: Setup (One-Time)**

Create option types:
```
1. LDPE Granules (Raw Material)
   └─ Specifications: Bag Weight (kg), Grade, Color

2. LDPE Film Roll (Intermediate)
   └─ Specifications: Width (mm), Length (m), Thickness (microns)

3. LDPE Bag (Finished)
   └─ Specifications: Bag Length (mm), Bag Width (mm), Thickness (microns)
```

Create inventories:
```
1. Raw Materials Inventory
   ├─ Linked: LDPE Granules
   ├─ Formula: Total KG = bagWeight * 1
   └─ Units: KG, BAG

2. WIP Inventory
   ├─ Linked: LDPE Film Roll
   ├─ Formula: Film Weight = ((width/1000) * length) * (thickness/1000) * 0.92
   └─ Units: ROLL, KG, SQM

3. Finished Goods Inventory
   ├─ Linked: LDPE Bag
   ├─ Formula: Bag Area = ((length/1000) * (width/1000)) * 2
   └─ Units: PCS, KG
```

**Step 2: Receive Raw Materials**

Action: Purchase 100 bags of LDPE granules (25 kg each)
```
Add to Raw Materials Inventory:
├─ Option Type: LDPE Granules
├─ Specifications: Bag Weight = 25 kg, Grade = Virgin, Color = Natural
├─ Quantity: 100 BAG
└─ Calculated: Total KG = 2500 KG
```

**Step 3: Extrusion Production**

Action: Operator runs extrusion machine
```
View Template Entry:
├─ Machine: Extrusion-001
├─ Order: Manufacturing Order #MO-001
├─ Product: LDPE Film Roll
├─ Specifications: Width = 600mm, Length = 1000m, Thickness = 50 microns
└─ Quantity: 5 ROLL

System Actions:
1. Calculate: Film Weight = ((600/1000)*1000)*(50/1000)*0.92 = 27.6 KG per roll
2. Add to WIP Inventory: 5 ROLL, 138 KG, 3000 SQM
3. Reduce Raw Materials: -138 KG LDPE Granules
```

**Step 4: Bag Making Production**

Action: Operator runs bag making machine
```
View Template Entry:
├─ Machine: Bag Making-001
├─ Order: Manufacturing Order #MO-002
├─ Product: LDPE Bag
├─ Specifications: Length = 400mm, Width = 300mm, Thickness = 50 microns
├─ Quantity: 10000 PCS
└─ Source: Film Roll from WIP

System Actions:
1. Calculate: Bag Area = ((400/1000)*(300/1000))*2 = 0.24 SQM per bag
2. Add to Finished Goods: 10000 PCS, 2400 SQM
3. Reduce WIP Inventory: -2400 SQM (approx 2.4 rolls)
```

**Step 5: Delivery to Customer**

Action: Dispatch order
```
Reduce Finished Goods:
├─ Order: Sales Order #SO-001
├─ Customer: ABC Industries
├─ Product: LDPE Bag (400x300mm, 50 microns)
└─ Quantity: 10000 PCS
```

**Inventory Status After Complete Flow:**
```
Raw Materials: 2500 KG - 138 KG = 2362 KG remaining
WIP: 3000 SQM - 2400 SQM = 600 SQM remaining (0.5 rolls)
Finished Goods: 10000 PCS - 10000 PCS = 0 PCS
```

---

### Workflow 2: Multi-Color Flexo Printing

**Step 1: Setup**

```
Option Types:
1. Unprinted Film Roll → Width, Length, Thickness
2. Printing Ink → Color, Can Size (LTR), Batch
3. Printed Film Roll → Width, Length, Design, Color Count

Inventories:
1. Raw Materials - Film
2. Consumables - Inks
3. Finished Goods - Printed Rolls
```

**Step 2: Receive Materials**

```
Raw Film:
├─ Width = 1000mm, Length = 5000m, Thickness = 25 microns
└─ Quantity: 10 ROLL

Inks:
├─ Cyan, Magenta, Yellow, Black (20 LTR each)
└─ Total: 80 LTR
```

**Step 3: Printing Production**

```
Operator Entry:
├─ Machine: Flexo-6 Color
├─ Input: Unprinted Film (1000mm x 5000m)
├─ Output: Printed Film (Design: ABC, 4 Colors)
├─ Ink Consumption: 5 LTR per roll (auto-calculated)
└─ Quantity: 1 ROLL

Inventory Movements:
1. Raw Film: -1 ROLL
2. Inks: -5 LTR (distributed across colors)
3. Printed Rolls: +1 ROLL
```

---

## Conclusion

The 27 Manufacturing Inventory System provides powerful, flexible inventory management with:

✅ **Specification-driven tracking** - Track exactly what matters for your products
✅ **Automatic calculations** - Eliminate manual computation errors
✅ **Multi-unit support** - View inventory in different units simultaneously
✅ **Production integration** - Seamless flow from raw materials to finished goods
✅ **Industry flexibility** - Adapt to any manufacturing process

**Key Success Factors:**
1. Plan your option types and specifications carefully
2. Test formulas with real data before going live
3. Train operators thoroughly on data entry
4. Conduct regular inventory audits
5. Monitor and refine your inventory structure over time

**Need Help?**
- Review this guide for detailed examples
- Test configurations in a sandbox environment
- Start with one product line, then expand
- Document your specific formulas and procedures

---

**Document Version:** 1.0
**Last Updated:** 2026-01-18
**For:** 27 Manufacturing Platform
**Support:** Contact your system administrator for technical assistance

