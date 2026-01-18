# 27 Manufacturing - Create Features Documentation

## Overview

This documentation provides step-by-step guides for all create functionalities in the 27 Manufacturing platform. Each guide explains:

- **What** - Purpose and definition
- **Why** - Business need and benefits
- **How** - Step-by-step instructions with examples

---

## Quick Navigation

| Document | Description | Path |
|----------|-------------|------|
| [Customer Guide](./01-customer.md) | What is a customer, how to create accounts | `create/createNewAccount` |
| [Customer Category Guide](./02-customer-category.md) | Organize customers into categories | `create/customerCategory` |
| [Parent Company Guide](./03-parent-company.md) | Group customers under parent companies | `create/customerParentCompany` |
| [Machine Guide](./04-machine.md) | Create and manage manufacturing machines | `create/CreateMachine` |
| [Option Type Guide](./05-option-type.md) | Define product/material types with specifications | `create/CreateOptionType` |
| [Order Guide](./06-order.md) | Create manufacturing and billing orders | `create/CreateOrder` |
| [Order Type Guide](./07-order-type.md) | Configure order form templates | `create/CreateOrderType` |

---

## Hierarchy Overview

Understanding how data relates in 27 Manufacturing:

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR COMPANY (Tenant)                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      BRANCH                              │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │           CUSTOMER ORGANIZATION                  │    │    │
│  │  │                                                  │    │    │
│  │  │  Parent Company (Tata Group)                     │    │    │
│  │  │      │                                           │    │    │
│  │  │      ├── Customer Category (Premium)             │    │    │
│  │  │      │       │                                   │    │    │
│  │  │      │       └── Customer (Tata Steel Mumbai)    │    │    │
│  │  │      │       └── Customer (Tata Motors Pune)     │    │    │
│  │  │      │                                           │    │    │
│  │  │      └── Customer Category (Corporate)           │    │    │
│  │  │              │                                   │    │    │
│  │  │              └── Customer (Tata Chemicals)       │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              PRODUCTION SETUP                    │    │    │
│  │  │                                                  │    │    │
│  │  │  Machine Types → Machines → Machine Operators    │    │    │
│  │  │  Steps → Production Workflow                     │    │    │
│  │  │  Option Types → Options → Specifications         │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │                   ORDERS                         │    │    │
│  │  │                                                  │    │    │
│  │  │  Order Type → Order → Customer                   │    │    │
│  │  │                  ↓                               │    │    │
│  │  │            Options (Products, Materials)         │    │    │
│  │  │                  ↓                               │    │    │
│  │  │         Steps → Machines → Production Data       │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Recommended Setup Order

Follow this order when setting up your system for the first time:

1. **Parent Companies** - Create umbrella organizations first
2. **Customer Categories** - Define how you classify customers
3. **Customers** - Create individual customer accounts
4. **Machine Types & Machines** - Set up your manufacturing equipment
5. **Option Types & Options** - Define your products and materials
6. **Steps** - Create production workflow steps
7. **Order Types** - Configure order form templates
8. **Orders** - Start creating orders!

---

## Common Features

### Bulk Import (Excel)

Most create forms support bulk import via Excel:

1. Click **"Import"** button
2. Download the **template** file
3. Fill in your data following the template format
4. Upload the completed file
5. Review validation results
6. Confirm import

### Edit Mode

To edit existing records:

1. Go to **Edit** menu
2. Find the list view (e.g., "Edit Accounts")
3. Click on a row to edit
4. Make changes in the form
5. Click **Save**

### Delete Records

1. Open the record in edit mode
2. Click **Delete** button
3. Confirm deletion in the dialog

---

## File Paths Reference

| Feature | Create Path | Edit Path |
|---------|-------------|-----------|
| Customer | `src/componest/second/menu/create/createNewAccount` | `src/componest/second/menu/Edit/EditAccountList` |
| Category | `src/componest/second/menu/create/customerCategory` | `src/componest/second/menu/Edit/EditCustomerCategoryList` |
| Parent Company | `src/componest/second/menu/create/customerParentCompany` | `src/componest/second/menu/Edit/EditParentCompanyList` |
| Machine | `src/componest/second/menu/create/CreateMachine` | `src/componest/second/menu/Edit/EditMachineList` |
| Option Type | `src/componest/second/menu/create/CreateOptionType` | `src/componest/second/menu/Edit/EditOptionTypeList` |
| Order | `src/componest/second/menu/create/CreateOrder` | `src/componest/second/menu/Edit/EditOrderList` |
| Order Type | `src/componest/second/menu/create/CreateOrderType` | `src/componest/second/menu/Edit/EditOrderTypeList` |

---

## Support

For technical issues or feature requests, contact your system administrator.
