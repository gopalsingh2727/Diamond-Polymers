# 👥 Account Management System - Complete Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Account Types](#account-types)
3. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
4. [Industry Examples](#industry-examples)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Multi-Company (B2B) Setup](#multi-company-b2b-setup)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is the Account Management System?

The **Account Management System** in 27 Manufacturing handles all user accounts, company profiles, authentication, and access control across your manufacturing operations.

**Key Features:**
- **User Management** - Create and manage employee accounts
- **Role-Based Access Control** - Assign permissions based on job roles
- **Company Profile** - Manage company information and settings
- **Multi-Company (B2B)** - Partner with other companies for cross-company orders
- **Team Organization** - Organize users into departments/teams
- **Activity Tracking** - Monitor user actions and login history
- **Subscription Management** - Handle plan upgrades and billing

```
┌─────────────────────────────────────────────────────────────┐
│              ACCOUNT MANAGEMENT SYSTEM                       │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Company    │────────▶│    Users     │                 │
│  │   Profile    │         │  (Employees) │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                        │                          │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Subscription │         │    Roles &   │                 │
│  │  (Plan)      │         │ Permissions  │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                        │                          │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   B2B        │         │   Access     │                 │
│  │ Partnerships │         │   Control    │                 │
│  └──────────────┘         └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. Company Account**
- Main organizational entity
- Unique company ID
- Subscription plan (Starter/Professional/Enterprise)
- Company settings and preferences

**2. User Accounts**
- Individual employee logins
- Linked to company
- Assigned roles and permissions
- Personal profile and settings

**3. Roles**
- Admin, Manager, Supervisor, Operator, Accountant, etc.
- Define what actions users can perform
- Can be customized per company

**4. Permissions**
- Granular access control
- Module-level (Orders, Inventory, Reports)
- Action-level (Create, Edit, Delete, View)

**5. B2B Partnerships**
- Connections between companies
- Cross-company order forwarding
- Shared resources and collaboration

---

## Account Types

### 1. Company Account (Master Account)

**What it includes:**
- Company name, logo, contact details
- GST/Tax registration information
- Subscription plan and billing
- Default settings for the organization
- Company-wide configurations

**Created when:**
- First-time registration/signup
- One company account per organization

### 2. Admin User Account

**Capabilities:**
- Full access to all modules
- User management (create, edit, delete users)
- Company settings configuration
- Subscription and billing management
- B2B partnership setup

**Created when:**
- Company registration (first admin)
- Promoted from other roles

### 3. Manager Account

**Capabilities:**
- Access to most modules
- Create and manage orders
- View reports and analytics
- Manage inventory
- Limited user management

**Use cases:**
- Production managers
- Operations managers
- Department heads

### 4. Supervisor Account

**Capabilities:**
- Oversee production operations
- Assign work to operators
- Monitor machine performance
- View production reports
- Approve operator entries

**Use cases:**
- Shop floor supervisors
- Shift in-charges
- Production coordinators

### 5. Operator Account

**Capabilities:**
- Limited to assigned machines
- Enter production data (View Templates)
- Mark orders in progress/complete
- View assigned tasks only

**Use cases:**
- Machine operators
- Production line workers
- Shop floor staff

### 6. Accountant Account

**Capabilities:**
- Access to financial modules
- Generate invoices
- View order costs and billing
- Export financial reports
- Limited access to production data

**Use cases:**
- Accountants
- Finance staff
- Billing executives

### 7. Viewer Account

**Capabilities:**
- Read-only access
- View orders and reports
- No create/edit/delete permissions

**Use cases:**
- Clients (limited access)
- Auditors
- Observers

---

## Step-by-Step Setup Guide

### Step 1: Company Registration (First Time)

**Action:** Sign up for 27 Manufacturing platform

#### 1.1 Provide Company Information
```
Company Name: ABC Plastics Pvt. Ltd.
Email: admin@abcplastics.com
Phone: +91 98765 43210
Address: Plot 123, Industrial Area, Mumbai
GST Number: 27AABCU9603R1ZX
```

#### 1.2 Select Subscription Plan
```
Plans Available:
├─ Starter: ₹5,000/month (1 machine, 5 users)
├─ Professional: ₹15,000/month (5 machines, 20 users)
└─ Enterprise: ₹30,000/month (Unlimited machines & users)

Selected: Professional Plan
```

#### 1.3 Create Admin Account
```
Name: Rajesh Kumar
Email: rajesh@abcplastics.com
Phone: +91 98765 00001
Password: [Set secure password]
Role: Admin (automatically assigned)
```

**Result:**
- Company account created with unique ID
- Admin user created and logged in
- Access to dashboard and all modules

---

### Step 2: Add Team Members (Users)

**Action:** Settings → User Management → Add User

#### 2.1 Basic User Information
```
Name: Suresh Patil
Email: suresh@abcplastics.com
Phone: +91 98765 00002
Role: Manager
Department: Production
```

#### 2.2 Assign Permissions
```
Modules Access:
☑ Orders (Create, Edit, View, Delete)
☑ Inventory (Create, Edit, View)
☑ Machines (View, Assign)
☑ Reports (View, Export)
☐ User Management (No access)
☐ Company Settings (No access)
☐ Billing (No access)
```

#### 2.3 Assign Machines (For Operators)
```
For Operator: Ramesh Yadav
Assigned Machines:
☑ Extrusion-001
☑ Extrusion-002
☐ Printing-001 (Not assigned)
```

#### 2.4 Set Status
```
Status: Active (User can log in)
Status: Inactive (User cannot log in, account disabled)
```

**Result:**
- User receives login credentials via email
- User can log in with assigned permissions
- Dashboard shows only accessible modules

---

### Step 3: Configure User Roles

**Action:** Settings → Roles & Permissions

#### 3.1 Review Default Roles
```
Default Roles:
1. Admin - Full access
2. Manager - Most modules, limited settings
3. Supervisor - Production oversight
4. Operator - Machine operation only
5. Accountant - Financial modules
6. Viewer - Read-only access
```

#### 3.2 Customize Roles (Optional)
```
Create Custom Role: "Quality Inspector"

Permissions:
☑ View Orders (Read-only)
☑ View Production Data (Read-only)
☑ Add Quality Reports (Create, Edit)
☑ View Inventory (Read-only)
☐ All other modules (No access)
```

#### 3.3 Assign Custom Roles
```
User: Priya Sharma
Role: Quality Inspector (Custom)
```

**Result:**
- Roles match your organizational structure
- Fine-grained access control
- Users see only relevant features

---

### Step 4: Set Up Departments/Teams (Optional)

**Action:** Settings → Teams/Departments

#### 4.1 Create Departments
```
1. Production Department
   └─ Users: Suresh (Manager), Ramesh (Operator), Vijay (Operator)

2. Quality Control
   └─ Users: Priya (Inspector), Amit (Inspector)

3. Accounts
   └─ Users: Kavita (Accountant), Nitin (Accountant)

4. Sales
   └─ Users: Deepak (Sales Manager), Pooja (Sales Executive)
```

#### 4.2 Assign Team Leads
```
Production Department → Team Lead: Suresh Patil
Quality Control → Team Lead: Priya Sharma
```

**Result:**
- Organized team structure
- Easier user management
- Team-based reporting

---

### Step 5: Configure Company Settings

**Action:** Settings → Company Profile

#### 5.1 Update Company Details
```
Company Logo: [Upload image]
Primary Color: #1976d2 (for branding)
Time Zone: Asia/Kolkata (IST)
Currency: INR (₹)
Date Format: DD/MM/YYYY
```

#### 5.2 Business Settings
```
Business Type: Manufacturing
Industry: Plastics & Packaging
Working Days: Monday to Saturday
Working Hours: 09:00 AM - 06:00 PM
Shift Timings:
  ├─ Shift A: 06:00 AM - 02:00 PM
  ├─ Shift B: 02:00 PM - 10:00 PM
  └─ Shift C: 10:00 PM - 06:00 AM
```

#### 5.3 Tax Settings
```
GST Enabled: Yes
GST Rate: 18%
Tax Type: GST (India)
HSN Code: 3920 (Plastics)
```

**Result:**
- Consistent branding across platform
- Accurate time tracking
- Correct tax calculations on invoices

---

### Step 6: Set Up B2B Partnerships (If Applicable)

**Action:** Settings → B2B Partnerships

#### 6.1 Send Partnership Request
```
Partner Company: XYZ Printing Services
Partner Email: admin@xyzprinting.com
Partnership Type: Supplier (They provide printing services)
Message: "We want to collaborate for printing orders"
```

#### 6.2 Partner Accepts Request
```
Partner receives email → Logs in → Accepts partnership
Status: Active Partnership
```

#### 6.3 Configure Partnership Settings
```
Allow Order Forwarding: Yes
Share Inventory Data: No
Share Production Data: No
Auto-Accept Orders: No (Manual approval required)
```

**Result:**
- Cross-company collaboration enabled
- Forward orders to partners
- Track partner order status

---

## Industry Examples

### Example 1: Small Plastic Bag Manufacturer (Starter Plan)

**Company:** QuickBag Industries
**Team Size:** 5 users
**Machines:** 1 extrusion machine, 1 bag making machine

#### Account Structure:
```
1. Admin Account
   Name: Owner - Prakash Singh
   Access: Full access to all modules

2. Production Manager
   Name: Sunil Kumar
   Access: Orders, Machines, Inventory, Reports
   Assigned Machines: All

3. Operator 1
   Name: Raju
   Access: Extrusion machine only
   Assigned Machines: Extrusion-001

4. Operator 2
   Name: Mohan
   Access: Bag making machine only
   Assigned Machines: BagMaking-001

5. Accountant
   Name: Geeta Devi
   Access: Invoicing, Reports (Financial)
```

#### Usage Pattern:
- Owner manages company, billing, and major decisions
- Manager creates orders and assigns to machines
- Operators enter production data on their machines
- Accountant generates invoices for completed orders

---

### Example 2: Medium Printing Company (Professional Plan)

**Company:** ColorPrint Solutions
**Team Size:** 18 users
**Machines:** 3 flexo printers, 2 laminators, 1 slitter

#### Account Structure:
```
1. Admin (1 user)
   └─ CEO/Owner

2. Managers (3 users)
   ├─ Production Manager
   ├─ Operations Manager
   └─ Sales Manager

3. Supervisors (3 users)
   ├─ Shift A Supervisor
   ├─ Shift B Supervisor
   └─ Quality Supervisor

4. Operators (9 users)
   ├─ 3 Printing operators
   ├─ 2 Lamination operators
   ├─ 2 Slitting operators
   └─ 2 Quality inspectors

5. Office Staff (2 users)
   ├─ Accountant
   └─ Sales Executive
```

#### Departments:
```
Production Department
├─ Production Manager (Lead)
├─ Shift Supervisors (3)
└─ Operators (7)

Quality Control
├─ Quality Supervisor (Lead)
└─ Inspectors (2)

Accounts & Sales
├─ Accountant
└─ Sales Executive
```

---

### Example 3: Large Manufacturing Facility (Enterprise Plan)

**Company:** MegaManufacturing Pvt. Ltd.
**Team Size:** 75 users
**Machines:** 15+ machines across multiple production lines

#### Account Structure:
```
1. Admin Team (3 users)
   ├─ CEO
   ├─ IT Head
   └─ HR Head

2. Management Team (8 users)
   ├─ Production Director
   ├─ 3 Production Managers (Line A, B, C)
   ├─ Quality Manager
   ├─ Inventory Manager
   ├─ Sales & Marketing Head
   └─ Finance Manager

3. Supervisors (12 users)
   ├─ 9 Shift Supervisors (3 shifts × 3 lines)
   └─ 3 Department Supervisors (QC, Inventory, Maintenance)

4. Operators & Staff (50 users)
   ├─ 30 Machine operators
   ├─ 10 Quality inspectors
   ├─ 5 Inventory staff
   └─ 5 Maintenance staff

5. Office Team (12 users)
   ├─ 3 Accountants
   ├─ 5 Sales executives
   ├─ 2 Purchase officers
   └─ 2 Admin staff
```

#### Department Structure:
```
Production
├─ Line A (10 users)
├─ Line B (10 users)
└─ Line C (10 users)

Quality Control (13 users)
Inventory Management (8 users)
Sales & Marketing (7 users)
Finance & Accounts (5 users)
Administration (12 users)
```

---

### Example 4: Multi-Location Manufacturing (Enterprise Plan)

**Company:** PanIndia Packaging
**Locations:** Mumbai, Delhi, Bangalore
**Team Size:** 120 users across 3 locations

#### Account Structure by Location:
```
Mumbai Factory (Main HQ) - 50 users
├─ CEO, CTO, CFO (Admin access)
├─ 5 Managers
├─ 10 Supervisors
├─ 30 Operators
└─ 5 Office staff

Delhi Factory - 40 users
├─ Factory Manager (Admin for Delhi)
├─ 3 Managers
├─ 8 Supervisors
├─ 25 Operators
└─ 4 Office staff

Bangalore Factory - 30 users
├─ Factory Manager (Admin for Bangalore)
├─ 2 Managers
├─ 6 Supervisors
├─ 20 Operators
└─ 2 Office staff
```

#### Access Control:
```
Mumbai HQ Users:
└─ Can view/manage all locations

Delhi Factory Users:
└─ Can only view/manage Delhi data

Bangalore Factory Users:
└─ Can only view/manage Bangalore data

Exception:
├─ CEO: Full access to all locations
├─ CFO: Financial data from all locations
└─ Sales Head: Sales data from all locations
```

---

### Example 5: B2B Partnership Setup

**Scenario:** Film manufacturer partners with printing company

**Company A:** PremiumFilms Pvt. Ltd. (Film extrusion)
**Company B:** PrintMasters (Flexo printing)

#### Partnership Configuration:

**Company A (Film Manufacturer):**
```
Users Setup:
├─ Admin: Owner
├─ Production Manager: Manages film production
└─ B2B Coordinator: Handles orders for Company B

B2B Partnership Settings:
├─ Partner: PrintMasters
├─ Allow Order Forwarding: Yes (Forward printing orders)
├─ Auto-Accept Orders: No (Manual approval)
└─ Shared Data: Order status only
```

**Company B (Printing Company):**
```
Users Setup:
├─ Admin: Owner
├─ Production Manager: Manages printing
└─ Customer Liaison: Handles orders from Company A

B2B Partnership Settings:
├─ Partner: PremiumFilms
├─ Receive Forwarded Orders: Yes
├─ Auto-Accept Orders: Yes (Trust partner)
└─ Send Status Updates: Yes (Real-time)
```

#### Workflow:
```
1. Company A receives printing order from customer
2. Company A forwards order to Company B (PrintMasters)
3. Company B receives forwarded order notification
4. Company B accepts order and starts production
5. Company B updates status (In Progress → Completed)
6. Company A sees updated status in real-time
7. Company A delivers final product to customer
```

---

## User Roles and Permissions

### Permission Matrix

| Module | Admin | Manager | Supervisor | Operator | Accountant | Viewer |
|--------|-------|---------|------------|----------|------------|--------|
| **Orders** |
| Create Order | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Order | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Order | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Orders | ✅ | ✅ | ✅ | ⚠️ Assigned | ✅ | ✅ |
| **Machines** |
| Add Machine | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Machine | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Operator | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Machines | ✅ | ✅ | ✅ | ⚠️ Assigned | ❌ | ✅ |
| **Production** |
| Enter Data | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Entry | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Production | ✅ | ✅ | ✅ | ⚠️ Own data | ✅ | ✅ |
| **Inventory** |
| Add Stock | ✅ | ✅ | ⚠️ Limited | ❌ | ❌ | ❌ |
| Edit Stock | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Inventory | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Reports** |
| Production Reports | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Financial Reports | ✅ | ⚠️ Limited | ❌ | ❌ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Invoicing** |
| Generate Invoice | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Edit Invoice | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Invoices | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **User Management** |
| Add User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Settings** |
| Company Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Billing/Subscription | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| B2B Partnerships | ✅ | ⚠️ View only | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full Access
- ❌ No Access
- ⚠️ Limited/Conditional Access

---

## Multi-Company (B2B) Setup

### Understanding B2B Partnerships

**Use Cases:**
1. **Outsourcing:** Forward orders to partner companies for specialized processes
2. **Collaboration:** Share resources and capacity
3. **Supply Chain:** Integrate suppliers and customers into workflow
4. **Cross-Selling:** Partner companies refer customers to each other

### B2B Partnership Types

#### 1. Supplier Partnership
```
Your Company: Bag manufacturer
Partner: Film extrusion company (supplies raw film)

Configuration:
├─ Allow Order Forwarding: No (You don't forward orders to supplier)
├─ Receive Material Updates: Yes (Track when material is ready)
└─ Shared Data: Inventory levels (See supplier stock)
```

#### 2. Service Provider Partnership
```
Your Company: Film manufacturer
Partner: Printing company (provides printing service)

Configuration:
├─ Allow Order Forwarding: Yes (Forward printing orders)
├─ Auto-Accept: No (Partner manually accepts)
├─ Track Status: Yes (See printing progress)
└─ Shared Data: Order status only
```

#### 3. Customer Partnership
```
Your Company: Printer
Partner: Packaging company (your customer)

Configuration:
├─ Allow Order Creation: Yes (Partner can create orders in your system)
├─ View Own Orders Only: Yes (Partner sees only their orders)
├─ Pricing Access: Yes (Partner sees agreed pricing)
└─ Shared Data: Order status and delivery tracking
```

#### 4. Peer Partnership (Same Industry)
```
Your Company: Bag manufacturer
Partner: Another bag manufacturer (excess capacity sharing)

Configuration:
├─ Bidirectional Forwarding: Yes (Both can forward orders)
├─ Capacity Sharing: Yes (Share machine availability)
├─ Auto-Accept: No (Both manually accept)
└─ Shared Data: Order status, capacity calendar
```

### Setting Up B2B Partnership

**Step 1: Initiate Partnership**
```
Action: Settings → B2B Partnerships → Add Partner

Partner Details:
├─ Partner Company Name: PrintMasters Pvt. Ltd.
├─ Partner Email: admin@printmasters.com
├─ Partnership Type: Service Provider
└─ Message: "We'd like to forward printing orders to you"

Click: Send Partnership Request
```

**Step 2: Partner Accepts**
```
Partner receives email notification
Partner logs into their account
Partner reviews request
Partner clicks: Accept Partnership

Status Changes: Pending → Active
```

**Step 3: Configure Partnership Settings**
```
Settings → B2B Partnerships → [Partner Name] → Configure

Order Forwarding:
☑ Allow order forwarding to partner
☑ Require approval before forwarding
☐ Auto-accept all forwarded orders (Partner decides)

Data Sharing:
☑ Share order status
☐ Share inventory data
☐ Share production data
☑ Share delivery tracking

Notifications:
☑ Notify when order is forwarded
☑ Notify when partner updates status
☑ Notify when order is completed
```

**Step 4: Forward First Order**
```
1. Create order in your system
2. Open order details
3. Click "Forward to Partner"
4. Select partner: PrintMasters
5. Add note: "Please print this design on our film"
6. Click: Forward Order

Partner receives notification
Partner accepts order
Partner starts production
You track status in real-time
```

---

## Best Practices

### 1. User Account Management

**DO:**
- Use work email addresses for all users
- Assign specific roles based on job responsibilities
- Regularly review and update user permissions
- Disable accounts for departed employees immediately
- Use strong password policies
- Enable two-factor authentication (if available)

**DON'T:**
- Share login credentials between users
- Give admin access to everyone
- Use personal email addresses for company accounts
- Leave inactive accounts enabled
- Assign permissions beyond what's needed (principle of least privilege)

### 2. Role Assignment

**Best Practice Structure:**
```
Small Company (< 10 users):
├─ 1 Admin (Owner)
├─ 1-2 Managers
└─ 5-7 Operators

Medium Company (10-50 users):
├─ 1-2 Admins
├─ 3-5 Managers
├─ 2-3 Supervisors
├─ 15-30 Operators
└─ 2-5 Office staff

Large Company (50+ users):
├─ 2-3 Admins
├─ 5-10 Managers
├─ 10-15 Supervisors
├─ 30-60 Operators
└─ 10-20 Office staff
```

### 3. Password Security

**Requirements:**
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- Change passwords every 90 days
- Don't reuse old passwords
- Don't share passwords

**Examples:**
```
❌ Bad Passwords:
- password123
- company@2024
- 12345678
- admin123

✅ Good Passwords:
- Mfg#2024$Secure
- Pr0duct!0n@ABC
- Ex7ru$ion#2024
```

### 4. Department Organization

**Recommended Structure:**
```
By Function:
├─ Production (Operators, Supervisors)
├─ Quality (Inspectors, QC Manager)
├─ Inventory (Store keepers, Inventory Manager)
├─ Sales (Sales team)
└─ Accounts (Accountants, Finance team)

By Shift (for 24/7 operations):
├─ Shift A (06:00-14:00)
├─ Shift B (14:00-22:00)
└─ Shift C (22:00-06:00)

By Product Line:
├─ Extrusion Line
├─ Printing Line
└─ Finishing Line
```

### 5. B2B Partnership Guidelines

**Before Partnering:**
- Verify partner company credentials
- Define clear scope of partnership
- Agree on order approval process
- Set expectations for turnaround time
- Establish communication protocols

**Partnership Agreement:**
```
Document these details:
├─ What orders can be forwarded
├─ Pricing/payment terms
├─ Quality standards
├─ Delivery timelines
├─ Dispute resolution process
└─ Data privacy and confidentiality
```

### 6. Onboarding New Users

**Checklist:**
```
Before First Login:
☐ Create user account with correct role
☐ Assign appropriate permissions
☐ Assign machines (for operators)
☐ Add to relevant department/team
☐ Set status to Active

After Account Creation:
☐ Send login credentials securely
☐ Provide user manual/training
☐ Give system walkthrough (first time)
☐ Assign a mentor (for operators)
☐ Monitor initial usage for questions

First Week:
☐ Check login activity
☐ Verify data entry accuracy (for operators)
☐ Address any questions/issues
☐ Collect feedback on usability
```

### 7. Offboarding Users (Employee Leaving)

**Checklist:**
```
Immediately:
☐ Change account status to Inactive
☐ Revoke all permissions
☐ Notify team about user departure

Within 24 Hours:
☐ Transfer ownership of pending tasks
☐ Reassign machines (if operator)
☐ Export user's activity log (for records)
☐ Remove from all departments/teams

Within 1 Week:
☐ Archive user data (don't delete)
☐ Update organizational charts
☐ Review and revoke B2B access (if applicable)
```

---

## Troubleshooting

### Issue 1: User Cannot Log In

**Symptoms:**
- "Invalid credentials" error
- Password not accepted
- Account locked

**Diagnosis:**
```
Check:
1. Is account status Active?
2. Is password correct (case-sensitive)?
3. Is account locked after multiple failed attempts?
4. Has password expired?
```

**Solution:**
```
For Admin:
1. Go to Settings → User Management
2. Find user account
3. Check status (Active/Inactive)
4. Click "Reset Password" → Send reset link to user
5. If locked, click "Unlock Account"

For User:
1. Click "Forgot Password" on login page
2. Enter registered email
3. Check email for reset link
4. Create new password
5. Try logging in again
```

---

### Issue 2: User Cannot Access Specific Module

**Symptoms:**
- Module not visible in menu
- "Access Denied" error when clicking module

**Diagnosis:**
```
User permissions issue:
1. Check user role
2. Verify module permissions for that role
3. Check if subscription plan includes module (e.g., advanced features in Enterprise only)
```

**Solution:**
```
Admin Action:
1. Go to Settings → User Management
2. Find user → Click Edit
3. Review assigned role
4. Check module permissions
5. Update permissions if needed
6. Save changes
7. Ask user to log out and log back in
```

---

### Issue 3: Cannot Add New User (Limit Reached)

**Symptoms:**
- "User limit exceeded" error
- Add User button disabled

**Diagnosis:**
```
Subscription plan limit reached:
- Starter: 5 users max
- Professional: 20 users max
- Enterprise: Unlimited users
```

**Solution:**
```
Option 1: Upgrade Subscription
1. Go to Settings → Billing & Subscription
2. Click "Upgrade Plan"
3. Select higher plan (Professional or Enterprise)
4. Complete payment
5. User limit increased immediately

Option 2: Remove Inactive Users
1. Go to Settings → User Management
2. Filter: Show Inactive users
3. Permanently delete users no longer needed
4. Frees up user slots
```

---

### Issue 4: B2B Partnership Request Not Received

**Symptoms:**
- Partner says they didn't receive partnership request email

**Diagnosis:**
```
Possible causes:
1. Wrong email address entered
2. Email in spam folder
3. Partner's email server blocking
4. Typo in partner email
```

**Solution:**
```
Step 1: Verify Email
1. Go to Settings → B2B Partnerships
2. Check pending requests
3. Verify partner email address
4. If wrong, cancel request and resend with correct email

Step 2: Contact Partner
1. Call partner to confirm email address
2. Ask them to check spam/junk folder
3. Ask them to whitelist @27manufacturing.com emails

Step 3: Resend Request
1. Cancel old request (if wrong email)
2. Send new request with verified email
3. Inform partner to expect email
```

---

### Issue 5: Operator Can't See Assigned Machine

**Symptoms:**
- Operator logs in but sees no machines
- Dashboard shows "No machines assigned"

**Diagnosis:**
```
Machine assignment issue:
1. Machine not assigned to operator
2. Machine status is Inactive
3. Operator account issue
```

**Solution:**
```
Admin Action:
1. Go to Settings → User Management
2. Find operator account → Click Edit
3. Scroll to "Assigned Machines" section
4. Check boxes for machines operator should access
5. Ensure machines are Active status
6. Save changes

Verify:
1. Go to Machines → View All Machines
2. Find machine → Check status (should be Active)
3. Check assigned operators list (operator should be listed)

Ask Operator to:
1. Log out completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Log back in
4. Machines should now appear
```

---

### Issue 6: Two-Factor Authentication (2FA) Issues

**Symptoms:**
- Lost access to 2FA device
- 2FA code not working
- Can't complete login

**Solution:**
```
For Admin:
1. Go to Settings → User Management
2. Find user with 2FA issue
3. Click "Disable 2FA" (temporarily)
4. User can now log in with password only
5. User should re-enable 2FA after login

For User (If admin unavailable):
1. Click "Having trouble with 2FA?" on login page
2. Enter backup codes (if saved during 2FA setup)
3. Use backup code to log in
4. Go to Settings → Security → Reset 2FA
5. Set up 2FA again with new device

Prevention:
- Save backup codes during 2FA setup
- Use authenticator app on multiple devices
- Note down recovery phone number
```

---

### Issue 7: Permission Changes Not Reflecting

**Symptoms:**
- Admin updates user permissions
- User still sees old permissions
- Module access unchanged

**Diagnosis:**
```
Session cache issue:
User's session is still using old permissions cached from previous login
```

**Solution:**
```
User Must:
1. Log out completely from the system
2. Close all browser tabs
3. Clear browser cache (Optional but recommended):
   - Chrome: Ctrl+Shift+Delete
   - Select "Cached images and files"
   - Clear data
4. Log back in
5. New permissions will now be active

For Mobile App Users:
1. Force close the app completely
2. Restart the app
3. Log in again
```

---

### Issue 8: Subscription Payment Failed

**Symptoms:**
- Account suspended
- "Payment overdue" notification
- Limited access to system

**Diagnosis:**
```
Payment issue:
1. Credit card expired
2. Insufficient balance
3. Bank declined transaction
4. Payment method removed
```

**Solution:**
```
Immediate Action:
1. Go to Settings → Billing & Subscription
2. Click "Update Payment Method"
3. Enter new card details or use different method
4. Click "Retry Payment"
5. Account reactivated immediately upon successful payment

If Payment Still Fails:
1. Contact your bank to authorize transaction
2. Try different payment method
3. Contact 27 Manufacturing support for payment link
4. Support can provide 3-day grace period while resolving

Prevention:
- Keep payment method up to date
- Enable auto-renewal notifications
- Add backup payment method
- Monitor subscription renewal dates
```

---

## Conclusion

The 27 Manufacturing Account Management System provides comprehensive user and company management with:

✅ **Flexible User Roles** - From Admin to Operator, customizable for your needs
✅ **Granular Permissions** - Control exactly what each user can access
✅ **Team Organization** - Departments, shifts, and hierarchies
✅ **B2B Collaboration** - Partner with other companies seamlessly
✅ **Subscription Management** - Easy plan upgrades as you grow
✅ **Security** - Role-based access control, activity tracking

**Key Success Factors:**
1. Assign roles carefully based on job responsibilities
2. Review and update permissions regularly
3. Onboard new users with proper training
4. Disable accounts for departed employees immediately
5. Use B2B partnerships to extend your capabilities
6. Keep payment methods up to date for uninterrupted service

**Need Help?**
- Review this guide for detailed setup instructions
- Check troubleshooting section for common issues
- Contact your system administrator or support team

---

**Document Version:** 1.0
**Last Updated:** 2026-01-18
**For:** 27 Manufacturing Platform
**Support:** Contact your system administrator for technical assistance
