# Customer (Account) Documentation

## What is a Customer?

A **Customer** (also called an **Account**) represents a business or company that places orders with your manufacturing company. Each customer record stores:

- Company information (name, GST number)
- Contact details (phone, email, WhatsApp)
- Address information
- Organization classification (category and parent company)

---

## Why Do You Need Customers?

| Purpose | Description |
|---------|-------------|
| **Order Management** | Every order must be linked to a customer |
| **Contact Information** | Store multiple contact methods for easy communication |
| **GST Compliance** | Track GST numbers for tax invoices |
| **Organization** | Group customers by category and parent company for reporting |
| **History** | Track order history per customer |

---

## Customer Fields Explained

### Required Fields (Orange Highlighted)

| Field | Description | Example |
|-------|-------------|---------|
| **Company Name** | Legal business name | "Reliance Industries Ltd" |
| **Phone 1** | Primary contact number | "9876543210" |
| **Address Line 1** | Main address | "123, Industrial Area" |
| **State** | Indian state | "Maharashtra" |
| **Pin Code** | Postal code (6 digits) | "400001" |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| **GST Number** | 15-character GST ID | "27AABCU9603R1ZM" |
| **First Name** | Contact person first name | "Rajesh" |
| **Last Name** | Contact person last name | "Kumar" |
| **Phone 2** | Secondary phone | "9876543211" |
| **WhatsApp** | WhatsApp number | "9876543210" |
| **Telephone** | Landline number | "022-12345678" |
| **Email** | Email address | "contact@reliance.com" |
| **Address Line 2** | Additional address | "Near Highway" |
| **Customer Category** | Classification type | "Premium" |
| **Parent Company** | Parent organization | "Tata Group" |
| **Image** | Company logo/photo | Upload image |

---

## How to Create a Customer

### Step 1: Navigate to Create Account

```
Menu → Create → New Account
```

**File Path:** `main27/src/componest/second/menu/create/createNewAccount`

### Step 2: Fill Company Information

1. Enter **Company Name** (required)
2. Enter **GST Number** if applicable
   - Must be exactly 15 characters
   - Will auto-convert to uppercase

### Step 3: Add Contact Details

1. Enter **First Name** and **Last Name** of contact person
2. Enter **Phone 1** (required) - Primary contact
3. Add optional: Phone 2, WhatsApp, Telephone

### Step 4: Select Classification (Optional but Recommended)

1. Select **Customer Category** from dropdown
   - Example: Premium, Corporate, Non-Premium
2. Select **Parent Company** from dropdown
   - Example: Tata Group, Reliance Industries

### Step 5: Enter Address

1. Enter **Address Line 1** (required)
2. Enter **Address Line 2** (optional)
3. Select **State** from dropdown (required)
4. Enter **Pin Code** - 6 digits (required)

### Step 6: Upload Image (Optional)

1. Click the circular image placeholder
2. Select image file
3. Preview and confirm

### Step 7: Save

Click **Save** button to create the customer.

---

## Visual Guide

```
┌──────────────────────────────────────────────────────────────────┐
│                     CREATE NEW ACCOUNT                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────┐        │
│  │ Company Name *     │  │ GST Number         │  │ 📷   │        │
│  │ [______________]   │  │ [_______________]  │  │Image │        │
│  └────────────────────┘  └────────────────────┘  └──────┘        │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │ First Name         │  │ Last Name          │                  │
│  │ [______________]   │  │ [_______________]  │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │ Customer Category  │  │ Parent Company     │                  │
│  │ [▼ Select______]   │  │ [▼ Select______]  │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
│  ┌────────────────────┐                                          │
│  │ Email              │                                          │
│  │ [______________]   │                                          │
│  └────────────────────┘                                          │
│                                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │Phone 1* │ │Phone 2  │ │WhatsApp │ │Telephone│                │
│  │[_______]│ │[_______]│ │[_______]│ │[_______]│                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │ Address Line 1 *   │  │ Address Line 2     │                  │
│  │ [______________]   │  │ [_______________]  │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │ State *            │  │ Pin Code *         │                  │
│  │ [▼ Maharashtra__]  │  │ [400001_________]  │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
│                                        ┌─────────┐ ┌─────────┐   │
│                                        │ Import  │ │  Save   │   │
│                                        └─────────┘ └─────────┘   │
└──────────────────────────────────────────────────────────────────┘

* = Required field (highlighted in Orange)
```

