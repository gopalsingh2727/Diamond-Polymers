# Machine Documentation

## What is a Machine?

A **Machine** represents manufacturing equipment in your factory. Each machine record tracks:

- Machine name and type
- Current status (active, inactive, maintenance)
- Production data configuration
- Assigned operators

---

## Why Do You Need Machines?

| Purpose | Description |
|---------|-------------|
| **Production Tracking** | Track which machine processed which order |
| **Capacity Planning** | Know available machines for scheduling |
| **Maintenance** | Track machine status and downtime |
| **Data Collection** | Configure what data to capture during production |
| **Performance Analysis** | Analyze output per machine |

---

## Machine Fields Explained

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| **Machine Name** | Yes | Unique identifier | "Printing Machine 01" |
| **Machine Type** | Yes | Category of machine | "Printing" |
| **Status** | No | Current state | "Active" |

### Status Options

| Status | Description |
|--------|-------------|
| **Active** | Machine is operational and available |
| **Inactive** | Machine is not in use |

---

## How to Create a Machine

### Step 1: Navigate to Create Machine

```
Menu → Create → Machine
```

**File Path:** `main27/src/componest/second/menu/create/CreateMachine`

### Step 2: Select Machine Type

1. Click the **Machine Type** dropdown
2. Select from available types
3. If type doesn't exist, create it first in Machine Types

### Step 3: Enter Machine Name

1. Enter a unique **Machine Name**
2. Use clear, identifiable names
3. Example: "Extruder-01", "Printing-A", "Lamination-1"

### Step 4: Set Status

1. Click **Active** or **Inactive** toggle
2. Default is usually Active

### Step 5: Save

Click **Save** to create the machine.

---

## Visual Guide

```
┌────────────────────────────────────────────────────────────┐
│                      CREATE MACHINE                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Machine Type *                                        │  │
│  │ [▼ Printing_________________________________]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Machine Name *                                        │  │
│  │ [Printing Machine 01____________________________]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Status:                                                    │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │  ● Active   │  │  ○ Inactive │                         │
│  └─────────────┘  └─────────────┘                         │
│                                                             │
│                    ┌──────────┐  ┌──────────┐             │
│                    │  Import  │  │   Save   │             │
│                    └──────────┘  └──────────┘             │
└────────────────────────────────────────────────────────────┘

* = Required field
```

---

## Bulk Import Machines

### Template Format

| Column | Required | Description |
|--------|----------|-------------|
| machineType | Yes | Must match existing type name |
| machineName | Yes | Unique name |
| status | No | "active" or "inactive" |

**Maximum:** 50 machines per import

---

## Examples

### Example 1: Printing Machine

```
Machine Type: Printing
Machine Name: Flexo Printer 01
Status: Active
```

### Example 2: Extrusion Machine

```
Machine Type: Extrusion
Machine Name: Extruder Line A
Status: Active
```

### Example 3: Machine Under Maintenance

```
Machine Type: Lamination
Machine Name: Laminator 02
Status: Inactive (under repair)
```

---

## Related Documentation

- [Order](./06-order.md) - Assign machines to orders
- [Option Type](./05-option-type.md) - Define products processed by machines
