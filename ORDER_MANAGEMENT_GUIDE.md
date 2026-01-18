# 📦 Order Management System - Complete Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Order Types](#order-types)
3. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
4. [Order Workflow](#order-workflow)
5. [Industry Examples](#industry-examples)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is the Order Management System?

The **Order Management System** in 27 Manufacturing handles the complete lifecycle of manufacturing orders from creation to delivery, tracking production progress, materials, costs, and customer requirements.

**Key Features:**
- **Multiple Order Types** - Manufacturing, Sales, Purchase, Custom
- **Customer Management** - Track orders by customer with full details
- **Production Tracking** - Real-time progress monitoring
- **Machine Assignment** - Allocate orders to specific machines
- **Material Planning** - Link orders to inventory and raw materials
- **Costing & Billing** - Calculate costs, generate invoices with GST
- **Order Forwarding (B2B)** - Forward orders to partner companies
- **Status Tracking** - Pending → In Progress → Completed → Delivered

```
┌─────────────────────────────────────────────────────────────┐
│              ORDER MANAGEMENT SYSTEM                         │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Customer   │────────▶│    Order     │                 │
│  │              │         │              │                 │
│  └──────────────┘         └──────────────┘                 │
│                                   │                          │
│                                   │                          │
│                 ┌─────────────────┼─────────────────┐       │
│                 │                 │                 │       │
│                 ▼                 ▼                 ▼       │
│          ┌────────────┐    ┌────────────┐   ┌──────────┐  │
│          │  Products  │    │  Machines  │   │ Operators│  │
│          │  (Options) │    │            │   │          │  │
│          └────────────┘    └────────────┘   └──────────┘  │
│                 │                 │                 │       │
│                 │                 │                 │       │
│                 ▼                 ▼                 ▼       │
│          ┌────────────┐    ┌────────────┐   ┌──────────┐  │
│          │ Inventory  │    │ Production │   │ Invoice  │  │
│          │            │    │   Data     │   │          │  │
│          └────────────┘    └────────────┘   └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. Order Type**
- Category of order (Manufacturing, Sales, Purchase)
- Defines workflow and available features
- Customizable per company needs

**2. Order Status**
- **Pending** - Created but not started
- **In Progress** - Production ongoing
- **Completed** - Production finished
- **Delivered** - Sent to customer
- **Cancelled** - Order cancelled

**3. Option Types (Products)**
- What is being ordered
- Linked from Option System
- Can have multiple products per order

**4. Specifications**
- Product details (size, color, material)
- Defines exact requirements
- Inherited from Option Type

**5. Quantity**
- How many units to produce/deliver
- Can be in different units (PCS, KG, MTR, etc.)

**6. Due Date**
- When order should be completed
- Drives production scheduling
- Triggers alerts if delayed

**7. Costing**
- Material cost
- Labor cost
- Machine cost
- Total cost with GST (18%)

---

## Order Types

### 1. Manufacturing Order

**Purpose:** Produce products for customers or stock

**Typical Flow:**
```
Create Order → Assign Machine → Production → Quality Check → Completed → Delivery
```

**Key Fields:**
```
Required:
├─ Customer Name/Company
├─ Order Number (auto-generated or manual)
├─ Products (Option Types with specifications)
├─ Quantity
├─ Due Date
└─ Assigned Machine (optional initially, required before production)

Optional:
├─ Material allocation
├─ Operator assignment
├─ Special instructions
├─ Design files
└─ Delivery address
```

**Use Cases:**
- Customer orders for bags, films, boxes
- Stock production for inventory
- Custom product manufacturing
- Repeat orders from regular customers

---

### 2. Sales Order

**Purpose:** Track sales to customers (may or may not involve production)

**Typical Flow:**
```
Create Sales Order → Check Inventory → Ship (if in stock)
                  OR
                  → Create Manufacturing Order → Produce → Ship
```

**Key Fields:**
```
Required:
├─ Customer Name
├─ Products with specs
├─ Quantity
├─ Price per unit
├─ Total amount
├─ GST (18%)
└─ Due/Delivery Date

Optional:
├─ Discount
├─ Payment terms
├─ Shipping address
├─ PO Number (customer's)
└─ Credit/Cash
```

**Use Cases:**
- Direct customer sales
- Trading (buy and sell without production)
- Stock sales from finished goods inventory

---

### 3. Purchase Order

**Purpose:** Order raw materials or products from suppliers

**Typical Flow:**
```
Create Purchase Order → Send to Supplier → Receive Goods → Update Inventory → Pay Invoice
```

**Key Fields:**
```
Required:
├─ Supplier Name
├─ Products (raw materials/finished goods)
├─ Quantity
├─ Price per unit
├─ Expected delivery date
└─ Payment terms

Optional:
├─ Advance payment
├─ Quality requirements
├─ Delivery address
└─ Special terms
```

**Use Cases:**
- Buy LDPE granules from supplier
- Purchase printing ink
- Order packaging materials
- Buy finished products for trading

---

### 4. Custom Order Types

**Purpose:** Company-specific workflows

**Examples:**
```
1. Job Work Order
   └─ Customer provides material, you process it

2. Sample Order
   └─ Small quantity for customer approval

3. Rework Order
   └─ Re-process rejected items

4. Maintenance Order
   └─ Machine maintenance scheduling

5. B2B Forwarded Order
   └─ Order forwarded from partner company
```

---

## Step-by-Step Setup Guide

### Step 1: Create Order Type (One-Time Setup)

**Action:** Create → Order Management → Create Order Type

#### 1.1 Basic Information
```
Order Type Name: Manufacturing Order
Order Type Code: MFG-ORDER
Description: Production orders for customers
Category: Manufacturing
Status: Active
```

#### 1.2 Allowed Option Types (Products)
```
Select products that can be ordered:
☑ LDPE Film Roll
☑ LDPE Bag Plain
☑ LDPE Bag Printed
☑ HDPE Film Roll
☐ Printing Ink (Not for manufacturing orders)
```

**Why link option types?**
- Only linked products appear in order creation
- Prevents wrong products in wrong order types
- Organizes product catalog

#### 1.3 Configure Fields
```
Enable/Disable fields for this order type:

Customer Details:
☑ Customer Name (Required)
☑ Customer Contact (Optional)
☑ Customer Address (Optional)

Product Details:
☑ Products with Specifications (Required)
☑ Quantity (Required)
☑ Unit of Measurement (Required)

Scheduling:
☑ Order Date (Auto-filled)
☑ Due Date (Required)
☐ Delivery Date (Filled after delivery)

Production:
☑ Assign Machine (Required before production)
☑ Assign Operator (Optional)
☐ Material Allocation (Optional)

Costing:
☑ Material Cost (Optional)
☑ Labor Cost (Optional)
☑ Other Costs (Optional)
☑ Total Cost (Auto-calculated)

Status:
☑ Order Status (Pending/In Progress/Completed)
☐ QC Status (Pass/Fail/Pending)
```

---

### Step 2: Create Your First Order

**Action:** Create → Order Management → Create Order

#### 2.1 Select Order Type
```
Order Type: Manufacturing Order (select from dropdown)
```

#### 2.2 Enter Basic Details
```
Order Number: MO-2024-001 (auto-generated or manual)
Order Date: 15/01/2024 (today's date, auto-filled)
Due Date: 25/01/2024 (10 days from now)
Priority: Normal (or High/Low/Urgent)
```

#### 2.3 Customer Information
```
Customer Type: Existing Customer / New Customer

If Existing:
  Customer Name: Select from dropdown (ABC Industries)
  └─ Contact, address auto-filled from customer database

If New:
  Customer Name: XYZ Packaging Pvt. Ltd.
  Contact Person: Mr. Sharma
  Phone: +91 98765 43210
  Email: sharma@xyzpackaging.com
  Address: Plot 45, Industrial Area, Mumbai
  GST Number: 27AABCU9603R1ZX (optional)
  └─ Save as new customer? ☑ Yes
```

#### 2.4 Add Products

**Product 1:**
```
Option Type: LDPE Bag Plain (select from dropdown)

Specifications (auto-loads from option type):
├─ Bag Length: 400 mm
├─ Bag Width: 300 mm
├─ Gusset: 50 mm
├─ Thickness: 25 microns
├─ Color: Natural ▼
├─ Seal Type: Side Seal ▼
└─ Handle Type: Loop Handle ▼

Quantity: 10,000 PCS
Unit: PCS (pieces)

Additional Details:
├─ Rate per unit: ₹2.50 (optional)
├─ Total amount: ₹25,000 (auto-calculated if rate entered)
└─ Special Instructions: "Logo to be printed on center"
```

**Add More Products (if needed):**
```
Click "+ Add Product"

Product 2:
├─ Option Type: LDPE Film Roll
├─ Specifications: Width 500mm, Length 1000m, Thickness 50 microns
└─ Quantity: 5 ROLL
```

#### 2.5 Production Planning (Optional)
```
Assign to Machine: Bag Making-001 ▼
Assign Operator: Ramesh Kumar ▼ (operators of selected machine)
Shift: Shift A (06:00-14:00) ▼
Estimated Time: 8 hours
```

#### 2.6 Material Requirements (Optional)
```
Link to Inventory:
If order requires raw materials from inventory:

Raw Material 1:
├─ Option Type: LDPE Film Roll
├─ Specifications: 500mm × 1000m × 50 microns
├─ Required Quantity: 2 ROLL
└─ Allocate from Inventory? ☑ Yes

System checks inventory:
├─ Available: 10 ROLL
├─ After Allocation: 8 ROLL
└─ Status: ✅ Sufficient stock
```

#### 2.7 Costing (Optional)
```
Cost Breakdown:
├─ Material Cost: ₹15,000 (manual entry or auto from inventory)
├─ Labor Cost: ₹5,000 (manual entry)
├─ Machine Cost: ₹2,000 (manual entry)
├─ Other Costs: ₹1,000 (manual entry)
├─ Subtotal: ₹23,000
├─ GST (18%): ₹4,140
└─ Total Cost: ₹27,140

Selling Price:
├─ Rate per unit: ₹2.50
├─ Quantity: 10,000 PCS
├─ Subtotal: ₹25,000
├─ GST (18%): ₹4,500
└─ Total Amount: ₹29,500

Profit Margin:
└─ Profit: ₹29,500 - ₹27,140 = ₹2,360 (8.7%)
```

#### 2.8 Attachments & Notes (Optional)
```
Design Files:
├─ Upload: bag_design_ABC_industries.pdf
└─ Upload: logo.png

Special Instructions:
"Please ensure loops are 5mm thick. Quality check before packing."

Internal Notes:
"Regular customer, priority order, ensure on-time delivery"
```

#### 2.9 Save Order
```
Click: Save as Draft (to continue later)
  OR
Click: Create Order (finalize and make active)

Result:
Order created with status: Pending
Order Number: MO-2024-001
Notification sent to assigned operator (if assigned)
```

---

## Order Workflow

### Complete Order Lifecycle

```
┌─────────────────┐
│  Create Order   │ ← Admin/Manager creates order
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Status:       │
│   PENDING       │ ← Order created, not started
└────────┬────────┘
         │
         │ Assign Machine & Operator
         │
         ▼
┌─────────────────┐
│  Operator       │ ← Operator starts production
│  Starts Work    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Status:       │
│  IN PROGRESS    │ ← Production ongoing
└────────┬────────┘
         │
         │ Operator enters production data
         │ (via View Template)
         │
         ▼
┌─────────────────┐
│  Production     │ ← Bags produced, data entered
│  Data Entry     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quality        │ ← Check product quality
│  Check          │
└────────┬────────┘
         │
         │ If Pass
         │
         ▼
┌─────────────────┐
│   Status:       │
│   COMPLETED     │ ← Production finished
└────────┬────────┘
         │
         │ Generate Invoice
         │
         ▼
┌─────────────────┐
│  Generate       │ ← Invoice with GST
│  Invoice        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pack &         │ ← Prepare for delivery
│  Dispatch       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Status:       │
│   DELIVERED     │ ← Order complete
└─────────────────┘
         │
         │ Payment Collection
         │
         ▼
┌─────────────────┐
│  Payment        │
│  Received       │
└─────────────────┘
```

---

## Industry Examples

### Example 1: LDPE Bag Manufacturing - Complete Order

**Scenario:** Regular customer orders LDPE bags for grocery packaging

**Order Details:**
```
Order Type: Manufacturing Order
Order Number: MO-2024-025
Customer: GroceryMart Pvt. Ltd.
Order Date: 15/01/2024
Due Date: 25/01/2024 (10 days)
Priority: High (regular customer, on-time delivery crucial)

Product:
├─ Option Type: LDPE Bag Plain
├─ Bag Length: 450 mm
├─ Bag Width: 350 mm
├─ Gusset: 75 mm
├─ Thickness: 30 microns
├─ Color: White
├─ Handle Type: D-Cut Handle
├─ Quantity: 50,000 PCS
└─ Packing: 100 bags per bundle → 500 bundles

Material Requirements:
└─ LDPE Film Roll (500mm × 2000m × 30 microns, White)
   ├─ Required: 5 ROLL
   └─ In Stock: 12 ROLL ✅

Costing:
├─ Material: ₹1,00,000 (₹20,000 per roll × 5)
├─ Labor: ₹25,000 (operators + helpers)
├─ Machine: ₹10,000 (depreciation + electricity)
├─ Subtotal: ₹1,35,000
├─ GST (18%): ₹24,300
└─ Total Cost: ₹1,59,300

Selling Price:
├─ Rate: ₹3.50 per bag
├─ Quantity: 50,000
├─ Subtotal: ₹1,75,000
├─ GST (18%): ₹31,500
└─ Total Amount: ₹2,06,500

Profit: ₹2,06,500 - ₹1,59,300 = ₹47,200 (29.6%)

Production Plan:
├─ Machine: Bag Making-002
├─ Operator: Suresh Kumar (Shift A)
├─ Estimated Time: 3 days
└─ Actual Start: 16/01/2024

Special Instructions:
"D-cut handle should be reinforced. Customer will visit for quality check on day 2."
```

**Order Execution:**

**Day 1 (16/01/2024):**
```
08:00 - Operator Suresh starts production
10:00 - 5,000 bags produced (View Template entry)
12:00 - 10,000 bags produced (cumulative)
16:00 - 15,000 bags produced (cumulative)
Status: In Progress (30% complete)
```

**Day 2 (17/01/2024):**
```
08:00 - Continue production
12:00 - Customer visit for quality check
       Quality Check: ✅ Passed
14:00 - 30,000 bags produced (cumulative, 60% complete)
18:00 - 40,000 bags produced (cumulative, 80% complete)
Status: In Progress
```

**Day 3 (18/01/2024):**
```
08:00 - Final production run
12:00 - 50,000 bags completed ✅
       Status changed: Completed
14:00 - Quality final check: ✅ Passed
       Packed in 500 bundles
       Prepared for delivery
16:00 - Generate Invoice: INV-2024-025
       Amount: ₹2,06,500 (incl. GST)
```

**Day 4 (19/01/2024):**
```
10:00 - Loaded in delivery truck
12:00 - Dispatched to customer
       Status: Delivered
       Delivery Note: DN-2024-025

Payment:
├─ Payment Terms: 30 days credit
├─ Due Date: 19/02/2024
└─ Payment Mode: Bank Transfer
```

---

### Example 2: Flexo Printing - Multi-Product Order

**Scenario:** New customer orders printed rolls for snack packaging

**Order Details:**
```
Order Type: Manufacturing Order
Order Number: MO-2024-026
Customer: SnackTime Foods Pvt. Ltd. (NEW CUSTOMER)
Order Date: 16/01/2024
Due Date: 30/01/2024 (14 days - longer for new customer)
Priority: Normal

Product 1: Printed Film Roll (Cheese Puffs Pack)
├─ Width: 400 mm
├─ Length: 3000 m
├─ Material: BOPP
├─ Thickness: 25 microns
├─ Colors: 4-Color (CMYK + Spot Color)
├─ Design: "CheesePuffs_Design_v2.pdf"
├─ Quantity: 10 ROLL
└─ Rate: ₹15,000/roll → ₹1,50,000

Product 2: Printed Film Roll (Potato Chips Pack)
├─ Width: 350 mm
├─ Length: 3000 m
├─ Material: BOPP
├─ Thickness: 30 microns
├─ Colors: 4-Color (CMYK)
├─ Design: "PotatoChips_Design_v1.pdf"
├─ Quantity: 8 ROLL
└─ Rate: ₹14,000/roll → ₹1,12,000

Total Order Value:
├─ Subtotal: ₹2,62,000
├─ GST (18%): ₹47,160
└─ Total: ₹3,09,160

Material Requirements:
1. Unprinted BOPP Film (400mm × 30,000m)
   ├─ Required: 10 ROLL
   └─ Status: Order from supplier (not in stock)

2. Unprinted BOPP Film (350mm × 24,000m)
   ├─ Required: 8 ROLL
   └─ Status: Order from supplier

3. Printing Ink (Cyan, Magenta, Yellow, Black, Spot Red)
   ├─ Estimated: 50 LTR total
   └─ Status: ✅ In stock (80 LTR available)

Production Plan:
Phase 1: Purchase raw materials (3-4 days)
Phase 2: Printing setup + trial (1 day)
Phase 3: Production Product 1 (3 days)
Phase 4: Production Product 2 (2 days)
Phase 5: QC + Packing (1 day)
Total: 10-11 days (buffer for 14-day due date)

Dependencies:
1. Design approval from customer (before starting)
2. Cylinder making (4 days lead time)
3. Raw material procurement (5 days from supplier)
```

**Order Execution Timeline:**

**Day 1-2 (16-17/01):**
```
- Create purchase order for BOPP films
- Send design to customer for approval
- Order printing cylinders
Status: Pending (waiting for materials)
```

**Day 3-6 (18-21/01):**
```
- Receive BOPP films from supplier
- Receive printing cylinders
- Customer approves design ✅
- Setup machine with cylinders
Status: Pending (setup phase)
```

**Day 7 (22/01):**
```
- Trial printing Product 1
- Color matching with customer sample
- Adjustment and final approval
- Start production Product 1
Status: In Progress (Product 1)
```

**Day 8-10 (23-25/01):**
```
- Complete printing Product 1 (10 rolls)
- Quality check: ✅ Passed
- Start production Product 2
Status: In Progress (Product 2)
```

**Day 11-12 (26-27/01):**
```
- Complete printing Product 2 (8 rolls)
- Quality check: ✅ Passed
- Pack and label both products
Status: Completed
```

**Day 13 (28/01):**
```
- Generate invoice
- Dispatch to customer
Status: Delivered (2 days before due date) ✅
```

---

### Example 3: B2B Order Forwarding

**Scenario:** You receive bag order but need printing, forward to partner

**Original Order:**
```
Order Type: Manufacturing Order
Order Number: MO-2024-027
Customer: FreshFruits Co.
Order Date: 17/01/2024
Due Date: 05/02/2024

Product: LDPE Bag (Printed with logo)
├─ Bag Length: 400 mm
├─ Bag Width: 300 mm
├─ Thickness: 25 microns
├─ Printing: 2-Color (Logo + Text)
├─ Design: "FreshFruits_Logo.pdf"
├─ Quantity: 30,000 PCS
└─ Total Amount: ₹1,20,000

Problem:
You don't have printing machine, need to outsource printing
```

**Solution: Forward Order to Partner**

**Step 1: Create Internal Manufacturing Order (Plain Bags)**
```
Order Type: Manufacturing Order
Order Number: MO-2024-027-A (Internal)
Product: LDPE Bag (Plain, unprinted)
Quantity: 30,000 PCS
Assigned Machine: Bag Making-001
Status: In Progress

Timeline:
├─ Start: 18/01/2024
├─ Complete: 22/01/2024 (4 days)
└─ Output: 30,000 plain bags
```

**Step 2: Forward to Partner for Printing**
```
Action: Forward Order → Select Partner: PrintPro Services

Forwarded Order Details:
├─ Original Order: MO-2024-027
├─ Forwarded Order Number: FWD-2024-027-B
├─ To: PrintPro Services
├─ Service Required: Printing only
├─ Material Provided: 30,000 plain LDPE bags
├─ Printing Specs:
│  ├─ Design: "FreshFruits_Logo.pdf"
│  ├─ Colors: 2-Color (Green + Black)
│  └─ Position: Center of bag
├─ Quantity: 30,000 PCS
├─ Due Date: 02/02/2024
└─ Cost: ₹30,000 (₹1/bag printing charge)

Partner Receives Notification:
└─ PrintPro logs in → Sees forwarded order → Accepts
```

**Step 3: Track Partner Progress**
```
22/01 - Send plain bags to PrintPro
23/01 - PrintPro starts printing
       Status: In Progress (at partner)

25/01 - PrintPro completes 50%
       Status update notification received

27/01 - PrintPro completes 100%
       Status: Completed (at partner)

28/01 - Receive printed bags back
       Quality Check: ✅ Passed

29/01 - Pack and label
30/01 - Dispatch to customer
       Status: Delivered

Final Costing:
├─ Your cost (plain bags): ₹60,000
├─ Partner cost (printing): ₹30,000
├─ Total Cost: ₹90,000
├─ Selling Price: ₹1,20,000
└─ Profit: ₹30,000 (25%)
```

---

### Example 4: Purchase Order for Raw Materials

**Scenario:** Running low on LDPE granules, need to order from supplier

**Purchase Order:**
```
Order Type: Purchase Order
Order Number: PO-2024-008
Supplier: ResinWorld Pvt. Ltd.
Order Date: 18/01/2024
Expected Delivery: 25/01/2024 (7 days)

Product: LDPE Granules
├─ Grade: Virgin
├─ Melt Index: 2.0
├─ Bag Weight: 25 kg
├─ Quantity: 200 BAGS (5000 kg total)
├─ Rate: ₹120/kg
├─ Subtotal: ₹6,00,000
├─ GST (18%): ₹1,08,000
└─ Total: ₹7,08,000

Payment Terms:
├─ Advance: 50% (₹3,54,000) - Paid on 18/01
├─ Balance: 50% (₹3,54,000) - Due on delivery
└─ Payment Mode: Bank Transfer

Delivery Details:
├─ Delivery Address: Your factory address
├─ Delivery Time: 10:00 AM - 12:00 PM
└─ Contact: Store Manager - Mr. Patil

Quality Requirements:
├─ MFI test certificate required
├─ Batch traceability
└─ Bags should be intact, no damage

Special Terms:
"If quality doesn't match sample, full refund + return shipping cost"
```

**Purchase Order Workflow:**

**18/01 (Order Date):**
```
- Create PO
- Send PO to supplier via email
- Pay 50% advance
- Status: Sent to Supplier
```

**19/01:**
```
- Supplier confirms PO
- Confirms delivery date: 25/01
- Status: Confirmed
```

**25/01 (Delivery Date):**
```
10:30 - Truck arrives with material
11:00 - Quality check sample bags
       ├─ MFI test: ✅ Matches specification
       ├─ Bag integrity: ✅ All bags intact
       └─ Certificate: ✅ Provided

11:30 - Accept delivery
       ├─ Unload 200 bags
       ├─ Count verification: ✅ All 200 bags received
       └─ Sign delivery receipt

12:00 - Update inventory
       ├─ Option Type: LDPE Granules
       ├─ Add Stock: +5000 KG
       └─ Current Stock: 7500 KG (was 2500 KG)

14:00 - Make balance payment (50%)
       ├─ Amount: ₹3,54,000
       └─ Payment Reference: PAY-PO-2024-008

       Status: Completed ✅
```

---

## Advanced Features

### 1. Repeat Orders

**Feature:** Quickly create orders for repeat customers

**How it works:**
```
1. View previous order (e.g., MO-2024-001)
2. Click "Create Repeat Order"
3. System copies:
   ├─ Customer details
   ├─ Products with specifications
   ├─ Pricing (optional, can update)
   └─ Special instructions

4. Update only what changes:
   ├─ Quantity (may be different)
   ├─ Due date (new date)
   └─ Any spec changes

5. Save → New order created instantly

Time Saved: 5-10 minutes per order
```

**Example:**
```
Original Order (MO-2024-001):
├─ Customer: ABC Industries
├─ Product: LDPE Bag 400×300mm
├─ Quantity: 10,000 PCS
└─ Date: 15/01/2024

Repeat Order (MO-2024-035):
├─ Customer: ABC Industries (same)
├─ Product: LDPE Bag 400×300mm (same)
├─ Quantity: 20,000 PCS (doubled)
└─ Date: 05/02/2024 (new)

Only changed quantity and date, rest auto-filled ✅
```

---

### 2. Bulk Order Actions

**Feature:** Perform actions on multiple orders at once

**Actions Available:**
```
1. Bulk Status Update
   └─ Select 10 orders → Change all to "In Progress"

2. Bulk Machine Assignment
   └─ Select 5 orders → Assign all to "Extrusion-002"

3. Bulk Priority Change
   └─ Select 3 orders → Mark all as "High Priority"

4. Bulk Export
   └─ Select date range → Export all to Excel

5. Bulk Invoice Generation
   └─ Select completed orders → Generate invoices for all
```

---

### 3. Order Templates

**Feature:** Save frequently used order configurations as templates

**Example Templates:**
```
Template 1: "Standard Grocery Bag Order"
├─ Product: LDPE Bag 450×350mm, 30 microns, White, D-Cut
├─ Default Quantity: 50,000 PCS
├─ Machine: Bag Making-002
└─ Standard rate: ₹3.00/bag

Template 2: "Film Roll for Lamination"
├─ Product: LDPE Film 500mm × 1000m × 50 microns
├─ Default Quantity: 10 ROLL
├─ Machine: Extrusion-001
└─ Standard rate: ₹18,000/roll

Template 3: "Printed Snack Packaging"
├─ Product: BOPP Film 350mm × 3000m, 4-Color
├─ Default Quantity: 5 ROLL
├─ Machine: Printing-Flexo-001
└─ Includes design review step
```

**Usage:**
```
1. Create Order → Select Template → Fill customer name → Done
2. Saves 80% of data entry time
3. Reduces specification errors
```

---

### 4. Order Scheduling & Calendar View

**Feature:** Visual calendar showing all orders and their timelines

**Calendar View:**
```
January 2024
┌────────────────────────────────────────┐
│ Mon   Tue   Wed   Thu   Fri   Sat Sun │
│                                        │
│ 15    16    17    18    19    20   21 │
│ MO-25 MO-25 MO-26 MO-26 MO-26          │
│ MO-26 MO-27 MO-27 MO-27 MO-27          │
│       MO-28                             │
│                                        │
│ 22    23    24    25    26    27   28 │
│ MO-26 MO-26 MO-27 MO-27 MO-29 MO-29    │
│ MO-29 MO-29                   MO-30    │
│                                        │
└────────────────────────────────────────┘

Color Coding:
🟢 Green - On track
🟡 Yellow - Due soon (within 2 days)
🔴 Red - Overdue
🔵 Blue - Completed

Machine Load View:
├─ Extrusion-001: [====90%====] (Almost full)
├─ Bag Making-002: [===60%===  ] (Moderate)
└─ Printing-001: [==30%=      ] (Low utilization)
```

---

### 5. Order Dependencies

**Feature:** Link orders that depend on each other

**Example:**
```
Main Order: MO-2024-027 (Printed Bags)
├─ Depends on: MO-2024-027-A (Plain Bags)
│  └─ Status: Completed ✅
│      Can start printing now
│
└─ Depends on: FWD-2024-027-B (Printing at Partner)
   └─ Status: In Progress ⏳
       Cannot dispatch until printing completes

System Alerts:
├─ "MO-2024-027-A completed. MO-2024-027 can proceed."
└─ "Warning: MO-2024-027 due in 2 days but FWD-2024-027-B still in progress"
```

---

### 6. Order Costing & Profitability

**Feature:** Track costs vs revenue per order

**Detailed Cost Breakdown:**
```
Order: MO-2024-025 (50,000 LDPE Bags)

Direct Costs:
├─ Material (LDPE Film): ₹1,00,000
│  ├─ 5 rolls × ₹20,000/roll
│  └─ Actual usage: 4.8 rolls (wastage: 0.2 rolls)
│
├─ Labor: ₹25,000
│  ├─ Operator wages: ₹15,000 (3 days × ₹5,000/day)
│  ├─ Helper wages: ₹8,000
│  └─ Supervisor overhead: ₹2,000
│
├─ Machine Cost: ₹10,000
│  ├─ Depreciation: ₹6,000 (3 days usage)
│  ├─ Electricity: ₹3,000 (estimated)
│  └─ Maintenance: ₹1,000 (allocated)
│
└─ Indirect Costs: ₹5,000
   ├─ Quality control: ₹1,000
   ├─ Packing materials: ₹2,000
   ├─ Storage: ₹1,000
   └─ Transport (internal): ₹1,000

Total Cost: ₹1,40,000

Revenue:
├─ Selling Price: ₹1,75,000
├─ GST (18%): ₹31,500
└─ Total Revenue: ₹2,06,500

Profitability:
├─ Gross Profit: ₹35,000 (₹1,75,000 - ₹1,40,000)
├─ Profit %: 25% (₹35,000 / ₹1,40,000)
├─ Margin: 20% (₹35,000 / ₹1,75,000)
└─ ROI: Good ✅ (target >20% profit margin)
```

---

## Best Practices

### 1. Order Numbering System

**Recommended Format:**
```
[Order Type]-[Year]-[Sequential Number]

Examples:
├─ MO-2024-001 (Manufacturing Order)
├─ SO-2024-001 (Sales Order)
├─ PO-2024-001 (Purchase Order)
└─ FWD-2024-001 (Forwarded Order)

Benefits:
✅ Easy to identify order type
✅ Chronological sorting
✅ Unique identification
✅ Year tracking for audits
```

**Alternative Formats:**
```
Monthly Reset:
└─ MO-JAN24-001, MO-FEB24-001

Customer Prefix:
└─ MO-ABC-001 (ABC Industries order)

Machine Specific:
└─ MO-EXT01-001 (Extrusion-001 orders)
```

---

### 2. Due Date Management

**Set Realistic Due Dates:**
```
Consider:
├─ Production time (actual machine hours)
├─ Setup time (machine changeover)
├─ Material procurement (if ordering)
├─ Queue time (other orders ahead)
├─ Buffer for issues (10-20% extra)
└─ Delivery time (shipping)

Example Calculation:
├─ Production: 3 days
├─ Setup: 0.5 day
├─ Current queue: 2 days
├─ Buffer (15%): 0.8 day
├─ Total: 6.3 days → Set due date: 7-8 days
```

**Color-Coded Alerts:**
```
🟢 Green: >5 days remaining (On track)
🟡 Yellow: 2-5 days remaining (Due soon)
🔴 Red: <2 days or overdue (Urgent)
⚫ Black: Cancelled
```

---

### 3. Customer Communication

**Key Touchpoints:**
```
1. Order Confirmation (within 24 hours)
   └─ "Order MO-2024-025 confirmed. Due: 25/01/2024"

2. Production Start
   └─ "Production started for your order MO-2024-025"

3. Mid-Production Update (for large orders)
   └─ "60% complete. On track for 25/01 delivery"

4. Completion Notification
   └─ "Order MO-2024-025 completed. Ready for dispatch"

5. Dispatch Notification
   └─ "Dispatched. Expected delivery: 26/01 by 2 PM"

6. Delivery Confirmation
   └─ "Delivered successfully. Please confirm receipt"

7. Invoice & Payment
   └─ "Invoice INV-2024-025 attached. Due: 19/02"
```

**Automation:**
```
Auto-send notifications for:
☑ Order confirmation
☑ Status changes
☑ Due date approaching (2 days before)
☐ Daily updates (only for premium customers)
```

---

### 4. Machine Assignment Strategy

**Load Balancing:**
```
Scenario: 3 orders received on same day

Order 1: 10,000 bags (estimated 2 days)
Order 2: 5,000 bags (estimated 1 day)
Order 3: 15,000 bags (estimated 3 days)

Available Machines:
├─ Bag Making-001 (currently idle)
├─ Bag Making-002 (1 day remaining on current order)
└─ Bag Making-003 (idle)

Smart Assignment:
├─ Order 3 → Bag Making-001 (longest job, start immediately)
├─ Order 1 → Bag Making-003 (start immediately)
└─ Order 2 → Bag Making-002 (starts after current order, 1 day wait)

Result: All complete in 3 days with balanced load
```

**Avoid:**
```
❌ Assigning all to one machine (queue buildup)
❌ Not considering setup time (machine changeovers)
❌ Ignoring operator skills (some operators better on specific machines)
```

---

### 5. Order Documentation

**Must-Have Documents:**
```
For Each Order:
├─ Order Confirmation (sent to customer)
├─ Production Worksheet (for operators)
├─ Quality Check Report (post-production)
├─ Delivery Note (for dispatch)
├─ Invoice (for payment)
└─ Material Consumption Report (for costing)

Store Digitally:
└─ Attach to order in system for easy access
```

---

### 6. Handling Rush Orders

**Rush Order Protocol:**
```
1. Check Feasibility
   ├─ Can we meet the timeline?
   ├─ Do we have materials?
   └─ Can we pause other orders?

2. Cost Adjustment
   ├─ Rush surcharge: +15-25%
   ├─ Overtime labor costs
   └─ Express material procurement

3. Priority Assignment
   ├─ Mark as "Urgent" priority
   ├─ Assign best operator
   └─ Allocate machine immediately

4. Clear Communication
   └─ Inform customer of additional cost upfront

Example:
Normal Order: ₹1,00,000 / 7 days
Rush Order: ₹1,20,000 / 3 days (+20% rush fee)
```

---

## Troubleshooting

### Issue 1: Order Not Showing in Production View

**Symptoms:**
- Order created but operator can't see it

**Diagnosis:**
```
Check:
1. Is order status "Pending"? (needs to be assigned)
2. Is machine assigned to order?
3. Is operator assigned to that machine?
4. Is order cancelled/completed?
```

**Solution:**
```
Admin Action:
1. Open order → Click Edit
2. Assign Machine: Select from dropdown
3. Assign Operator: Select operator (or they see it if assigned to machine)
4. Save order
5. Operator refreshes → Order appears
```

---

### Issue 2: Cannot Complete Order (Error Message)

**Symptoms:**
- "Cannot mark as completed" error

**Diagnosis:**
```
Possible causes:
1. No production data entered
2. Quantity mismatch (produced < ordered)
3. Required fields missing
4. Quality check pending
```

**Solution:**
```
Step 1: Verify Production Data
├─ Check if operator entered production data
└─ Verify quantity matches order quantity

Step 2: Check Required Fields
├─ Ensure all mandatory fields filled
└─ Quality status marked (if required)

Step 3: Manual Override (Admin only)
└─ If legitimate reason, admin can force complete
```

---

### Issue 3: Inventory Not Updating After Order

**Symptoms:**
- Completed order but inventory stock not reduced

**Diagnosis:**
```
Inventory integration not configured:
1. Order type not linked to inventory
2. Material allocation not done
3. Automatic deduction disabled
```

**Solution:**
```
Option 1: Manual Inventory Update
1. Go to Inventory → View Inventory
2. Select item → Reduce Stock
3. Enter quantity used
4. Add note: "Used in order MO-2024-025"

Option 2: Enable Auto-Deduction (Admin)
1. Settings → Order Types → Edit
2. Enable "Auto-deduct from inventory"
3. Configure which inventory to deduct from
4. Save

Future orders will auto-update inventory
```

---

### Issue 4: Invoice Generation Failed

**Symptoms:**
- "Error generating invoice" message

**Diagnosis:**
```
Missing information:
1. No price/rate entered
2. Customer GST number missing (for B2B)
3. Costing details incomplete
```

**Solution:**
```
Step 1: Complete Pricing
1. Edit order
2. Enter rate per unit for each product
3. Verify total amount calculated correctly

Step 2: Customer Details
1. Ensure customer name filled
2. Add GST number (if B2B transaction)
3. Add complete address

Step 3: Retry Invoice
1. Click "Generate Invoice" again
2. Download PDF

If Still Fails:
└─ Contact system administrator (may be technical issue)
```

---

### Issue 5: Order Shows Overdue But Was Completed

**Symptoms:**
- Red overdue alert even though order delivered

**Diagnosis:**
```
Status not updated:
- Marked "Completed" but not "Delivered"
- Delivery date not filled
```

**Solution:**
```
Update Order:
1. Edit order
2. Change status: "Delivered"
3. Fill delivery date: Actual date delivered
4. Add delivery note number (if any)
5. Save

Alert will clear automatically
```

---

## Conclusion

The 27 Manufacturing Order Management System provides complete order lifecycle management from creation to delivery.

✅ **Flexible Order Types** - Manufacturing, Sales, Purchase, Custom
✅ **Real-Time Tracking** - Monitor order status and production progress
✅ **Machine & Operator Assignment** - Efficient resource allocation
✅ **Material Integration** - Link orders to inventory
✅ **Costing & Invoicing** - Track costs, generate GST invoices
✅ **B2B Collaboration** - Forward orders to partners
✅ **Customer Management** - Complete customer history and communication

**Key Success Factors:**
1. Set realistic due dates with adequate buffer
2. Assign orders to machines immediately
3. Track production progress daily
4. Communicate proactively with customers
5. Document all order-related information
6. Review completed orders for profitability
7. Use templates for repeat orders

**Next Steps:**
1. Create your order types
2. Set up customer database
3. Create first test order
4. Assign to machine and operator
5. Complete production cycle
6. Generate invoice and deliver
7. Review and optimize process

---

**Document Version:** 1.0
**Last Updated:** 2026-01-18
**For:** 27 Manufacturing Platform
**Support:** Contact your system administrator for technical assistance