---

## Bulk Import Customers

### Step 1: Click Import Button

### Step 2: Download Template

The template includes:
- **Instructions Sheet** - How to fill the data
- **Example Sheet** - Sample data
- **Template Sheet** - Empty rows to fill

### Step 3: Fill Template

| Column | Required | Format |
|--------|----------|--------|
| companyName | Yes | Text |
| firstName | No | Text |
| lastName | No | Text |
| gstNumber | No | 15 characters |
| phone1 | Yes | 10-15 digits |
| phone2 | No | 10-15 digits |
| whatsapp | No | 10-15 digits |
| telephone | No | Text |
| email | No | email@example.com |
| address1 | Yes | Text |
| address2 | No | Text |
| state | Yes | Indian state name |
| pinCode | Yes | 6 digits |
| customerCategory | No | Existing category name |
| parentCompany | No | Existing parent company name |

**Maximum:** 500 accounts per import

### Step 4: Upload and Confirm

1. Upload your filled Excel file
2. Review validation results
3. Fix any errors shown
4. Click Confirm to import

---

## Edit Customer

### Step 1: Navigate to Edit List

```
Menu → Edit → Accounts
```

### Step 2: Find Customer

- Scroll through the list
- Use search to filter

### Step 3: Click to Edit

Click on the customer row to open edit form.

### Step 4: Make Changes

Edit any field as needed.

### Step 5: Save or Delete

- Click **Save** to update
- Click **Delete** to remove (with confirmation)

---

## Examples

### Example 1: Small Business Customer

```
Company Name: Kumar Enterprises
First Name: Amit
Last Name: Kumar
Phone 1: 9876543210
WhatsApp: 9876543210
Email: amit@kumar-ent.com
Address Line 1: 45, Industrial Estate
State: Gujarat
Pin Code: 380015
Category: Non-Premium
```

### Example 2: Corporate Customer with GST

```
Company Name: Tata Steel Limited
GST Number: 27AAACT2727Q1ZW
First Name: Priya
Last Name: Sharma
Phone 1: 9123456789
Phone 2: 9123456780
Telephone: 022-67890123
Email: orders@tatasteel.com
Address Line 1: Jamshedpur Works
Address Line 2: Sakchi, Jamshedpur
State: Jharkhand
Pin Code: 831001
Category: Premium
Parent Company: Tata Group
```

### Example 3: Export Customer

```
Company Name: Dubai Plastics FZE
First Name: Mohammed
Last Name: Al-Rashid
Phone 1: +971501234567
WhatsApp: +971501234567
Email: procurement@dubplastics.ae
Address Line 1: Jebel Ali Free Zone
State: International
Pin Code: 000000
Category: Export
```

---

## Best Practices

1. **Always verify GST numbers** - Incorrect GST causes invoice issues
2. **Use consistent naming** - "Tata Steel Ltd" vs "Tata Steel Limited" are different
3. **Assign categories** - Helps in filtering and reporting
4. **Link to parent companies** - Better organization for large groups
5. **Add WhatsApp** - Easy communication with customers
6. **Upload logos** - Visual identification in lists

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Company name already exists" | Each company name must be unique per branch |
| "Invalid GST format" | GST must be exactly 15 characters |
| "Invalid pin code" | Must be exactly 6 digits |
| "Phone number invalid" | Must be 10-15 digits |
| Import fails | Check template format, maximum 500 rows |

---

## Related Documentation

- [Customer Category](./02-customer-category.md) - Classify customers
- [Parent Company](./03-parent-company.md) - Group customers
- [Orders](./06-order.md) - Create orders for customers
