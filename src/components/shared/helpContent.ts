import { HelpDocContent } from './HelpDocModal';

// Create Account Help Content
export const createAccountHelp: HelpDocContent = {
  title: 'Create Account',
  subtitle: 'Add new customer/company to your system',
  purpose: 'A Customer (Account) represents a business or company that places orders with you. Store their contact details, address, and classify them by category and parent company.',
  steps: [
    {
      title: 'Enter Company Name',
      description: 'Type the legal business name of the customer. This is required and must be unique.',
      tip: 'Use official names like "Reliance Industries Ltd" not "Reliance"'
    },
    {
      title: 'Add GST Number (Optional)',
      description: 'Enter 15-character GST number if applicable. Format: 2 digits + 13 alphanumeric characters.',
      tip: 'Example: 27AABCU9603R1ZM'
    },
    {
      title: 'Fill Contact Details',
      description: 'Add contact person name, phone numbers (Phone 1 is required), WhatsApp, and email.',
    },
    {
      title: 'Select Category & Parent Company',
      description: 'Choose Customer Category (Premium, Corporate, etc.) and Parent Company (Tata Group, Reliance, etc.) from dropdowns.',
      tip: 'Create categories and parent companies first if they don\'t exist'
    },
    {
      title: 'Enter Address',
      description: 'Fill Address Line 1 (required), Address Line 2 (optional), select State (required), and enter 6-digit Pin Code (required).',
    },
    {
      title: 'Upload Image (Optional)',
      description: 'Click the image circle to upload company logo. Double-click to change existing image.',
    },
    {
      title: 'Click Save',
      description: 'Review all fields and click "Create Account" button. Form will reset for next entry.',
    }
  ],
  sections: [
    {
      title: 'Required Fields (Orange)',
      icon: '🟠',
      content: [
        'Company Name - Business legal name',
        'State - Select from Indian states list',
      ]
    },
    {
      title: 'Contact Information',
      icon: '📞',
      content: [
        'Phone 1 - Primary contact number',
        'Phone 2 - Secondary number (optional)',
        'WhatsApp - For quick messaging (optional)',
        'Telephone - Landline number (optional)',
        'Email - For invoices and communications (optional)'
      ]
    },
    {
      title: 'Organization',
      icon: '🏢',
      content: [
        'Customer Category - Classification (Premium, Corporate, MSME)',
        'Parent Company - Umbrella organization (Tata Group, Reliance)'
      ]
    },
    {
      title: 'Address',
      icon: '📍',
      content: [
        'Address Line 1 - Main address',
        'Address Line 2 - Additional details (optional)',
        'State - Select from list',
        'Pin Code - 6-digit postal code'
      ]
    }
  ],
  examples: [
    {
      title: 'Small Business',
      data: {
        'Company Name': 'Kumar Enterprises',
        'Phone 1': '9876543210',
        'WhatsApp': '9876543210',
        'Address': '45, Industrial Estate',
        'State': 'Gujarat',
        'Pin Code': '380015',
        'Category': 'Non-Premium'
      }
    },
    {
      title: 'Corporate with GST',
      data: {
        'Company Name': 'Tata Steel Limited',
        'GST Number': '27AAACT2727Q1ZW',
        'Phone 1': '9123456789',
        'Email': 'orders@tatasteel.com',
        'Address': 'Jamshedpur Works',
        'State': 'Jharkhand',
        'Pin Code': '831001',
        'Category': 'Premium',
        'Parent Company': 'Tata Group'
      }
    }
  ],
  tips: [
    'Always verify GST numbers before saving',
    'Use consistent company naming conventions',
    'Assign categories for better filtering and reports',
    'Link to parent companies for group-level analytics',
    'Add WhatsApp number for easy customer communication'
  ]
};

// Customer Category Help Content
export const customerCategoryHelp: HelpDocContent = {
  title: 'Customer Category',
  subtitle: 'Classify customers into groups',
  purpose: 'Customer Categories help you group similar customers together. Use them for pricing tiers, priority handling, and generating category-wise reports.',
  steps: [
    {
      title: 'Enter Category Name',
      description: 'Type a unique, descriptive name for the category. This is required.',
      tip: 'Examples: Premium, Corporate, MSME, Export, Government'
    },
    {
      title: 'Add Description (Optional)',
      description: 'Explain what qualifies a customer for this category and any special treatment they receive.',
      tip: 'Include criteria like order volume, discount rates, or service levels'
    },
    {
      title: 'Click Save',
      description: 'Review and click "Save" to create the category. It will be available in customer forms.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: ['Category Name - Unique identifier for the group']
    },
    {
      title: 'Optional Fields',
      icon: '📝',
      content: ['Description - Detailed explanation of the category criteria']
    }
  ],
  examples: [
    {
      title: 'Premium Category',
      data: {
        'Category Name': 'Premium',
        'Description': 'High-value customers with annual orders above ₹50 lakhs. Eligible for 10% discount and priority processing.'
      }
    },
    {
      title: 'MSME Category',
      data: {
        'Category Name': 'MSME',
        'Description': 'Micro, Small and Medium Enterprises. Flexible payment terms with growth incentive program.'
      }
    },
    {
      title: 'Export Category',
      data: {
        'Category Name': 'Export',
        'Description': 'International customers with USD/EUR billing. Export documentation and customs assistance provided.'
      }
    }
  ],
  tips: [
    'Keep category names short and clear',
    'Limit to 5-10 categories for easy management',
    'Document the criteria in description field',
    'Review categories periodically as business grows',
    'Create categories before adding customers'
  ]
};

// Parent Company Help Content
export const parentCompanyHelp: HelpDocContent = {
  title: 'Parent Company',
  subtitle: 'Group customers under umbrella organizations',
  purpose: 'Parent Company represents an umbrella organization that owns multiple subsidiary companies. Use it to group related customers together for consolidated reports and relationship management.',
  steps: [
    {
      title: 'Enter Company Name',
      description: 'Type the name of the parent/holding company. Use the official group name.',
      tip: 'Examples: Tata Group, Reliance Industries, Adani Group'
    },
    {
      title: 'Add Description (Optional)',
      description: 'Add details about the business group - their sectors, headquarters, or key information.',
    },
    {
      title: 'Click Save',
      description: 'Review and click "Save" to create. It will be available in customer forms.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: ['Company Name - Official name of the parent organization']
    },
    {
      title: 'Optional Fields',
      icon: '📝',
      content: ['Description - Additional details about the group']
    }
  ],
  examples: [
    {
      title: 'Large Conglomerate',
      data: {
        'Company Name': 'Tata Group',
        'Description': 'Indian multinational conglomerate. Major subsidiaries: Tata Steel, Tata Motors, TCS, Tata Chemicals.'
      }
    },
    {
      title: 'Regional Group',
      data: {
        'Company Name': 'Patel Industries Group',
        'Description': 'Local manufacturing group based in Ahmedabad. Family-owned with 3 subsidiary companies.'
      }
    },
    {
      title: 'Government Entity',
      data: {
        'Company Name': 'Government of Maharashtra',
        'Description': 'State government departments and public sector undertakings. Tender-based procurement.'
      }
    }
  ],
  tips: [
    'Use official group names for consistency',
    'Create parent companies before adding customers',
    'One customer can have only one parent company',
    'Use for multi-location customers too (e.g., ABC Industries - Mumbai, ABC Industries - Delhi)',
    'Great for tracking total business from large groups'
  ]
};

// Machine Help Content
export const createMachineHelp: HelpDocContent = {
  title: 'Create Machine',
  subtitle: 'Add manufacturing equipment to your system',
  purpose: 'Machines represent your manufacturing equipment. Track their status, assign them to orders, and collect production data for each machine.',
  steps: [
    {
      title: 'Select Machine Type',
      description: 'Choose the type of machine from the dropdown. Types categorize your equipment.',
      tip: 'Create machine types first if needed (e.g., Printing, Extrusion, Lamination)'
    },
    {
      title: 'Enter Machine Name',
      description: 'Give a unique, identifiable name to the machine.',
      tip: 'Use clear naming: "Flexo Printer 01", "Extruder Line A"'
    },
    {
      title: 'Set Status',
      description: 'Click Active (machine available) or Inactive (not in use/maintenance).',
    },
    {
      title: 'Click Save',
      description: 'Review and save. Machine will be available for order assignments.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: [
        'Machine Type - Category of equipment',
        'Machine Name - Unique identifier'
      ]
    },
    {
      title: 'Status Options',
      icon: '⚙️',
      content: [
        'Active - Machine is operational and available',
        'Inactive - Machine is not in use or under maintenance'
      ]
    }
  ],
  examples: [
    {
      title: 'Printing Machine',
      data: {
        'Machine Type': 'Printing',
        'Machine Name': 'Flexo Printer 01',
        'Status': 'Active'
      }
    },
    {
      title: 'Extrusion Line',
      data: {
        'Machine Type': 'Extrusion',
        'Machine Name': 'Extruder Line A',
        'Status': 'Active'
      }
    }
  ],
  tips: [
    'Use consistent naming conventions',
    'Set to Inactive when under maintenance',
    'Create machine types before creating machines',
    'Can bulk import up to 50 machines via Excel'
  ]
};

// Option Type Help Content
export const createOptionTypeHelp: HelpDocContent = {
  title: 'Create Option Type',
  subtitle: 'Define product/material templates with specifications',
  purpose: 'Option Types define templates for products, materials, or components. Set up specifications (dimensions) that will appear in order forms, enable inventory tracking, and create advanced formulas that reference other Option Types or specific Options. Perfect for plastic (LDPE, PP, LLDPE), steel, food packaging, and manufacturing industries.',
  steps: [
    {
      title: 'Enter Basic Information',
      description: 'Type the Option Type Name, select a Category (Product/Material/Printing/Packaging), and add a description.',
      tip: 'Example: "LDPE Granules" for plastic, "SS304 Sheet" for steel, "Food Pouch" for packaging'
    },
    {
      title: 'Enable Inventory Tracking (Optional)',
      description: 'Check "Track Inventory" if you want to track stock levels. Select units (kg, pcs, ltr) and primary unit.',
    },
    {
      title: 'Add Specifications',
      description: 'Click "Add Specification" for each dimension. Enter name, data type (Number/String), unit, and settings.',
      tip: 'Plastic: MFI, Density, Price. Steel: Thickness, Width, Length. Food: Width, Height, Barrier'
    },
    {
      title: 'Reference Other Option Types (Advanced)',
      description: 'Click "Reference Other Option Spec Dimensions" to use specs from other types in formulas. Select types like LDPE, PP to access their NUMBER specs.',
      tip: 'Use OT_LDPE_MFI or OT_PP_Density in formulas. Only works with Number type specs.'
    },
    {
      title: 'Reference Specific Options (Advanced)',
      description: 'Click "Reference Option Name Dimensions" to select specific Options. Their number dimensions become available for formulas.',
      tip: 'Use OP_LDPEGradeA_Price or OP_PPNatural_MFI. Great for cost calculations with exact prices.'
    },
    {
      title: 'Create Formulas',
      description: 'Enable "Allow Formula" on calculated specs. Use spec names, references, and math operators (+, -, *, /, ()).',
      tip: 'Weight = Thickness * Width * Length * Density / 1000 or BlendMFI = OT_LDPE_MFI * Ratio1 + OT_PP_MFI * Ratio2'
    },
    {
      title: 'Configure Visibility & Requirements',
      description: 'Set if the field is Visible (shown to users), Required (must fill). Mark calculated fields as not visible if internal only.',
    },
    {
      title: 'Click Save',
      description: 'Review all specifications and save. The option type will be available in order forms.',
    }
  ],
  sections: [
    {
      title: 'Categories',
      icon: '📦',
      content: [
        'Product - Finished goods you manufacture',
        'Material - Raw materials used in production',
        'Printing - Printing specifications',
        'Packaging - Packaging materials'
      ]
    },
    {
      title: 'Real Industry Use Cases',
      icon: '🏭',
      content: [
        'PLASTIC INDUSTRY: Create option types for LDPE, PP, LLDPE with MFI, Density, Price specs',
        'STEEL INDUSTRY: Create SS304, SS316 types with Thickness, Width, Length, Grade specs',
        'FOOD PACKAGING: Create pouch types with Width, Height, Barrier, Layers specs',
        'BLENDING: Reference LDPE and PP types to create blend with calculated MFI',
        'COST CALCULATION: Reference material Options to calculate total production cost',
        'Each industry can track specific technical parameters important to their products'
      ]
    },
    {
      title: 'Specification Fields',
      icon: '📏',
      content: [
        'Dimension Name - What you\'re measuring (Width, Height)',
        'Data Type - Number or String',
        'Unit - cm, mm, kg, g, %, pcs',
        'Default Value - Pre-filled value',
        'Visible - Show/hide from users',
        'Required - Must be filled',
        'Allow Formula - Enable calculations'
      ]
    },
    {
      title: 'Use Case: How Specifications Work',
      icon: '💡',
      content: [
        '1. Create Option Type (template) with specifications',
        '2. Each specification becomes a field in the form',
        '3. When creating Options, fill specification values',
        '4. Options appear in order dropdowns with specs',
        '5. Orders automatically show selected option specs',
        'Example: Silver Option Type → Silver 92.5% Option → Used in jewelry orders'
      ]
    },
    {
      title: 'Workflow Example',
      icon: '🔄',
      content: [
        'Step 1: Create "Silver" Option Type',
        '→ Add specs: Purity (%), Weight (g), Form (String)',
        'Step 2: Create Options using this type',
        '→ "Silver 92.5%" with Purity=92.5, Form=Bar',
        '→ "Silver 99.9%" with Purity=99.9, Form=Coin',
        'Step 3: Use in Orders',
        '→ Select "Silver 92.5%" in material dropdown',
        '→ Specs auto-fill: Purity 92.5%, Form Bar'
      ]
    },
    {
      title: '📋 Reference Other Option Spec Dimensions',
      icon: '🔗',
      content: [
        'Use specifications from other Option Types in formulas:',
        '1. Click "Reference Other Option Spec Dimensions"',
        '2. Select Option Types to reference (e.g., LDPE, PP)',
        '3. Only NUMBER dimensions appear for use in formulas',
        '4. Use in formula: OT_LDPE_MFI, OT_PP_Density',
        'Example: Create "Blend" type that references LDPE and PP specs',
        'Formula: BlendRatio = OT_LDPE_MFI / OT_PP_MFI'
      ]
    },
    {
      title: '📝 Reference Option Name Dimensions',
      icon: '🔢',
      content: [
        'Use dimensions from specific Options in formulas:',
        '1. Click "Reference Option Name Dimensions"',
        '2. Select multiple Options (e.g., "LDPE Grade A", "PP Natural")',
        '3. See all their number dimension names',
        '4. Use in formula: OP_LDPEGradeA_MFI, OP_PPNatural_Density',
        'Example: Calculate material cost based on referenced option prices',
        'Formula: TotalCost = OP_LDPE_Price * Quantity + OP_PP_Price * Quantity'
      ]
    },
    {
      title: '🧮 Creating Formulas',
      icon: '⚡',
      content: [
        'Formulas auto-calculate specification values:',
        '1. Enable "Allow Formula" on specification',
        '2. Use other spec names: Width, Height, Thickness',
        '3. Use referenced specs: OT_Material_MFI, OP_LDPE_Density',
        '4. Operators: +, -, *, /, ( )',
        '5. Functions: SUM, AVG, MAX, MIN',
        'Example: Weight = (Width * Height * Thickness * Density) / 1000',
        'Example: Cost = MaterialCost + OT_Additive_Price * AdditiveQty'
      ]
    }
  ],
  examples: [
    {
      title: 'LDPE Plastic Material',
      data: {
        'Name': 'LDPE Granules',
        'Category': 'Material',
        'Description': 'Low Density Polyethylene for film extrusion',
        'Track Inventory': 'Yes (kg)',
        'Specifications': 'MFI (Number, g/10min), Density (Number, g/cm³), Grade (String), Price (Number, ₹/kg), Melting Point (Number, °C)'
      }
    },
    {
      title: 'PP Plastic Material',
      data: {
        'Name': 'PP Granules',
        'Category': 'Material',
        'Description': 'Polypropylene for injection molding',
        'Track Inventory': 'Yes (kg)',
        'Specifications': 'MFI (Number, g/10min), Density (Number, g/cm³), Grade (String), Price (Number, ₹/kg), Flexural Modulus (Number, MPa)'
      }
    },
    {
      title: 'LLDPE Film Material',
      data: {
        'Name': 'LLDPE Film Grade',
        'Category': 'Material',
        'Description': 'Linear Low Density Polyethylene for stretch films',
        'Track Inventory': 'Yes (kg)',
        'Specifications': 'MFI (Number, g/10min), Density (Number, g/cm³), Dart Impact (Number, g), Tensile Strength (Number, MPa)'
      }
    },
    {
      title: 'Steel Sheet Material',
      data: {
        'Name': 'Stainless Steel Sheet',
        'Category': 'Material',
        'Description': 'Food grade stainless steel for packaging',
        'Track Inventory': 'Yes (kg, sheets)',
        'Specifications': 'Thickness (Number, mm), Width (Number, mm), Length (Number, mm), Grade (String), Weight (Number, kg, Formula: Thickness*Width*Length*7.85/1000000)'
      }
    },
    {
      title: 'Food Packaging Pouch',
      data: {
        'Name': 'Food Grade Pouch',
        'Category': 'Product',
        'Description': 'Multi-layer laminated pouch for food products',
        'Track Inventory': 'Yes (pcs, kg)',
        'Specifications': 'Width (Number, cm), Height (Number, cm), Gusset (Number, cm), Layers (Number), Barrier (String), Weight (Number, g, Formula: (Width*Height*Thickness*Density)/1000)'
      }
    },
    {
      title: 'Plastic Bag (Product)',
      data: {
        'Name': 'Plastic Carry Bag',
        'Category': 'Product',
        'Track Inventory': 'Yes (kg, pcs)',
        'Specifications': 'Width (Number, cm), Height (Number, cm), Thickness (Number, microns), GSM (Number, g/m²), Color (String)'
      }
    },
    {
      title: 'Material Blend with References',
      data: {
        'Name': 'LDPE-PP Blend',
        'Category': 'Material',
        'Description': 'Custom blend referencing LDPE and PP properties',
        'References': 'LDPE Granules (for MFI, Density), PP Granules (for MFI, Density)',
        'Specifications': 'LDPE_Ratio (Number, %), PP_Ratio (Number, %), Blend_MFI (Number, Formula: OT_LDPE_MFI*LDPE_Ratio + OT_PP_MFI*PP_Ratio)'
      }
    }
  ],
  tips: [
    'Start with required specifications only',
    'Use consistent units across similar option types',
    'Industry examples: LDPE, PP, LLDPE for plastics; SS304, SS316 for steel',
    'Reference other Option Types: Use OT_MaterialName_SpecName in formulas',
    'Reference specific Options: Use OP_OptionName_SpecName for exact values',
    'Formula syntax: Use +, -, *, /, ( ) and spec names',
    'Example formula: Weight = (Width * Height * Thickness * Density) / 1000',
    'Example blend: BlendMFI = OT_LDPE_MFI * LDPERatio + OT_PP_MFI * PPRatio',
    'Only NUMBER type specifications can be used in formulas',
    'Create base materials first (LDPE, PP), then create blends that reference them',
    'Specifications define WHAT to track, Options are ACTUAL variants',
    'Can bulk import up to 100 option types via Excel',
    'Mark calculated specs as "not visible" if only for internal use'
  ]
};

// Order Help Content
export const createOrderHelp: HelpDocContent = {
  title: 'Create Order',
  subtitle: 'Create manufacturing or billing orders',
  purpose: 'Orders capture what a customer wants to buy. Select products, materials, specify quantities and dimensions, configure printing options, and track through production steps.',
  steps: [
    {
      title: 'Select Order Type',
      description: 'Choose the order type from dropdown. This determines which form sections appear.',
      tip: 'Different order types have different fields enabled'
    },
    {
      title: 'Select Customer',
      description: 'Search and select the customer placing this order.',
    },
    {
      title: 'Fill Product Information',
      description: 'Select Product Type, Product Name, enter Quantity, and fill Product Dimensions.',
    },
    {
      title: 'Fill Material Information',
      description: 'Select Material Type, Material Specification, choose Mixing option, and fill Material Dimensions.',
    },
    {
      title: 'Configure Printing (If needed)',
      description: 'Enable printing, enter dimensions, select print type (Flexo/Gravure/Digital), add colors and notes.',
    },
    {
      title: 'Set Status & Priority',
      description: 'Select order Status (Pending, Approved, etc.) and Priority (Normal, High, Urgent).',
    },
    {
      title: 'Save Order',
      description: 'Review all sections and click Save or press Ctrl+Enter.',
    }
  ],
  sections: [
    {
      title: 'Order Status',
      icon: '📊',
      content: [
        'Wait for Approval - Needs approval before processing',
        'Pending - Ready to start',
        'Approved - Approved for production',
        'In Progress - Currently being manufactured',
        'Completed - Production finished',
        'Dispatched - Shipped to customer',
        'Cancelled - Order cancelled',
        'Issue - Has problems'
      ]
    },
    {
      title: 'Priority Levels',
      icon: '🚦',
      content: [
        'Urgent - Immediate attention required',
        'High - Priority processing',
        'Normal - Standard processing',
        'Low - Can wait'
      ]
    },
    {
      title: 'Keyboard Shortcuts',
      icon: '⌨️',
      content: [
        'Tab - Move to next field',
        'Shift+Tab - Move to previous field',
        'Enter - Select dropdown option',
        'Space - Toggle Yes/No',
        'Ctrl+Enter - Save order',
        'Escape - Close modal'
      ]
    }
  ],
  examples: [
    {
      title: 'Basic Plastic Bag Order',
      data: {
        'Order Type': 'Manufacturing',
        'Customer': 'ABC Plastics Ltd',
        'Product': 'LD Bag',
        'Quantity': '10,000 pcs',
        'Dimensions': '30cm x 40cm x 50mic',
        'Material': 'LDPE Grade A',
        'Printing': 'No',
        'Priority': 'Normal'
      }
    },
    {
      title: 'Printed Pouch Order',
      data: {
        'Order Type': 'Manufacturing',
        'Customer': 'Food Packaging Co',
        'Product': 'Stand-up Pouch',
        'Quantity': '5,000 pcs',
        'Material': 'PET/PE Laminate',
        'Printing': 'Gravure, 4 Colors',
        'Priority': 'High'
      }
    }
  ],
  tips: [
    'Select order type first - it controls available fields',
    'Use keyboard shortcuts for faster data entry',
    'Check calculated fields (weight) before saving',
    'Set priority for urgent orders',
    'Add notes for special instructions'
  ]
};

// Machine Type Help Content
export const machineTypeHelp: HelpDocContent = {
  title: 'Create Machine Type',
  subtitle: 'Categorize your manufacturing equipment',
  purpose: 'Machine Types help you organize similar machines into categories. For example, group all printing machines together, all extrusion machines together, etc.',
  steps: [
    {
      title: 'Enter Machine Type Name',
      description: 'Type a unique name for this category of machines.',
      tip: 'Examples: Printing, Extrusion, Lamination, Cutting, Slitting'
    },
    {
      title: 'Add Description',
      description: 'Explain what kind of machines belong to this type and their typical functions.',
      tip: 'Include details like machine capabilities or use cases'
    },
    {
      title: 'Set Status',
      description: 'Choose Active (type is available for use) or Inactive (type is disabled).',
    },
    {
      title: 'Click Save',
      description: 'Review and save. The machine type will be available when creating new machines.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: [
        'Machine Type Name - Unique category name',
        'Description - Explanation of this machine category'
      ]
    },
    {
      title: 'Status Options',
      icon: '⚙️',
      content: [
        'Active - Machine type is available for selection',
        'Inactive - Machine type is hidden from selection'
      ]
    }
  ],
  examples: [
    {
      title: 'Printing Machines',
      data: {
        'Type Name': 'Printing',
        'Description': 'Flexographic and rotogravure printing machines for packaging',
        'Status': 'Active'
      }
    },
    {
      title: 'Extrusion Lines',
      data: {
        'Type Name': 'Extrusion',
        'Description': 'Plastic film extrusion lines for producing base films',
        'Status': 'Active'
      }
    },
    {
      title: 'Cutting Equipment',
      data: {
        'Type Name': 'Cutting',
        'Description': 'Slitting and cutting machines for final sizing',
        'Status': 'Active'
      }
    }
  ],
  tips: [
    'Create machine types before creating machines',
    'Use broad categories that group similar equipment',
    'Keep names short and descriptive',
    'Can bulk import up to 50 machine types via Excel'
  ]
};

// Machine Operator Help Content
export const machineOperatorHelp: HelpDocContent = {
  title: 'Create Machine Operator',
  subtitle: 'Add operators who work on machines',
  purpose: 'Machine Operators are the workers who operate your manufacturing machines. Each operator has a unique PIN for logging work and tracking production.',
  steps: [
    {
      title: 'Enter Username',
      description: 'Type the operator name. This will be displayed on reports and production logs.',
      tip: 'Use real names like "Ramesh Kumar" or badge numbers like "OP-001"'
    },
    {
      title: 'Set 4-Digit PIN',
      description: 'Create a 4-digit numeric PIN that the operator will use to login.',
      tip: 'Choose a PIN the operator can remember but is not too simple (avoid 1234, 0000)'
    },
    {
      title: 'Confirm PIN',
      description: 'Re-enter the same PIN to confirm. Both must match exactly.',
    },
    {
      title: 'Select Machine',
      description: 'Choose which machine this operator is assigned to from the dropdown.',
      tip: 'Operators can be reassigned to different machines later'
    },
    {
      title: 'Click Save',
      description: 'Review and save. The operator can now login to their assigned machine.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: [
        'Username - Operator identification name',
        'PIN - 4-digit numeric code for login',
        'Confirm PIN - Must match PIN exactly',
        'Machine - Assigned machine for this operator'
      ]
    },
    {
      title: 'PIN Rules',
      icon: '🔐',
      content: [
        'Must be exactly 4 digits',
        'Only numbers (0-9) allowed',
        'PIN and Confirm PIN must match',
        'In edit mode, leave blank to keep current PIN'
      ]
    }
  ],
  examples: [
    {
      title: 'Production Operator',
      data: {
        'Username': 'Ramesh Kumar',
        'PIN': '4521',
        'Machine': 'Flexo Printer 01'
      }
    },
    {
      title: 'Shift Supervisor',
      data: {
        'Username': 'Suresh - Day Shift',
        'PIN': '7890',
        'Machine': 'Extruder Line A'
      }
    }
  ],
  tips: [
    'Each operator needs a unique PIN',
    'Operators can change their PIN later',
    'Create machines before adding operators',
    'Can bulk import up to 50 operators via Excel',
    'Keep a record of assigned PINs securely'
  ]
};

// Production Step Help Content
export const stepHelp: HelpDocContent = {
  title: 'Create Production Step',
  subtitle: 'Define manufacturing workflow stages',
  purpose: 'Production Steps define the stages in your manufacturing process. Each step includes machines that are used at that stage. Orders move through these steps during production.',
  steps: [
    {
      title: 'Enter Step Name',
      description: 'Type a descriptive name for this production stage.',
      tip: 'Examples: Raw Material, Extrusion, Printing, Lamination, Slitting, Packing'
    },
    {
      title: 'Select Machines',
      description: 'Choose one or more machines that can perform this step.',
      tip: 'Add multiple machines if any of them can handle this step'
    },
    {
      title: 'Add More Machines (Optional)',
      description: 'Click "+ Add Machine" to include additional machines for this step.',
    },
    {
      title: 'Click Save',
      description: 'Review and save. The step will be available in order types and production tracking.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: [
        'Step Name - Unique name for the production stage',
        'Machines - At least one machine must be selected'
      ]
    },
    {
      title: 'Machine Assignment',
      icon: '⚙️',
      content: [
        'Multiple machines can be assigned to one step',
        'Machines are sequenced in the order added',
        'Use "×" button to remove a machine',
        'Click "+ Add Machine" to add more'
      ]
    }
  ],
  examples: [
    {
      title: 'Printing Step',
      data: {
        'Step Name': 'Printing',
        'Machines': 'Flexo Printer 01, Flexo Printer 02, Gravure Printer 01'
      }
    },
    {
      title: 'Extrusion Step',
      data: {
        'Step Name': 'Film Extrusion',
        'Machines': 'Extruder Line A, Extruder Line B'
      }
    },
    {
      title: 'Final Packing Step',
      data: {
        'Step Name': 'Packing',
        'Machines': 'Packing Station 1, Packing Station 2'
      }
    }
  ],
  tips: [
    'Create machines before creating steps',
    'Order steps logically in your workflow',
    'Assign multiple machines for parallel processing',
    'Steps can be linked to order types for automatic workflow',
    'Can bulk import up to 50 steps via Excel'
  ]
};

// Device Access Help Content
export const deviceAccessHelp: HelpDocContent = {
  title: 'Create Device Access',
  subtitle: 'Register devices for machine operation',
  purpose: 'Device Access allows you to register tablets or control panels that operators use on the factory floor. Operators login to devices to view orders, record production, and track their work. Access the Device Portal at: https://device.27infinity.in/',
  steps: [
    {
      title: 'Enter Device Name',
      description: 'Type a name to identify the device. Use descriptive names that indicate the device type and number.',
      tip: 'Examples: Tablet-01, Control Panel-A, Floor Monitor 1'
    },
    {
      title: 'Enter Device Location',
      description: 'Specify where the device is physically located in your facility.',
      tip: 'Examples: Factory Floor A, Production Line 2, Assembly Area'
    },
    {
      title: 'Set Password',
      description: 'Create a password for device login. Must be at least 6 characters.',
      tip: 'Use a secure password but one that operators can remember'
    },
    {
      title: 'Confirm Password',
      description: 'Re-enter the same password to confirm. Both must match exactly.',
    },
    {
      title: 'Save and Note Device ID',
      description: 'After saving, a Device ID will be shown. Copy and save this ID - operators need it to login at https://device.27infinity.in/',
      tip: 'The Device ID is only shown once after creation!'
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: [
        'Device Name - Unique identifier for the device',
        'Device Location - Physical location in facility',
        'Password - At least 6 characters',
        'Confirm Password - Must match password'
      ]
    },
    {
      title: 'Device Portal Access',
      icon: '🌐',
      content: [
        'Portal URL: https://device.27infinity.in/',
        'Login with Device ID + Password',
        'Operator enters their 4-digit PIN',
        'View assigned orders and production tasks',
        'Record production output and progress'
      ]
    },
    {
      title: 'Operator Workflow',
      icon: '👷',
      content: [
        '1. Open https://device.27infinity.in/ on device',
        '2. Enter Device ID and Password',
        '3. Operator enters their 4-digit PIN',
        '4. View orders assigned to the machine',
        '5. Record production quantities and status',
        '6. Track order progress in real-time'
      ]
    }
  ],
  examples: [
    {
      title: 'Production Floor Tablet',
      data: {
        'Device Name': 'Tablet-01',
        'Location': 'Factory Floor A',
        'Password': 'factory123',
        'Portal': 'https://device.27infinity.in/'
      }
    },
    {
      title: 'Machine Control Panel',
      data: {
        'Device Name': 'Control Panel-CNC-01',
        'Location': 'CNC Machine Area',
        'Password': 'cnc@panel',
        'Portal': 'https://device.27infinity.in/'
      }
    }
  ],
  tips: [
    'Device Portal: https://device.27infinity.in/',
    'Save the Device ID immediately after creation',
    'Operators need Device ID + Password + their PIN',
    'Assign machines to devices for order visibility',
    'Operators can view and update order production',
    'Can bulk import up to 50 devices via Excel'
  ]
};

// Device Machine Assignment Help Content
export const deviceMachineAssignHelp: HelpDocContent = {
  title: 'Assign Machine to Device',
  subtitle: 'Link devices to manufacturing machines',
  purpose: 'Connect registered devices to specific machines. When operators login to a device, they can only record production for the assigned machine.',
  steps: [
    {
      title: 'Select Device',
      description: 'Choose the device you want to assign a machine to from the dropdown.',
      tip: 'Devices show name and location for easy identification'
    },
    {
      title: 'Select Machine',
      description: 'Choose which machine this device should be linked to.',
      tip: 'Machine type is shown in parentheses'
    },
    {
      title: 'Click Assign',
      description: 'Click "Assign Machine" to complete the link. The device will now be connected to that machine.',
    }
  ],
  sections: [
    {
      title: 'How It Works',
      icon: '🔗',
      content: [
        'One device links to one machine',
        'Operators login to device to access machine',
        'Production data is automatically tracked',
        'Change assignment anytime by reassigning'
      ]
    }
  ],
  examples: [
    {
      title: 'Tablet to Printer',
      data: {
        'Device': 'Tablet-01 - Factory Floor A',
        'Machine': 'Flexo Printer 01 (Printing)'
      }
    },
    {
      title: 'Panel to Extruder',
      data: {
        'Device': 'Control Panel-02 - Line B',
        'Machine': 'Extruder Line B (Extrusion)'
      }
    }
  ],
  tips: [
    'Create devices and machines first',
    'One device = one machine at a time',
    'Reassign device to change linked machine',
    'Use for production tracking per machine'
  ]
};

// Order Type Help Content
export const createOrderTypeHelp: HelpDocContent = {
  title: 'Create Order Type',
  subtitle: 'Configure order form templates for manufacturing and billing',
  purpose: 'Order Types are powerful templates that define how order forms behave in your system. Control which form sections appear, configure automatic numbering sequences, set default production workflows, and add calculation formulas. Perfect for plastic manufacturing (LDPE bags, PP pouches), steel fabrication, food packaging, and any custom manufacturing workflow.',
  steps: [
    {
      title: 'Enter Basic Information',
      description: 'Type Name (descriptive title), Code (short identifier), and Description (detailed explanation).',
      tip: 'Examples: "LDPE Bag Production" (Code: LBP), "Steel Sheet Orders" (Code: SSO), "Food Pouch Manufacturing" (Code: FPM), "Sales Invoice" (Code: INV)'
    },
    {
      title: 'Select Order Type Category',
      description: 'Choose Manufacturing (for production orders) or Billing (for invoices, quotations, challans, and financial documents).',
      tip: 'Manufacturing: Full form with product, material, printing, steps. Billing: Simplified form focused on items and amounts'
    },
    {
      title: 'Configure Numbering Format',
      description: 'Set Prefix (letters/numbers), Format template using {PREFIX}, {SEQUENCE}, {YEAR} variables, and Padding (leading zeros).',
      tip: 'Format: LBP-{SEQUENCE} → LBP-0001, LBP-0002. Or: INV-{YEAR}-{SEQUENCE} → INV-2024-00001. Padding 4 = 0001, Padding 6 = 000001'
    },
    {
      title: 'Enable Form Sections',
      description: 'Check which sections to show in order forms: Product Information, Material Information, Printing Options, Manufacturing Steps.',
      tip: 'Manufacturing orders: Enable all sections. Billing orders: Enable Product only. Custom orders: Enable based on needs'
    },
    {
      title: 'Configure Product Information Section',
      description: 'When enabled, users can select Product Type (Option Type), Product Name (specific Option), enter Quantity, and fill Product Dimensions.',
      tip: 'Essential for all order types. Links to Option Types like "LDPE Bag", "Steel Sheet", "Food Pouch"'
    },
    {
      title: 'Configure Material Information Section',
      description: 'When enabled, users can select Material Type, Material Specification, Material Mixing options, and Material Dimensions.',
      tip: 'Use for orders requiring raw material tracking: LDPE granules for bags, steel coils for cutting, PET/PE for lamination'
    },
    {
      title: 'Configure Printing Options Section',
      description: 'When enabled, users can enable printing, enter print dimensions, select print type (Flexo/Gravure/Digital), add colors, and notes.',
      tip: 'Enable for printed products: branded bags, custom pouches, labeled packaging. Disable for plain products'
    },
    {
      title: 'Configure Manufacturing Steps Section',
      description: 'When enabled, orders include production workflow steps like Extrusion → Printing → Slitting → Packing.',
      tip: 'Disable for billing-only orders. Enable for production tracking with machines and operators'
    },
    {
      title: 'Set Default Production Steps',
      description: 'Select production steps that will be automatically assigned to all orders of this type. Steps define the manufacturing workflow.',
      tip: 'Plastic bags: Film Extrusion → Printing → Cutting → Packing. Steel: Cutting → Bending → Welding → Finishing'
    },
    {
      title: 'Add Calculation Fields (Advanced)',
      description: 'Define custom fields with formulas to auto-calculate values like weight, area, material required, cost, etc.',
      tip: 'Example: Weight = Length * Width * Thickness * Density / 1000. Total_Cost = Material_Cost + Printing_Cost + Labor_Cost'
    },
    {
      title: 'Set Status & Visibility',
      description: 'Mark as Active (available for use), Global (available to all users), Default (auto-selected in forms).',
      tip: 'Set your primary order type as Default. Mark seasonal/special order types as inactive when not in use'
    },
    {
      title: 'Review and Save',
      description: 'Review all configuration settings, test the numbering format preview, and click Save.',
      tip: 'After saving, create a test order to verify all sections appear correctly and formulas work'
    }
  ],
  sections: [
    {
      title: 'Order Type Categories',
      icon: '📑',
      content: [
        'MANUFACTURING - Full production orders with all sections:',
        '  • Product selection with specifications',
        '  • Material requirements and mixing options',
        '  • Printing configuration (colors, type, dimensions)',
        '  • Production steps workflow with machines and operators',
        '  • Real-time production tracking',
        'BILLING - Financial documents with simplified forms:',
        '  • Invoice, Quotation, Proforma Invoice, Delivery Challan',
        '  • Product/item listing with rates and quantities',
        '  • Tax calculations (GST, CGST, SGST)',
        '  • Payment terms and totals',
        '  • No production tracking, focused on billing'
      ]
    },
    {
      title: 'Numbering Format System',
      icon: '🔢',
      content: [
        'Build custom order numbering using these variables:',
        '{PREFIX} - Your custom prefix (letters/numbers)',
        '  Example: LBP, PO, INV, QT, SSO',
        '{SEQUENCE} - Auto-incrementing number (1, 2, 3...)',
        '  Resets independently per order type',
        '{YEAR} - Current 4-digit year (2024, 2025...)',
        '{MONTH} - Current 2-digit month (01-12)',
        '{DATE} - Current date (YYYYMMDD format)',
        'Padding - Number of digits with leading zeros',
        '  Padding 4: 0001, 0002, 0003...',
        '  Padding 6: 000001, 000002, 000003...',
        'Examples:',
        '  LBP-{SEQUENCE} with Padding 4 → LBP-0001, LBP-0002',
        '  INV-{YEAR}-{SEQUENCE} with Padding 5 → INV-2024-00001',
        '  PO-{YEAR}{MONTH}-{SEQUENCE} → PO-202401-001'
      ]
    },
    {
      title: 'Form Sections - Product Information',
      icon: '📦',
      content: [
        'Product section allows selection of what customer is ordering:',
        '1. Product Type - Select Option Type (LDPE Bag, Steel Sheet, Food Pouch)',
        '2. Product Name - Select specific Option (LDPE 30x40cm 50mic, SS304 2mm)',
        '3. Quantity - How many units to produce (10000 pcs, 500 kg)',
        '4. Product Dimensions - Auto-populated from Option specs or manual entry',
        '5. Product Notes - Additional product specifications',
        'Required for: ALL order types',
        'Links to: Option Types and Options you created'
      ]
    },
    {
      title: 'Form Sections - Material Information',
      icon: '🔬',
      content: [
        'Material section tracks raw materials used in production:',
        '1. Material Type - Raw material Option Type (LDPE Granules, PP, Steel Coil)',
        '2. Material Specification - Specific material Option (LDPE MFI-2, PP MFI-12)',
        '3. Material Mixing - Virgin/Recycled blend ratios',
        '4. Material Dimensions - Technical specs (MFI, Density, Thickness)',
        '5. Material Quantity - Amount needed for production',
        'Use Cases:',
        '  • Plastic: Track LDPE/PP/LLDPE granules with MFI, Density',
        '  • Steel: Track coil dimensions and grades',
        '  • Food Packaging: Track film materials and barrier properties',
        'Required for: Manufacturing orders with material tracking'
      ]
    },
    {
      title: 'Form Sections - Printing Options',
      icon: '🎨',
      content: [
        'Printing section configures print specifications:',
        '1. Enable Printing - Yes/No toggle',
        '2. Print Dimensions - Width, Height, Repeat length',
        '3. Print Type - Flexographic, Rotogravure, Digital, Offset',
        '4. Number of Colors - 1-8 colors',
        '5. Color Details - Specific color codes (Pantone, CMYK)',
        '6. Print Position - Front, Back, Both sides',
        '7. Print Notes - Design instructions, logo placement',
        'Use Cases:',
        '  • Branded plastic bags with company logos',
        '  • Food pouches with product labels and nutrition info',
        '  • Custom packaging with multi-color designs',
        'Required for: Orders requiring printing/branding'
      ]
    },
    {
      title: 'Form Sections - Manufacturing Steps',
      icon: '⚙️',
      content: [
        'Steps section defines production workflow stages:',
        '1. Default steps auto-assigned from order type configuration',
        '2. Each step links to specific machines',
        '3. Operators login to machines and track progress',
        '4. Real-time status updates per step',
        '5. Step sequence: Raw Material → Process 1 → Process 2 → Packing',
        'Plastic Manufacturing Example:',
        '  Step 1: Film Extrusion (Extruder A, B)',
        '  Step 2: Printing (Flexo Printer 1, 2)',
        '  Step 3: Slitting (Slitter 1)',
        '  Step 4: Bag Cutting (Cutting Machine 1, 2)',
        '  Step 5: Packing (Packing Station)',
        'Steel Fabrication Example:',
        '  Step 1: Cutting (CNC Cutting)',
        '  Step 2: Bending (Press Brake)',
        '  Step 3: Welding (Welding Station)',
        '  Step 4: Finishing (Polishing, Coating)',
        'Required for: Manufacturing orders with production tracking'
      ]
    },
    {
      title: 'Industry Use Cases',
      icon: '🏭',
      content: [
        'PLASTIC INDUSTRY ORDER TYPES:',
        '  • LDPE Bag Manufacturing: Product + Material + Printing + Steps',
        '  • PP Pouch Production: Product + Material + Printing + Steps',
        '  • Plain Film Extrusion: Product + Material + Steps (no printing)',
        'STEEL INDUSTRY ORDER TYPES:',
        '  • Steel Sheet Cutting: Product + Material + Steps',
        '  • Custom Fabrication: Product + Material + Steps (cutting, bending, welding)',
        '  • Steel Sales Invoice: Product only (billing)',
        'FOOD PACKAGING ORDER TYPES:',
        '  • Food Pouch Manufacturing: Product + Material + Printing + Steps',
        '  • Lamination Orders: Material + Steps (multi-layer lamination)',
        'BILLING ORDER TYPES:',
        '  • Sales Invoice: Product only + GST calculation',
        '  • Quotation: Product only + pricing',
        '  • Delivery Challan: Product only + delivery details'
      ]
    },
    {
      title: 'Calculation Fields & Formulas',
      icon: '🧮',
      content: [
        'Add custom calculated fields to order forms:',
        '1. Create field name (e.g., Total_Weight, Material_Required, Cost)',
        '2. Write formula using field names and operators',
        '3. Formula auto-calculates when users enter values',
        'Available Operators: +, -, *, /, ( )',
        'Available Functions: SUM, AVG, MAX, MIN',
        'Example Formulas:',
        '  • Weight = Length * Width * Thickness * Density / 1000',
        '  • Area = Length * Width / 10000',
        '  • Material_Needed = Weight * 1.05 (5% waste)',
        '  • Total_Cost = Material_Cost + Printing_Cost + Labor_Cost',
        '  • Pieces_Per_Roll = Roll_Length / Piece_Length',
        'Use Cases:',
        '  • Auto-calculate weight from dimensions',
        '  • Estimate material requirements with waste factor',
        '  • Calculate production cost breakdowns',
        '  • Compute pieces per roll for inventory'
      ]
    },
    {
      title: 'Order Type Workflow',
      icon: '🔄',
      content: [
        'How Order Types work in the system:',
        'Step 1: Create Order Type (this form)',
        '  → Define sections, numbering, steps, formulas',
        'Step 2: Users create orders',
        '  → Select order type from dropdown',
        '  → Form shows only enabled sections',
        '  → Order gets automatic number (LBP-0001)',
        'Step 3: Order processing',
        '  → Default steps auto-assigned',
        '  → Production tracking begins',
        '  → Operators update progress per step',
        'Step 4: Order completion',
        '  → All steps marked complete',
        '  → Generate invoice using Print Type',
        '  → Order marked as dispatched',
        'Multiple order types allow different workflows for different products'
      ]
    },
    {
      title: '📂 Order Category Configuration',
      icon: '📂',
      content: [
        'Order Category determines the type and purpose of orders:',
        '',
        '🏭 MANUFACTURING Category:',
        '  • Full production workflow with all sections available',
        '  • Product Info + Material Info + Printing + Manufacturing Steps',
        '  • Real-time production tracking with machines and operators',
        '  • Inventory debit mode (consumes raw materials)',
        '  • Use for: Bag production, steel cutting, pouch manufacturing',
        '',
        '💰 BILLING Category:',
        '  • Simplified forms focused on invoicing',
        '  • Billing Type options: Invoice, Quotation, Proforma, Delivery Challan, Purchase Order',
        '  • Product listing with rates, quantities, and GST calculations',
        '  • No production tracking or manufacturing steps',
        '  • Inventory credit mode (adds finished goods)',
        '  • Use for: Sales invoices, quotations, billing documents',
        '',
        '🔗 BILLING with Manufacturing Link:',
        '  • Billing order type that can link to manufacturing orders',
        '  • Enable "Allow Manufacturing Link" checkbox',
        '  • Useful for invoicing after production completes',
        '  • Example: Create manufacturing order → Mark complete → Generate linked invoice',
        '',
        '📋 How It Works in Create Order:',
        '  • Select order type from dropdown',
        '  • Manufacturing: See Product, Material, Printing, Steps sections',
        '  • Billing: See only Product section with billing fields',
        '  • Form automatically shows/hides sections based on category'
      ]
    },
    {
      title: '📊 Inventory Mode Configuration',
      icon: '📊',
      content: [
        'Inventory Mode controls how orders affect stock levels:',
        '',
        '🚫 NONE (No Inventory Tracking):',
        '  • Orders do not affect inventory',
        '  • Use for: Service orders, external manufacturing, quotations',
        '  • No stock calculations or updates',
        '',
        '📉 DEBIT Mode (Consume Inventory):',
        '  • Order consumes raw materials from inventory',
        '  • Reduces stock when order is created/approved',
        '  • Use for: Manufacturing orders that use raw materials',
        '  • Example: LDPE Bag order debits LDPE granules from inventory',
        '  • Tracks material consumption per order',
        '',
        '📈 CREDIT Mode (Add to Inventory):',
        '  • Order adds finished goods to inventory',
        '  • Increases stock when order is completed',
        '  • Use for: Finished goods, sales orders, billing orders',
        '  • Example: Invoice credits finished bags to inventory',
        '  • Tracks production output and sales',
        '',
        '🔄 Common Workflows:',
        '  • Manufacturing Order (Debit): Consumes LDPE, PP granules',
        '  • Sales Invoice (Credit): Adds finished bags to stock',
        '  • Production + Sales: Manufacturing (Debit) → Invoice (Credit)',
        '',
        '📦 Inventory Units:',
        '  • Select multiple units to track (kg, pcs, boxes, rolls)',
        '  • Set primary unit for main tracking',
        '  • Automatic conversion between units',
        '  • Example: Track in kg (primary), pcs (secondary)'
      ]
    },
    {
      title: '🎯 Allowed Option Types',
      icon: '🎯',
      content: [
        'Allowed Option Types control which products/materials can be used in orders:',
        '',
        '✅ Purpose:',
        '  • Restrict order form to specific product/material types',
        '  • Ensures orders only use relevant Option Types',
        '  • Prevents selection of incompatible products',
        '',
        '📋 How to Configure:',
        '  1. Click "Allowed Option Types" section',
        '  2. Select Option Types from dropdown (LDPE Bag, PP Pouch, Steel Sheet)',
        '  3. Selected types become available in order forms',
        '  4. Product/Material dropdowns show only allowed types',
        '',
        '🏭 Industry Examples:',
        '  • LDPE Bag Manufacturing Order Type:',
        '    → Allow: LDPE Bag (Product), LDPE Granules (Material)',
        '    → Users can only select these types in orders',
        '  • Steel Sheet Cutting Order Type:',
        '    → Allow: Steel Sheet (Product), Steel Coil (Material)',
        '  • Food Pouch Order Type:',
        '    → Allow: Food Pouch (Product), PET Film, PE Film (Materials)',
        '',
        '🔍 How It Works in Create Order:',
        '  1. User selects Order Type: "LDPE Bag Manufacturing"',
        '  2. Product Type dropdown shows only: "LDPE Bag"',
        '  3. Material Type dropdown shows only: "LDPE Granules"',
        '  4. Cannot select unrelated products like "Steel Sheet"',
        '',
        '💡 Best Practices:',
        '  • Leave empty to allow all Option Types (not recommended)',
        '  • Be specific: Select only relevant product/material types',
        '  • Manufacturing orders: Allow both product and material types',
        '  • Billing orders: Allow only finished product types'
      ]
    },
    {
      title: '🖨️ Linked Print Types',
      icon: '🖨️',
      content: [
        'Linked Print Types are invoice/document templates for this order type:',
        '',
        '📄 Purpose:',
        '  • Link custom print templates (invoices, challans, reports)',
        '  • Auto-generate documents from order data',
        '  • Professional branded documents with company logo',
        '',
        '🔧 How to Configure:',
        '  1. Create Print Type first (Create → Print Type)',
        '  2. Design invoice template with HTML/CSS',
        '  3. In Order Type, select linked Print Types',
        '  4. Users can print orders using these templates',
        '',
        '📋 Common Print Types:',
        '  • Tax Invoice - GST invoice with 18% tax breakdown',
        '  • Proforma Invoice - Pre-invoice for advance payment',
        '  • Delivery Challan - Goods dispatch document',
        '  • Production Report - Manufacturing details and quantities',
        '  • Quotation - Price estimation document',
        '',
        '🏭 Industry Examples:',
        '  • Manufacturing Order Type:',
        '    → Link: Production Report, Delivery Challan',
        '  • Sales Invoice Order Type:',
        '    → Link: Tax Invoice, Proforma Invoice',
        '  • Quotation Order Type:',
        '    → Link: Quotation Template',
        '',
        '🔍 How It Works in Orders:',
        '  1. Create order with Order Type "Sales Invoice"',
        '  2. Click Print button in order view',
        '  3. See dropdown: "Tax Invoice", "Proforma Invoice"',
        '  4. Select template → Generate PDF with order data',
        '  5. Document includes: Company details, order items, totals, GST',
        '',
        '💡 Template Variables:',
        '  • {{orderNumber}} → Order ID',
        '  • {{customerName}} → Customer company name',
        '  • {{orderDate}} → Creation date',
        '  • {{items}} → Product/material list with quantities',
        '  • {{totalAmount}} → Grand total with taxes'
      ]
    },
    {
      title: '📊 Linked Excel Export Types',
      icon: '📊',
      content: [
        'Linked Excel Export Types define custom Excel export formats:',
        '',
        '📤 Purpose:',
        '  • Export order data to Excel with custom formatting',
        '  • Create industry-specific Excel reports',
        '  • Share data with external systems (ERP, accounting)',
        '',
        '🔧 How to Configure:',
        '  1. Create Excel Export Type (if available in system)',
        '  2. Define columns, formatting, calculations',
        '  3. Link to Order Type',
        '  4. Users can export orders in this format',
        '',
        '📋 Common Export Types:',
        '  • Production Report - Machine-wise production data',
        '  • Material Consumption - Raw material usage by order',
        '  • Sales Report - Customer-wise sales with GST',
        '  • Inventory Movement - Stock in/out transactions',
        '',
        '🔍 How It Works:',
        '  1. Select multiple orders in order list',
        '  2. Click Export button',
        '  3. Choose export format: "Production Report"',
        '  4. Download Excel with formatted data',
        '  5. Excel includes: Order details, calculations, summaries'
      ]
    },
    {
      title: '🧮 Dynamic Calculations',
      icon: '🧮',
      content: [
        'Dynamic Calculations add auto-calculated fields to order forms:',
        '',
        '⚡ Purpose:',
        '  • Automatically calculate values based on user input',
        '  • Reduce manual errors in weight, area, cost calculations',
        '  • Reference Option Type specifications in formulas',
        '',
        '🔧 How to Configure:',
        '  1. Click "Add Calculation" button',
        '  2. Enter calculation name: "Total_Weight"',
        '  3. Write formula: "Quantity * Product_Weight / 1000"',
        '  4. Set unit: "kg"',
        '  5. Enable "Show in Order" to display in forms',
        '  6. Choose "Auto-populate" for instant calculation',
        '',
        '📐 Formula Syntax:',
        '  • Use specification names from allowed Option Types',
        '  • Operators: +, -, *, /, ( )',
        '  • Functions: SUM, AVG, MAX, MIN',
        '  • Reference format: Product_Weight, Material_MFI, Product_Thickness',
        '',
        '🏭 Industry Examples:',
        '  1. PLASTIC - Total Weight Calculation:',
        '     Name: "Total_Weight"',
        '     Formula: "Product_Width * Product_Height * Product_Thickness * Product_Density / 1000000"',
        '     Unit: "kg"',
        '     Result: Auto-calculates bag weight from dimensions',
        '',
        '  2. PLASTIC - Material Required:',
        '     Name: "Material_Required"',
        '     Formula: "Total_Weight * Quantity * 1.05"',
        '     Unit: "kg"',
        '     Result: Material needed with 5% waste factor',
        '',
        '  3. STEEL - Sheet Weight:',
        '     Name: "Sheet_Weight"',
        '     Formula: "Product_Thickness * Product_Width * Product_Length * 7.85 / 1000000"',
        '     Unit: "kg"',
        '     Result: Steel sheet weight (density 7.85 g/cm³)',
        '',
        '  4. COST - Production Cost:',
        '     Name: "Production_Cost"',
        '     Formula: "Material_Required * Material_Price + Printing_Cost + Labor_Cost"',
        '     Unit: "₹"',
        '     Result: Total production cost breakdown',
        '',
        '  5. FOOD PACKAGING - Pouch Area:',
        '     Name: "Pouch_Area"',
        '     Formula: "(Product_Width * Product_Height * 2) + (Product_Gusset * Product_Height * 2)"',
        '     Unit: "cm²"',
        '     Result: Total pouch surface area',
        '',
        '🔍 How It Works in Create Order:',
        '  1. User creates order, selects Product: "LDPE Bag 30x40cm"',
        '  2. Product specs auto-populate: Width=30, Height=40, Thickness=50, Density=0.92',
        '  3. User enters Quantity: 10000',
        '  4. Dynamic calculations instantly show:',
        '     → Total_Weight: 276 kg (auto-calculated)',
        '     → Material_Required: 289.8 kg (with 5% waste)',
        '  5. No manual calculation needed, reduces errors',
        '',
        '💡 Advanced Features:',
        '  • Show in Order: Display in order view (Yes/No)',
        '  • Auto-populate: Calculate on form load vs manual trigger',
        '  • Column Format: Standard, Highlight, Summary, Hidden',
        '  • Conditional Rules: Calculate only when conditions met',
        '  • Order: Rearrange calculation sequence with up/down buttons'
      ]
    },
    {
      title: '📋 Form Sections Configuration',
      icon: '📋',
      content: [
        'Form Sections control custom fields beyond default sections:',
        '',
        '🎯 Purpose:',
        '  • Add custom sections to order forms',
        '  • Define industry-specific fields',
        '  • Capture additional data not in default sections',
        '',
        '🔧 Default Sections (Always Available):',
        '  • Product Information - Product type, name, quantity, specs',
        '  • Material Information - Material type, specs, mixing ratios',
        '  • Printing Options - Print type, colors, dimensions',
        '  • Manufacturing Steps - Production workflow stages',
        '',
        '➕ Custom Sections (You Define):',
        '  1. Steps Section - Default production workflow steps',
        '  2. Options Section - Additional option selections',
        '  3. Dynamic Columns - Custom calculated fields',
        '',
        '🏭 Industry Examples:',
        '  1. PLASTIC INDUSTRY - Quality Control Section:',
        '     Fields: MFI Test Result, Density Test, Visual Inspection',
        '     Use: Track quality parameters per batch',
        '',
        '  2. STEEL INDUSTRY - Certifications Section:',
        '     Fields: Mill Certificate, Grade Certificate, Test Reports',
        '     Use: Track material certifications and compliance',
        '',
        '  3. FOOD PACKAGING - Compliance Section:',
        '     Fields: Food Grade Certificate, FDA Approval, Expiry Date',
        '     Use: Track food safety certifications',
        '',
        '🔍 How It Works:',
        '  • Enable/disable sections per order type',
        '  • Reorder sections with up/down buttons',
        '  • Set fields as Required, Visible, or Hidden',
        '  • Configure how fields display in order view',
        '',
        '💡 Configuration Options:',
        '  • Show in Order: Display section in order view (Yes/No)',
        '  • Column Format: Standard, Highlight, Summary, Hidden',
        '  • Field Order: Drag to rearrange field sequence',
        '  • Field Types: Text, Number, Select, Suggestions'
      ]
    },
    {
      title: 'Best Practices',
      icon: '💡',
      content: [
        'NAMING: Use descriptive names that indicate product/purpose',
        '  Good: "LDPE Bag Manufacturing", "Steel Cutting Orders"',
        '  Bad: "Type 1", "Orders", "Main"',
        'CODES: Keep short (3-5 chars), uppercase, meaningful',
        '  Good: LBP, SSO, FPM, INV, QT',
        '  Bad: LDPEMANUFACTURING, T1, ORDER',
        'NUMBERING: Include year for annual resets',
        '  LBP-{YEAR}-{SEQUENCE} → LBP-2024-0001 (resets each year)',
        '  INV-{SEQUENCE} → INV-0001 (continuous numbering)',
        'SECTIONS: Enable only what you need',
        '  Full manufacturing: All 4 sections',
        '  Simple production: Product + Steps only',
        '  Billing: Product only',
        'ALLOWED OPTION TYPES: Be specific',
        '  Manufacturing: Allow product + material types',
        '  Billing: Allow only finished product types',
        'INVENTORY MODE:',
        '  Manufacturing orders: Use Debit (consume materials)',
        '  Sales/Billing orders: Use Credit (add finished goods)',
        '  Quotations: Use None (no inventory impact)',
        'DYNAMIC CALCULATIONS:',
        '  Add weight, area, cost calculations for automation',
        '  Test formulas with sample data before going live',
        '  Use meaningful names: Total_Weight not TW',
        'PRINT TYPES:',
        '  Link relevant templates: Manufacturing → Production Report',
        '  Billing → Tax Invoice, Proforma Invoice',
        'STEPS: Set logical workflow sequences',
        '  Material arrives → Processing → Quality Check → Packing',
        '  Bad: Random order, skipping critical steps',
        'TESTING: Always test with sample orders before going live'
      ]
    }
  ],
  examples: [
    {
      title: 'LDPE Bag Manufacturing Order Type',
      data: {
        'Name': 'LDPE Bag Manufacturing',
        'Code': 'LBP',
        'Category': 'Manufacturing',
        'Description': 'Production orders for LDPE plastic carry bags',
        'Numbering Format': 'LBP-{YEAR}-{SEQUENCE}',
        'Padding': '4 (LBP-2024-0001)',
        'Enabled Sections': 'Product Info ✓, Material Info ✓, Printing ✓, Steps ✓',
        'Default Steps': 'Film Extrusion, Printing, Bag Cutting, Packing',
        'Use Case': 'Full production workflow with material tracking and printing'
      }
    },
    {
      title: 'Steel Sheet Cutting Order Type',
      data: {
        'Name': 'Steel Sheet Cutting Orders',
        'Code': 'SSO',
        'Category': 'Manufacturing',
        'Description': 'Custom steel sheet cutting and fabrication',
        'Numbering Format': 'SSO-{SEQUENCE}',
        'Padding': '5 (SSO-00001)',
        'Enabled Sections': 'Product Info ✓, Material Info ✓, Steps ✓',
        'Default Steps': 'Material Receiving, CNC Cutting, Edge Finishing, Quality Check, Dispatch',
        'Use Case': 'Steel fabrication with no printing required'
      }
    },
    {
      title: 'Food Pouch Manufacturing Order Type',
      data: {
        'Name': 'Food Pouch Manufacturing',
        'Code': 'FPM',
        'Category': 'Manufacturing',
        'Description': 'Multi-layer laminated food packaging pouches',
        'Numbering Format': 'FPM-{YEAR}{MONTH}-{SEQUENCE}',
        'Padding': '4 (FPM-202401-0001)',
        'Enabled Sections': 'Product Info ✓, Material Info ✓, Printing ✓, Steps ✓',
        'Default Steps': 'Lamination, Printing, Pouch Making, Quality Test, Packing',
        'Calculation Fields': 'Material_Weight = Width * Height * Layers * 0.5',
        'Use Case': 'Complex food packaging with multi-layer materials and printing'
      }
    },
    {
      title: 'Plain Film Extrusion Order Type',
      data: {
        'Name': 'Plain Film Extrusion',
        'Code': 'PFE',
        'Category': 'Manufacturing',
        'Description': 'Plain plastic film production without printing',
        'Numbering Format': 'PFE-{SEQUENCE}',
        'Padding': '4 (PFE-0001)',
        'Enabled Sections': 'Product Info ✓, Material Info ✓, Steps ✓',
        'Default Steps': 'Raw Material Check, Film Extrusion, Slitting, Roll Packing',
        'Use Case': 'Simple film production without printing or complex processing'
      }
    },
    {
      title: 'Sales Invoice Order Type',
      data: {
        'Name': 'Sales Invoice',
        'Code': 'INV',
        'Category': 'Billing',
        'Description': 'GST invoices for product sales',
        'Numbering Format': 'INV-{YEAR}-{SEQUENCE}',
        'Padding': '6 (INV-2024-000001)',
        'Enabled Sections': 'Product Info ✓ (only)',
        'Default Steps': 'None',
        'Calculation Fields': 'Subtotal = Quantity * Rate, CGST = Subtotal * 0.09, SGST = Subtotal * 0.09, Total = Subtotal + CGST + SGST',
        'Use Case': 'Billing-only orders with GST calculations, no production tracking'
      }
    },
    {
      title: 'Quotation Order Type',
      data: {
        'Name': 'Sales Quotation',
        'Code': 'QT',
        'Category': 'Billing',
        'Description': 'Price quotations for potential customers',
        'Numbering Format': 'QT-{YEAR}-{SEQUENCE}',
        'Padding': '5 (QT-2024-00001)',
        'Enabled Sections': 'Product Info ✓ (only)',
        'Default Steps': 'None',
        'Use Case': 'Pre-sales quotations, converts to invoice after approval'
      }
    },
    {
      title: 'Custom Blend Manufacturing Order Type',
      data: {
        'Name': 'Plastic Blend Manufacturing',
        'Code': 'PBM',
        'Category': 'Manufacturing',
        'Description': 'Custom LDPE-PP blend production',
        'Numbering Format': 'PBM-{SEQUENCE}',
        'Padding': '4 (PBM-0001)',
        'Enabled Sections': 'Product Info ✓, Material Info ✓, Steps ✓',
        'Default Steps': 'Material Mixing, Extrusion, Quality Testing, Granule Packing',
        'Calculation Fields': 'LDPE_Required = Total_Weight * LDPE_Ratio / 100, PP_Required = Total_Weight * PP_Ratio / 100',
        'Use Case': 'Material blending with ratio-based calculations'
      }
    }
  ],
  tips: [
    'Order types are templates - create one per workflow type, not per product',
    'Start with 2-3 basic order types: Manufacturing, Invoice, Quotation',
    'NAMING: Use industry terms customers understand: "Bag Orders", "Steel Jobs", "Invoices"',
    'CODES: Keep short and memorable: LBP, SSO, INV (not LDPE_BAG_PRODUCTION_2024)',
    'NUMBERING: Test format before going live - you cannot change it after orders exist',
    'Include {YEAR} in numbering if you want annual resets: INV-{YEAR}-{SEQUENCE}',
    'Padding: Use 4-6 digits for most businesses (0001-000001)',
    'Enable ALL sections for manufacturing, only Product for billing',
    'Set default steps for consistent workflows - operators know what comes next',
    'PLASTIC INDUSTRY: LBP (bags), FPM (pouches), PFE (plain film)',
    'STEEL INDUSTRY: SSO (cutting), SFO (fabrication), INV (billing)',
    'FOOD PACKAGING: FPM (pouches), LPO (lamination), INV (billing)',
    'Use calculation fields for: Weight, Area, Material needed, Cost estimates',
    'Mark your primary order type as "Default" so it auto-selects',
    'Disable seasonal order types when not in use (set to Inactive)',
    'Create test orders after setup to verify sections and numbering work correctly',
    'You can edit order types later, but numbering sequences continue from current number',
    'Link Print Types (invoice templates) to order types for automatic document generation',
    'Can bulk import up to 50 order types via Excel for rapid setup'
  ]
};

// Create Option Help Content
export const createOptionHelp: HelpDocContent = {
  title: 'Create Option',
  subtitle: 'Add product or material variants',
  purpose: 'Options are specific instances of Option Types. For example, if "LDPE Granules" is your Option Type, then "LDPE MFI-2 Grade A" and "LDPE MFI-4 Natural" are Options. Each option has specific values for all specifications defined in the Option Type. Used in plastic (LDPE, PP, LLDPE), steel, food packaging, and manufacturing industries.',
  steps: [
    {
      title: 'Select Option Type',
      description: 'Choose the option type template from the dropdown. This determines which fields appear.',
      tip: 'Create option types first if they don\'t exist. Example: LDPE Granules, PP Granules, SS304 Sheet'
    },
    {
      title: 'Enter Option Name',
      description: 'Type a descriptive, unique name for this variant.',
      tip: 'Example: "LDPE MFI-2 Grade A", "PP Natural MFI-12", "SS304 2mm Sheet", "Food Pouch 15x20cm"'
    },
    {
      title: 'Fill Dimension Values',
      description: 'Enter values for each specification field shown. These are defined by the option type.',
      tip: 'Required fields are marked in orange. For LDPE: MFI, Density, Price. For Steel: Thickness, Width, Length'
    },
    {
      title: 'Use Formulas (If available)',
      description: 'Some fields auto-calculate using formulas. These show computed values based on other fields you entered.',
      tip: 'Example: Weight auto-calculates from Thickness * Width * Length * Density / 1000'
    },
    {
      title: 'Click Save',
      description: 'Review all dimensions and save. Option will be available in order forms and can be referenced by other options.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: [
        'Option Type - The template/category (LDPE, PP, Steel, etc.)',
        'Option Name - Unique variant name',
        'Dimension Values - Values marked as required in the Option Type'
      ]
    },
    {
      title: 'Dimensions & Formulas',
      icon: '📏',
      content: [
        'Based on option type specifications',
        'Can be Number (measurements) or String (text)',
        'May have units (cm, kg, %, pcs, g/10min, MPa)',
        'Some fields auto-calculate using formulas',
        'Calculated fields are read-only and show computed values',
        'Required fields must be filled before saving'
      ]
    },
    {
      title: 'Industry Use Cases',
      icon: '🏭',
      content: [
        'PLASTIC: Create LDPE/PP/LLDPE options with MFI, Density, Price values',
        'STEEL: Create SS304/SS316 sheet options with exact dimensions',
        'FOOD PACKAGING: Create pouch options with Width, Height, Barrier specs',
        'BLENDS: Create blend options that calculate properties from base materials',
        'Each option represents a specific material grade or product variant you sell'
      ]
    },
    {
      title: 'How Formulas Work',
      icon: '⚡',
      content: [
        'When you enter values, formulas calculate automatically',
        'Example: Enter Thickness=2mm, Width=1000mm, Length=2000mm',
        'Weight field auto-calculates: 2 * 1000 * 2000 * 7.85 / 1000000 = 31.4 kg',
        'Formula fields update in real-time as you type',
        'You cannot edit calculated fields - they are computed from your inputs'
      ]
    }
  ],
  examples: [
    {
      title: 'LDPE Plastic Material Option',
      data: {
        'Option Type': 'LDPE Granules',
        'Option Name': 'LDPE MFI-2 Grade A Natural',
        'MFI': '2 g/10min',
        'Density': '0.92 g/cm³',
        'Grade': 'A',
        'Price': '₹95/kg',
        'Melting Point': '110 °C',
        'Color': 'Natural'
      }
    },
    {
      title: 'PP Plastic Material Option',
      data: {
        'Option Type': 'PP Granules',
        'Option Name': 'PP Natural MFI-12 Injection Grade',
        'MFI': '12 g/10min',
        'Density': '0.905 g/cm³',
        'Grade': 'Injection Molding',
        'Price': '₹88/kg',
        'Flexural Modulus': '1400 MPa'
      }
    },
    {
      title: 'LLDPE Film Material Option',
      data: {
        'Option Type': 'LLDPE Film Grade',
        'Option Name': 'LLDPE Stretch Film Grade MFI-1',
        'MFI': '1 g/10min',
        'Density': '0.918 g/cm³',
        'Dart Impact': '450 g',
        'Tensile Strength': '25 MPa',
        'Price': '₹102/kg'
      }
    },
    {
      title: 'Steel Sheet Option with Formula',
      data: {
        'Option Type': 'Stainless Steel Sheet',
        'Option Name': 'SS304 2mm x 1000mm x 2000mm',
        'Thickness': '2 mm',
        'Width': '1000 mm',
        'Length': '2000 mm',
        'Grade': 'SS304',
        'Weight': '31.4 kg (calculated from formula)'
      }
    },
    {
      title: 'Food Packaging Pouch Option',
      data: {
        'Option Type': 'Food Grade Pouch',
        'Option Name': 'Food Pouch 15x20cm 3-Layer',
        'Width': '15 cm',
        'Height': '20 cm',
        'Gusset': '5 cm',
        'Layers': '3',
        'Barrier': 'High',
        'Weight': '12.5 g (calculated)'
      }
    },
    {
      title: 'Plastic Carry Bag Option',
      data: {
        'Option Type': 'Plastic Carry Bag',
        'Option Name': 'LD Bag 30x40cm 50mic Red',
        'Width': '30 cm',
        'Height': '40 cm',
        'Thickness': '50 microns',
        'GSM': '45 g/m²',
        'Color': 'Red'
      }
    },
    {
      title: 'Material Blend Option',
      data: {
        'Option Type': 'LDPE-PP Blend',
        'Option Name': 'LDPE-PP 70:30 Blend',
        'LDPE_Ratio': '70 %',
        'PP_Ratio': '30 %',
        'Blend_MFI': '4.2 g/10min (calculated from base materials)',
        'Price': '₹91/kg'
      }
    }
  ],
  tips: [
    'Option Type controls which fields appear',
    'Industry examples: LDPE MFI-2, PP MFI-12, LLDPE MFI-1, SS304 sheets',
    'Use descriptive names: Include key specs in the name for easy identification',
    'Calculated fields update automatically as you type values',
    'For plastics: Specify MFI, Density, Grade in the option name',
    'For steel: Include Thickness and dimensions in the option name',
    'Options can reference other options via formulas in the Option Type',
    'Can bulk import up to 100 options via Excel',
    'Options appear in dropdowns when creating orders',
    'Each option represents a specific SKU or material grade you stock'
  ]
};

// Product Category Help Content
export const categoryHelp: HelpDocContent = {
  title: 'Product Category',
  subtitle: 'Organize products into groups',
  purpose: 'Product Categories help you group similar products together. Use them to organize your product catalog, filter products in reports, and set category-specific pricing or handling rules.',
  steps: [
    {
      title: 'Enter Category Name',
      description: 'Type a unique, descriptive name for the product category.',
      tip: 'Examples: Packaging Films, Plastic Bags, Printed Pouches, Raw Materials'
    },
    {
      title: 'Add Description (Optional)',
      description: 'Explain what types of products belong to this category.',
      tip: 'Include product characteristics or use cases'
    },
    {
      title: 'Click Save',
      description: 'Review and save. Category will be available in product and order forms.',
    }
  ],
  sections: [
    {
      title: 'Required Fields',
      icon: '🟠',
      content: ['Category Name - Unique identifier for the group']
    },
    {
      title: 'Optional Fields',
      icon: '📝',
      content: ['Description - Details about the category']
    }
  ],
  examples: [
    {
      title: 'Packaging Category',
      data: {
        'Category Name': 'Packaging Films',
        'Description': 'Plastic films used for packaging applications including LDPE, HDPE, and multilayer films.'
      }
    },
    {
      title: 'Product Category',
      data: {
        'Category Name': 'Plastic Bags',
        'Description': 'All types of plastic bags including carry bags, garbage bags, and specialty bags.'
      }
    },
    {
      title: 'Material Category',
      data: {
        'Category Name': 'Raw Materials',
        'Description': 'Virgin and recycled plastic granules for extrusion and molding.'
      }
    }
  ],
  tips: [
    'Keep category names clear and consistent',
    'Limit to 8-12 categories for easy management',
    'Create categories before adding products',
    'Use for filtering in reports and dashboards',
    'Can bulk import up to 50 categories via Excel'
  ]
};

// Option Specification Help Content
export const optionSpecHelp: HelpDocContent = {
  title: 'Create Option Specification',
  subtitle: 'Define individual dimension fields for options',
  purpose: 'Option Specifications are the individual fields/dimensions you want to track for your products or materials. Each specification defines one measurable attribute like MFI, Density, Weight, Thickness, Purity, etc. Used across plastic (LDPE, PP, LLDPE), steel, food packaging, and manufacturing industries to track technical parameters.',
  steps: [
    {
      title: 'Enter Specification Name',
      description: 'Type the name of what you want to measure or track.',
      tip: 'Plastic: MFI, Density, Price. Steel: Thickness, Width, Length. Food: Barrier, Layers. General: Weight, Pieces, Purity, Grade'
    },
    {
      title: 'Select Data Type',
      description: 'Choose Number (for measurements) or String (for text like color, grade).',
      tip: 'Number: MFI, Density, Thickness, Weight, Price, Purity. String: Grade, Color, Form, Barrier Type'
    },
    {
      title: 'Enter Unit (Optional)',
      description: 'Add the unit of measurement if applicable.',
      tip: 'Plastic: g/10min (MFI), g/cm³ (Density), ₹/kg (Price). Steel: mm, kg. General: g, kg, pcs, cm, %'
    },
    {
      title: 'Set Default Value (Optional)',
      description: 'Enter a value that will be pre-filled when creating new options.',
      tip: 'Example: Default Density=0.92 for LDPE, Default Grade="A"'
    },
    {
      title: 'Configure Visibility & Requirements',
      description: 'Check "Visible" to show to users, "Required" to make mandatory, "Allow Formula" to enable calculations.',
      tip: 'Mark critical specs like MFI, Density, Thickness as Required. Allow Formula for calculated fields like Weight'
    },
    {
      title: 'Click Save',
      description: 'Review and save. Specification will be available when creating Option Types.',
    }
  ],
  sections: [
    {
      title: 'Plastic Industry Specifications',
      icon: '🔬',
      content: [
        'LDPE/PP/LLDPE Materials - Common specifications:',
        '1. MFI (Number, g/10min) - Melt Flow Index for flow properties',
        '2. Density (Number, g/cm³) - Material density (0.90-0.95 typical)',
        '3. Price (Number, ₹/kg) - Cost per kilogram',
        '4. Grade (String) - Material grade (A, B, Film, Injection, etc.)',
        '5. Melting Point (Number, °C) - Melting temperature',
        '6. Tensile Strength (Number, MPa) - Strength measurement',
        'These specs are reusable across all plastic material Option Types'
      ]
    },
    {
      title: 'Steel Industry Specifications',
      icon: '⚙️',
      content: [
        'Stainless Steel Sheets - Common specifications:',
        '1. Thickness (Number, mm) - Sheet thickness',
        '2. Width (Number, mm) - Sheet width',
        '3. Length (Number, mm) - Sheet length',
        '4. Grade (String) - Steel grade (SS304, SS316, etc.)',
        '5. Weight (Number, kg, Formula) - Calculated from dimensions',
        '6. Price (Number, ₹/kg) - Cost per kilogram',
        'Weight can auto-calculate: Thickness * Width * Length * 7.85 / 1000000'
      ]
    },
    {
      title: 'Food Packaging Specifications',
      icon: '📦',
      content: [
        'Food Grade Pouches - Common specifications:',
        '1. Width (Number, cm) - Pouch width',
        '2. Height (Number, cm) - Pouch height',
        '3. Gusset (Number, cm) - Bottom/side gusset',
        '4. Layers (Number) - Number of lamination layers',
        '5. Barrier (String) - Barrier type (High, Medium, Low)',
        '6. Weight (Number, g, Formula) - Calculated pouch weight',
        'Essential for multi-layer laminated packaging products'
      ]
    },
    {
      title: 'Silver/Precious Metals Specifications',
      icon: '💎',
      content: [
        'Silver/Gold Inventory - Common specifications:',
        '1. Weight (Number, g) - Track gram weight',
        '2. Pieces (Number, pcs) - Count of items',
        '3. Purity (Number, %) - 92.5%, 99.9%, etc.',
        '4. Form (String) - Bar, Coin, Jewelry, etc.',
        '5. Grade (String) - A, B, C quality grades',
        'Perfect for jewelry manufacturing and precious metal tracking'
      ]
    },
    {
      title: 'How Specifications Work',
      icon: '🔄',
      content: [
        'Step 1: Create Specifications (this step)',
        '→ Define what you want to track: MFI, Density, Thickness, etc.',
        'Step 2: Create Option Types',
        '→ Add these specifications to LDPE, PP, Steel Option Types',
        'Step 3: Create Options',
        '→ Fill specification values: LDPE MFI-2, PP MFI-12, SS304 2mm',
        'Step 4: Use in Orders',
        '→ Select options in orders, all specs auto-populate',
        'Specifications are reusable - create once, use in multiple Option Types'
      ]
    },
    {
      title: 'Field Configuration',
      icon: '📋',
      content: [
        'Number - Measurements, quantities, percentages (MFI, Density, Price)',
        'String - Text values, codes, categories (Grade, Color, Form)',
        'Unit - Adds measurement unit (g/10min, g/cm³, mm, kg, pcs, %)',
        'Default Value - Pre-fills when creating options',
        'Visible - Show/hide from users (hide internal calculations)',
        'Required - Must be filled when creating options (MFI, Density)',
        'Allow Formula - Enable automatic calculations (Weight from dimensions)'
      ]
    }
  ],
  examples: [
    {
      title: 'MFI - Plastic Flow Property',
      data: {
        'Name': 'MFI',
        'Data Type': 'Number',
        'Unit': 'g/10min',
        'Default Value': '-',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Allow Formula': 'No',
        'Use Case': 'LDPE, PP, LLDPE - Melt Flow Index for processing'
      }
    },
    {
      title: 'Density - Plastic Material Property',
      data: {
        'Name': 'Density',
        'Data Type': 'Number',
        'Unit': 'g/cm³',
        'Default Value': '0.92',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Allow Formula': 'No',
        'Use Case': 'LDPE=0.92, PP=0.905, LLDPE=0.918'
      }
    },
    {
      title: 'Price - Material Cost',
      data: {
        'Name': 'Price',
        'Data Type': 'Number',
        'Unit': '₹/kg',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'Cost per kilogram for all materials'
      }
    },
    {
      title: 'Thickness - Steel/Film Dimension',
      data: {
        'Name': 'Thickness',
        'Data Type': 'Number',
        'Unit': 'mm',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'Steel sheets, plastic films'
      }
    },
    {
      title: 'Width - Dimensional Specification',
      data: {
        'Name': 'Width',
        'Data Type': 'Number',
        'Unit': 'mm',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'Steel sheets, pouches, bags'
      }
    },
    {
      title: 'Length - Dimensional Specification',
      data: {
        'Name': 'Length',
        'Data Type': 'Number',
        'Unit': 'mm',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'Steel sheets, films'
      }
    },
    {
      title: 'Weight - Calculated Field',
      data: {
        'Name': 'Weight',
        'Data Type': 'Number',
        'Unit': 'kg',
        'Required': 'No',
        'Visible': 'Yes',
        'Allow Formula': 'Yes',
        'Formula': 'Thickness * Width * Length * Density / 1000',
        'Use Case': 'Auto-calculate weight from dimensions'
      }
    },
    {
      title: 'Grade - Material Quality',
      data: {
        'Name': 'Grade',
        'Data Type': 'String',
        'Unit': '-',
        'Default Value': 'A',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'A, B, C grades or Film, Injection, etc.'
      }
    },
    {
      title: 'Barrier - Food Packaging Property',
      data: {
        'Name': 'Barrier',
        'Data Type': 'String',
        'Unit': '-',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'High, Medium, Low barrier for food pouches'
      }
    },
    {
      title: 'Layers - Lamination Count',
      data: {
        'Name': 'Layers',
        'Data Type': 'Number',
        'Unit': '-',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'Number of layers in multi-layer pouches (2, 3, 5)'
      }
    },
    {
      title: 'Purity - Precious Metals',
      data: {
        'Name': 'Purity',
        'Data Type': 'Number',
        'Unit': '%',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': '92.5%, 99.9% for silver/gold'
      }
    },
    {
      title: 'Pieces - Item Count',
      data: {
        'Name': 'Pieces',
        'Data Type': 'Number',
        'Unit': 'pcs',
        'Required': 'Yes',
        'Visible': 'Yes',
        'Use Case': 'Count of items (bars, coins, sheets)'
      }
    }
  ],
  tips: [
    'Create specifications FIRST, then use them in Option Types',
    'PLASTIC INDUSTRY: MFI (g/10min), Density (g/cm³), Price (₹/kg), Grade, Melting Point (°C)',
    'STEEL INDUSTRY: Thickness (mm), Width (mm), Length (mm), Grade, Weight (kg with formula)',
    'FOOD PACKAGING: Width (cm), Height (cm), Gusset (cm), Layers, Barrier, Weight (g with formula)',
    'PRECIOUS METALS: Weight (g), Pieces (pcs), Purity (%), Form, Grade',
    'Use Number type for: MFI, Density, Price, Thickness, Weight, Purity, Pieces',
    'Use String type for: Grade, Color, Form, Barrier Type',
    'Mark critical specs as Required: MFI, Density, Thickness, Purity',
    'Enable "Allow Formula" for calculated fields like Weight',
    'Set default values for common specs: Density=0.92 for LDPE',
    'Units matter: g/10min (MFI), g/cm³ (Density), mm (Thickness), ₹/kg (Price)',
    'Specifications are reusable - create once, use across multiple Option Types',
    'Create base specs first (MFI, Density), then advanced ones (Tensile Strength, Dart Impact)',
    'Can bulk import up to 100 specifications via Excel'
  ]
};

// Create Inventory Help Content
export const createInventoryHelp: HelpDocContent = {
  title: 'Create Inventory',
  subtitle: 'Configure inventory tracking system for your products and materials',
  purpose: 'Inventory configuration lets you track stock levels for products and materials. Define which option types to track, set up units (kg, pcs, boxes), create calculations for automatic conversions, and monitor stock movements in real-time. Perfect for plastic granules, finished products, steel sheets, food packaging materials, and any inventory you need to manage.',
  steps: [
    {
      title: 'Enter Basic Information',
      description: 'Type Name (descriptive title), Code (short identifier), and Description of what this inventory tracks.',
      tip: 'Examples: "LDPE Granules Inventory" (Code: LDPE-INV), "Finished Bags Stock" (Code: BAG-STK)'
    },
    {
      title: 'Select Linked Option Types',
      description: 'Choose which option types to track in this inventory. Only selected types will appear in inventory reports.',
      tip: 'For materials: Select raw material types (LDPE Granules, PP Granules). For products: Select finished goods (LDPE Bag, Food Pouch)'
    },
    {
      title: 'Select Specifications for Formulas',
      description: 'Choose specifications from linked option types to use in calculations. Only number-type specs can be used in formulas.',
      tip: 'Example: Select Weight, Density, Quantity for conversion calculations'
    },
    {
      title: 'Add Dynamic Calculations',
      description: 'Create formulas to auto-calculate values like weight conversions, pieces per box, kg per roll, etc.',
      tip: 'Formula: Total_Weight = Quantity * Unit_Weight. Or: Pieces_Per_Box = Box_Weight / Piece_Weight'
    },
    {
      title: 'Configure Inventory Units',
      description: 'Select which units to track (kg, pcs, boxes, rolls, tons). Set one as primary for main tracking.',
      tip: 'Example: kg (primary), tons, bags. System auto-converts: 1000 kg = 1 ton = 40 bags (25kg each)'
    },
    {
      title: 'Review Preview',
      description: 'Check the preview panel to see your configuration summary with all option types, formulas, and units.',
    },
    {
      title: 'Save Configuration',
      description: 'Click Save to create the inventory. It will be available for stock tracking and order integration.',
    }
  ],
  sections: [
    {
      title: '📋 Basic Information',
      icon: '📋',
      content: [
        'Define the inventory configuration basics:',
        '',
        'Name: Descriptive title',
        '  • LDPE Granules Inventory',
        '  • Finished Bags Stock',
        '  • Steel Sheets Warehouse',
        '',
        'Code: Short unique identifier',
        '  • LDPE-INV, BAG-STK, SS-WH',
        '',
        'Description: Detailed explanation',
        '  • What items are tracked',
        '  • Storage location'
      ]
    },
    {
      title: '🎯 Linked Option Types',
      icon: '🎯',
      content: [
        'Select which option types to track:',
        '',
        '✅ Purpose: Restrict inventory to specific types',
        '',
        '🏭 Examples:',
        '  • Raw Materials: LDPE Granules, PP Granules',
        '  • Finished Products: LDPE Bags, Food Pouches',
        '',
        '🔍 How It Works:',
        '  1. Select types from list',
        '  2. Only selected types tracked',
        '  3. Stock reports show only these items'
      ]
    },
    {
      title: '📐 Specifications for Formulas',
      icon: '📐',
      content: [
        'Select specifications to use in calculations:',
        '',
        '⚡ Purpose: Reference spec values in formulas',
        '',
        '📊 Available: Only NUMBER type specs',
        '  • Weight, Density, Thickness',
        '  • Width, Height, Length',
        '  • Quantity, Price',
        '',
        '🏭 Use in Formula:',
        '  Total_Weight = Quantity * Weight'
      ]
    },
    {
      title: '🧮 Dynamic Calculations',
      icon: '🧮',
      content: [
        'Create auto-calculated inventory fields:',
        '',
        '⚡ Examples:',
        '',
        '  1. Weight Conversion:',
        '     Total_KG = Quantity * Weight / 1000',
        '',
        '  2. Boxes Calculation:',
        '     Boxes = Total_Pieces / Pieces_Per_Box',
        '',
        '  3. Steel Weight:',
        '     Weight = Thickness * Width * Length * 7.85 / 1000000',
        '',
        '  4. Tons Conversion:',
        '     Stock_Tons = Stock_KG / 1000',
        '',
        '💡 Operators: +, -, *, /, ( )',
        '💡 Functions: SUM, AVG, MAX, MIN'
      ]
    },
    {
      title: '📦 Inventory Units',
      icon: '📦',
      content: [
        'Configure tracking units:',
        '',
        '🎯 Purpose: Track stock in multiple units',
        '',
        '📊 Examples:',
        '',
        '  PLASTIC GRANULES:',
        '  ☑ kg (primary)',
        '  ☑ tons',
        '  ☑ bags',
        '  Auto: 1000 kg = 1 ton = 40 bags',
        '',
        '  FINISHED BAGS:',
        '  ☑ pcs (primary)',
        '  ☑ kg',
        '  ☑ boxes',
        '  Auto: 1 box = 100 pcs',
        '',
        '  STEEL SHEETS:',
        '  ☑ sheets (primary)',
        '  ☑ kg',
        '  ☑ tons'
      ]
    }
  ],
  examples: [
    {
      title: 'LDPE Granules Inventory',
      data: {
        'Name': 'LDPE Raw Material Stock',
        'Code': 'LDPE-RAW',
        'Linked Types': 'LDPE Granules, LLDPE Granules',
        'Specs': 'MFI, Density, Price',
        'Calculations': 'Stock_Tons = Stock_KG / 1000',
        'Units': 'kg (primary), tons, bags'
      }
    },
    {
      title: 'Finished Bags Inventory',
      data: {
        'Name': 'Finished Bags Stock',
        'Code': 'BAG-FIN',
        'Linked Types': 'LDPE Carry Bag',
        'Calculations': 'Weight_KG = Quantity * Weight / 1000',
        'Units': 'pcs (primary), kg, boxes'
      }
    },
    {
      title: 'Steel Inventory',
      data: {
        'Name': 'Steel Sheets Warehouse',
        'Code': 'SS-WH',
        'Linked Types': 'SS304 Sheet, SS316 Sheet',
        'Calculations': 'Total_Tons = Total_KG / 1000',
        'Units': 'sheets (primary), kg, tons'
      }
    }
  ],
  tips: [
    'Create separate inventories for materials and products',
    'Link only related option types',
    'Select specs you\'ll use in calculations',
    'Add calculations for unit conversions',
    'Set most common unit as Primary',
    'Materials: Use Debit mode in order types',
    'Products: Use Credit mode in order types',
    'Test formulas before saving'
  ]
};

// View Template Help Content
export const createViewTemplateHelp: HelpDocContent = {
  title: 'Create View Template',
  subtitle: 'Configure customized operator production entry views for machines',
  purpose: 'View Templates create customized production entry interfaces for machine operators. Each template defines what information operators see and enter when recording production data on their assigned machines. This connects orders to machines and structures the data entry process.',
  steps: [
    {
      title: 'Step 1: Select Machine',
      description: 'Choose the machine type (Extrusion, Printing, Cutting, etc.) and specific machine (Machine-001, Machine-002, etc.) where this view template will be used.',
      tip: 'Each machine can have ONE view template per order type. Different machines need separate templates even if they\'re the same type.'
    },
    {
      title: 'Step 2: Select Order Type & Option Types',
      description: 'Choose the order type (Manufacturing, Job Work, etc.) this template handles. The system will show only allowed option types from that order type. Select which option types to display in this operator view.',
      tip: 'If no option types appear, go back to the order type and configure "Allowed Option Types" first.'
    },
    {
      title: 'Step 3: Configure Display Items',
      description: 'Set up the information operators see at the top of the view. Add display items for product specifications, order details, customer information, or calculated values. These are read-only reference information.',
      tip: 'Display items help operators verify they\'re working on the correct order. Include key product specs like size, material, color, etc.'
    },
    {
      title: 'Step 4: Configure Table Columns',
      description: 'Design the production data entry table. Add columns for weights, counts, quality checks, and other production data. Configure formulas for auto-calculations, dropdowns for standardized values, and validation rules.',
      tip: 'Use formula columns for auto-calculations (Net Weight = Gross - Core). Mark critical fields as required. Use dropdowns for quality grades.'
    },
    {
      title: 'Step 5: Review & Save',
      description: 'Enter template name and description, review all configuration, preview the operator view, and save the template. The template becomes immediately available to operators on the assigned machine.',
      tip: 'Test the template with a sample order before deploying to production. Verify all formulas calculate correctly.'
    }
  ],
  sections: [
    {
      title: '🖥️ Machine Selection (Step 1)',
      icon: '🖥️',
      content: [
        'Machine Type vs. Specific Machine:',
        '',
        '  Machine Type = Category (Extrusion, Printing, Cutting)',
        '  Specific Machine = Individual unit (Extrusion-001, Printing-002)',
        '',
        'Why select specific machine:',
        '  • Each machine gets customized view',
        '  • One view template per order type per machine',
        '  • Prevents operator confusion',
        '  • Allows machine-specific columns/formulas',
        '',
        'Example Setup:',
        '  Extrusion-001: Template for "Manufacturing Orders"',
        '  Extrusion-001: Different template for "Job Work Orders"',
        '  Extrusion-002: Separate template (even if same order type)',
        '',
        'Machine Selection Rules:',
        '  ✓ Same machine + different order type = OK (multiple templates)',
        '  ✗ Same machine + same order type = NOT ALLOWED (only one template)',
        '  ✓ Different machines + same order type = OK (separate templates)'
      ]
    },
    {
      title: '📦 Order Type & Option Types (Step 2)',
      icon: '📦',
      content: [
        'How Order Types Control View Templates:',
        '',
        '1. Select Order Type:',
        '  • Choose order type: Manufacturing, Job Work, etc.',
        '  • System reads "Allowed Option Types" from that order type',
        '  • Only those option types appear in the list',
        '',
        '2. Select Option Types to Display:',
        '  • Check which option types to show in THIS view',
        '  • Selected option types available in Step 3 for display items',
        '  • Operators will see data from these option types',
        '',
        'Example Flow:',
        '  Order Type: "Manufacturing Order"',
        '  Allowed Option Types: [Finished Products, Raw Materials]',
        '  ↓',
        '  View Template Step 2 shows:',
        '  ☑ Finished Products',
        '  ☑ Raw Materials',
        '  (You select which ones to include)',
        '',
        'Troubleshooting:',
        '  ❌ No option types showing?',
        '  → Go to Order Type → Add "Allowed Option Types"',
        '  → Save order type',
        '  → Refresh view template wizard'
      ]
    },
    {
      title: '📊 Display Items Configuration (Step 3)',
      icon: '📊',
      content: [
        'What Are Display Items?',
        '  • Read-only information shown at top of operator view',
        '  • Help operators verify correct order/product',
        '  • Show product specs, customer details, order info',
        '',
        'Display Item Types:',
        '',
        '  📝 TEXT - Product names, customer names, addresses',
        '     Example: Product Name, Customer Company',
        '',
        '  🔢 NUMBER - Quantities, dimensions, weights with units',
        '     Example: Width: 300 mm, Quantity: 10,000 pcs',
        '',
        '  🧮 FORMULA - Calculated values from spec fields',
        '     Example: Size = width + " x " + length',
        '',
        '  ✓ BOOLEAN - Yes/No indicators',
        '     Example: Food Grade Approved: Yes',
        '',
        '  🖼️ IMAGE - Product images, order images',
        '     Example: Design reference photo',
        '',
        'Source Types:',
        '',
        '  1️⃣ optionSpec (Product Specifications):',
        '     • Select Option Type: "Finished Products"',
        '     • Select OptionSpec: Specific product',
        '     • Select Field: width, length, gauge, etc.',
        '',
        '  2️⃣ order (Order Information):',
        '     • Fields: orderId, orderDate, quantity, instructions',
        '',
        '  3️⃣ customer (Customer Information):',
        '     • Fields: name, company, phone, address',
        '',
        '  4️⃣ formula (Calculated Values):',
        '     • Expression: Custom calculation',
        '     • Example: "width + \' x \' + length + \' mm\'"',
        '',
        'Example Configuration:',
        '  Display Item 1: Product (optionSpec → name)',
        '  Display Item 2: Width (optionSpec → width, 300 mm)',
        '  Display Item 3: Length (optionSpec → length, 450 mm)',
        '  Display Item 4: Size (formula → "width x length")',
        '  Display Item 5: Customer (customer → name)',
        '  Display Item 6: Order Qty (order → quantity)'
      ]
    },
    {
      title: '📝 Table Columns Configuration (Step 4)',
      icon: '📝',
      content: [
        'Table Column Types:',
        '',
        '  📝 TEXT - Free-form text entry',
        '     Use for: Remarks, notes, operator observations',
        '     Example: "Roll appears uniform, no defects"',
        '',
        '  🔢 NUMBER - Numeric values with optional units',
        '     Use for: Weights, counts, dimensions',
        '     Example: Gross Weight: 25.5 kg',
        '     Validation: Must be valid number',
        '',
        '  🧮 FORMULA - Auto-calculated (read-only)',
        '     Use for: Net weight, totals, percentages',
        '     Example: Net Wt = Gross Wt - Core Wt',
        '     Formula: "grossWt - coreWt"',
        '',
        '  📋 DROPDOWN - Pre-defined options',
        '     Use for: Quality grades, status, categories',
        '     Example: Grade: A / B / Rejected',
        '     Ensures data consistency',
        '',
        '  ✓ BOOLEAN - Yes/No or True/False',
        '     Use for: Quality checks, verifications',
        '     Example: Gauge Check: ✓ Pass / ✗ Fail',
        '',
        '  📅 DATE - Date picker',
        '     Use for: Production dates, expiry dates',
        '     Example: Manufacturing Date: 2026-01-18',
        '',
        '  🖼️ IMAGE - Photo upload',
        '     Use for: Quality documentation, defect records',
        '     Example: Photo of finished roll',
        '',
        '  🎤 AUDIO - Voice notes',
        '     Use for: Quick operator remarks',
        '     Example: Voice note about machine issues',
        '',
        'Column Configuration Fields:',
        '',
        '  Basic Settings:',
        '  • Name: Internal variable (grossWt, coreWt)',
        '  • Label: Display name (Gross Weight, Core Weight)',
        '  • Data Type: text/number/formula/dropdown',
        '  • Unit: kg, pcs, mm, meters, etc.',
        '  • Order: Display sequence (1, 2, 3...)',
        '  • Width: Column width in pixels',
        '',
        '  Validation Settings:',
        '  • Is Required: Operator must fill this field',
        '  • Is Read Only: Auto-filled, operator can\'t edit',
        '  • Is Visible: Show or hide column',
        '',
        '  Source Settings:',
        '  • Source Type: manual/order/customer/optionSpec/calculated',
        '  • Source Field: Which field to pull data from',
        '',
        'Example: Net Weight Column',
        '  Name: netWt',
        '  Label: Net Weight',
        '  Data Type: Formula',
        '  Unit: kg',
        '  Formula Type: CUSTOM',
        '  Expression: "grossWt - coreWt"',
        '  Dependencies: [grossWt, coreWt]',
        '  Is Read Only: Yes',
        '  Is Visible: Yes'
      ]
    },
    {
      title: '🧮 Formula System',
      icon: '🧮',
      content: [
        'Formula Basics:',
        '',
        '  Variable Names:',
        '  • Use column NAME field, not label',
        '  • Column label: "Gross Weight"',
        '  • Column name: grossWt',
        '  • In formula use: grossWt (not "Gross Weight")',
        '',
        '  Operators:',
        '  • Addition: +',
        '  • Subtraction: -',
        '  • Multiplication: *',
        '  • Division: /',
        '  • Parentheses: ( )',
        '',
        'Formula Types:',
        '',
        '  1️⃣ CUSTOM (Most Flexible):',
        '     Expression: "grossWt - coreWt"',
        '     Expression: "(width * length * gauge) / 3300"',
        '     Expression: "(value / total) * 100"',
        '',
        '  2️⃣ SUM - Adds multiple columns:',
        '     Expression: "SUM(col1, col2, col3)"',
        '',
        '  3️⃣ AVERAGE - Averages columns:',
        '     Expression: "AVERAGE(col1, col2, col3)"',
        '',
        '  4️⃣ MULTIPLY - Multiplies columns:',
        '     Expression: "MULTIPLY(quantity, price)"',
        '',
        '  5️⃣ DIVIDE - Divides columns:',
        '     Expression: "DIVIDE(total, count)"',
        '',
        'Pre-defined Formula Templates:',
        '',
        '  Material Calculations:',
        '  • Per Bag Gram (LLDPE): (width * length * gauge) / 3300',
        '  • Per Bag Gram (PP): (width * length * gauge) / 3600',
        '  • Per Bag Gram (HM): (width * length * gauge) / 3265',
        '  • Bags per KG: 1000 / perBagGram',
        '',
        '  Weight Calculations:',
        '  • Net Weight: grossWt - coreWt',
        '  • Difference Qty: targetQty - netWt',
        '  • Percentage: (value / total) * 100',
        '',
        '  Size Calculations:',
        '  • Roll Size (B/S): width',
        '  • Roll Size (S/S): length',
        '  • Garment Roll: length + flap + gusset + innerLip',
        '  • Gauge Check: (width * gauge) / 100',
        '',
        'Example: Plastic Film Weight',
        '  Column: "Per Bag Weight"',
        '  Formula: "(width * length * gauge) / 3300"',
        '  Dependencies: [width, length, gauge]',
        '  Unit: grams',
        '  ↓',
        '  If width=300mm, length=450mm, gauge=40:',
        '  Result = (300 * 450 * 40) / 3300 = 1636.36 grams',
        '',
        'Common Mistakes:',
        '  ❌ Using label: "Gross Weight" - "Core Weight"',
        '  ✅ Using name: grossWt - coreWt',
        '',
        '  ❌ Missing dependencies: []',
        '  ✅ Include all: ["grossWt", "coreWt"]',
        '',
        '  ❌ Ambiguous: width * length * gauge / 3300',
        '  ✅ Clear: (width * length * gauge) / 3300'
      ]
    },
    {
      title: '⚙️ Settings & Options',
      icon: '⚙️',
      content: [
        'Template Settings (Step 5):',
        '',
        '  Time Tracking:',
        '  • Auto Start Time: Record when operator starts',
        '  • Auto End Time: Record when operator finishes',
        '',
        '  Personnel Requirements:',
        '  • Require Operator: Must select operator name',
        '  • Require Helper: Must assign helper/assistant',
        '  • Require Approval: Supervisor approval needed',
        '',
        '  Media Options:',
        '  • Allow Voice Note: Enable audio recording',
        '  • Allow Image Upload: Enable photo uploads',
        '',
        'Customer Field Visibility:',
        '',
        '  Customer Identity:',
        '  • Show Name (Full Name)',
        '  • Show First Name / Last Name separately',
        '  • Show Company Name',
        '  • Show Customer Alias',
        '  • Show Customer Image',
        '',
        '  Contact Information:',
        '  • Show Phone 1 / Phone 2',
        '  • Show WhatsApp number',
        '  • Show Email address',
        '',
        '  Address Information:',
        '  • Show Address 1 / Address 2',
        '  • Show State',
        '  • Show Pin Code',
        '  • Show Full Address (combined)',
        '',
        '  Order Information:',
        '  • Show Order ID',
        '  • Show Order Date',
        '  • Show Target Quantity',
        '  • Show Special Instructions',
        '  • Show Order Image/Reference',
        '',
        'Totals Configuration:',
        '  • Add summary rows at bottom of table',
        '  • SUM: Total of all values in column',
        '  • AVERAGE: Average of all values',
        '  • COUNT: Count of non-empty rows',
        '  • Example: Total Net Weight = SUM of all net weights'
      ]
    }
  ],
  examples: [
    {
      title: 'Example 1: LDPE Bag Extrusion Production',
      data: {
        'Machine': 'Extrusion-001 (Extrusion Machine)',
        'Order Type': 'Manufacturing Order',
        'Option Types': 'Finished Products',
        'Display Items': 'Product, Width (300mm), Length (450mm), Gauge (40 microns), Material (LDPE), Customer, Order Qty',
        'Column 1': 'S.No (number, read-only, auto-increment)',
        'Column 2': 'Gross Weight (number, kg, required)',
        'Column 3': 'Core Weight (number, kg, required)',
        'Column 4': 'Net Weight (formula: grossWt - coreWt, kg, read-only)',
        'Column 5': 'Quality Grade (dropdown: A Grade/B Grade/Rejected)',
        'Column 6': 'Gauge Check (boolean)',
        'Column 7': 'Remarks (text, optional)',
        'Use Case': 'Weight tracking with auto net weight calculation and quality grading'
      }
    },
    {
      title: 'Example 2: Flexo Printing Machine',
      data: {
        'Machine': 'Flexo-001 (Printing Machine)',
        'Order Type': 'Manufacturing Order',
        'Option Types': 'Finished Products, Print Designs',
        'Display Items': 'Product, Print Type (4 Color), Colors, Design Image, Customer',
        'Column 1': 'Roll No (text, required)',
        'Column 2': 'Start Time (auto, read-only)',
        'Column 3': 'End Time (auto, read-only)',
        'Column 4': 'Printed Length (number, meters, required)',
        'Column 5': 'Waste Length (number, meters)',
        'Column 6': 'Print Quality (dropdown: Excellent/Good/Fair/Poor)',
        'Column 7': 'Color Matching (boolean, required)',
        'Column 8': 'Sample Photo (image)',
        'Use Case': 'Printing production tracking with quality checks and photo documentation'
      }
    },
    {
      title: 'Example 3: Bag Making with Efficiency Formula',
      data: {
        'Machine': 'BagMaker-001 (Bag Making Machine)',
        'Order Type': 'Manufacturing Order',
        'Option Types': 'Finished Products',
        'Display Items': 'Bag Type, Size (formula: width x length), Gauge, Target Qty, Per Bag Weight (formula)',
        'Column 1': 'Batch No (text, required)',
        'Column 2': 'Target Qty (number, pcs, from order)',
        'Column 3': 'Produced Qty (number, pcs, required)',
        'Column 4': 'Rejected Qty (number, pcs)',
        'Column 5': 'OK Qty (formula: producedQty - rejectedQty)',
        'Column 6': 'Efficiency % (formula: (okQty / targetQty) * 100)',
        'Column 7': 'Grade (dropdown: A/B/C/Rejected)',
        'Use Case': 'Production tracking with auto-calculated efficiency and good quantity percentage'
      }
    }
  ],
  tips: [
    'Create machine and order type BEFORE creating view template',
    'Ensure order type has "Allowed Option Types" configured',
    'One machine = one template per order type (can\'t have duplicates)',
    'Use formula columns for auto-calculations (Net Weight, Efficiency, etc.)',
    'Mark calculated columns as "Read Only"',
    'Use dropdowns for standardized values (Quality grades, status, etc.)',
    'Test template with sample order before production deployment',
    'Include key product specs in display items for operator verification',
    'Use units consistently (kg, pcs, meters, etc.)',
    'Use clear column names (grossWt, not "Gross Weight")',
    'Always specify formula dependencies',
    'Use parentheses in complex formulas for clarity',
    'Mark critical fields as required (weights, counts, quality)',
    'Allow image uploads for quality documentation',
    'Enable voice notes for quick operator feedback',
    'Review VIEW_TEMPLATE_GUIDE.md for 22 detailed industry examples'
  ]
};

// Print Type Help Content
export const printTypeHelp: HelpDocContent = {
  title: 'Create Print Type',
  subtitle: 'Design custom print templates',
  purpose: 'Print Types are customizable templates for generating invoices, quotations, delivery challans, and other documents. Design the layout using HTML templates and link them to specific order types.',
  steps: [
    {
      title: 'Enter Basic Information',
      description: 'Type Name, Code, and Description for the print template.',
      tip: 'Example: "Tax Invoice", Code: "TAX-INV"'
    },
    {
      title: 'Configure Page Settings',
      description: 'Select paper size (A4, Letter, etc.), orientation (Portrait/Landscape), and set margins.',
    },
    {
      title: 'Design Header Template',
      description: 'Add HTML for the header section. Include company name, logo, document title.',
      tip: 'Use variables like {{companyName}}, {{companyAddress}}'
    },
    {
      title: 'Design Body Template',
      description: 'Add HTML for the main content area. Include order details, item lists, calculations.',
      tip: 'Use {{orderNumber}}, {{customerName}}, {{items}} variables'
    },
    {
      title: 'Design Footer Template',
      description: 'Add HTML for the footer. Include terms, signatures, totals.',
    },
    {
      title: 'Add CSS Styling',
      description: 'Write CSS to style your template. Control fonts, colors, spacing, and layout.',
      tip: 'Use print-specific CSS for better results'
    },
    {
      title: 'Link to Order Types',
      description: 'Select which order types can use this print template.',
    },
    {
      title: 'Save and Preview',
      description: 'Click Save. Use Preview button to see how it looks with sample data.',
    }
  ],
  sections: [
    {
      title: 'Template Variables',
      icon: '{{}}',
      content: [
        '{{companyName}} - Your company name',
        '{{companyAddress}} - Company address',
        '{{companyPhone}} - Contact number',
        '{{orderNumber}} - Order ID',
        '{{customerName}} - Customer name',
        '{{orderDate}} - Order date',
        '{{items}} - Order items list',
        '{{totalAmount}} - Grand total'
      ]
    },
    {
      title: 'Page Settings',
      icon: '📄',
      content: [
        'Paper Size - A4, Letter, Legal, A5',
        'Orientation - Portrait or Landscape',
        'Margins - Top, Right, Bottom, Left (in mm)'
      ]
    },
    {
      title: 'Global/Default Options',
      icon: '⚙️',
      content: [
        'Global - Available for all order types',
        'Default - Auto-selected when creating orders',
        'Active - Template is enabled for use'
      ]
    }
  ],
  examples: [
    {
      title: 'Tax Invoice',
      data: {
        'Name': 'Tax Invoice',
        'Code': 'TAX-INV',
        'Paper Size': 'A4',
        'Orientation': 'Portrait',
        'Linked To': 'Sales orders, Manufacturing orders'
      }
    },
    {
      title: 'Delivery Challan',
      data: {
        'Name': 'Delivery Challan',
        'Code': 'DC',
        'Paper Size': 'A5',
        'Orientation': 'Landscape',
        'Linked To': 'Dispatch orders'
      }
    }
  ],
  tips: [
    'Use Template Library for quick start templates',
    'Preview with sample data before saving',
    'Keep templates simple for faster printing',
    'Use CSS for professional styling',
    'Test print on actual paper before using in production',
    'Save frequently while designing complex templates'
  ]
};

// Excel Export Type Help Content
export const createExcelExportTypeHelp: HelpDocContent = {
  title: 'Create Excel Export Type',
  subtitle: 'Design custom Excel export templates for order data',
  purpose: 'Excel Export Types define customizable Excel/CSV export formats for orders. Configure which data columns to include, link to specific order/option types, and create reusable export templates for reports, analysis, and data sharing.',
  steps: [
    {
      title: 'Enter Basic Information',
      description: 'Provide Type Name (descriptive title), Type Code (short identifier), and optional Description explaining what data this export includes.',
      tip: 'Example: "Daily Production Report" (Code: PROD-DAILY), "Customer Orders Export" (Code: CUST-ORD)'
    },
    {
      title: 'Link to Order Types',
      description: 'Select which order types this export template will be available for. You can make it Global (available for all order types) or link to specific order types.',
      tip: 'Global exports work for any order. Specific exports show only for selected order types.'
    },
    {
      title: 'Link to Option Types & Specifications',
      description: 'Select option types whose specifications you want to include in the export. This adds columns for product/material specifications from selected option types.',
      tip: 'Selecting "Finished Products" adds columns for width, length, gauge, etc. based on the option specification.'
    },
    {
      title: 'Configure Export Columns',
      description: 'Choose which data columns to include in the Excel export. Columns are organized by category: Basic Order Info, Customer Details, Products & Materials, Status & Progress, Dates, and Other.',
      tip: 'Select only the columns you need. Too many columns make exports hard to read.'
    },
    {
      title: 'Configure Export Settings',
      description: 'Set Excel sheet name, file name prefix, and whether to include column headers. These control how the exported file is formatted.',
      tip: 'Sheet Name: "Orders", File Prefix: "Report" → generates "Report_2026-01-18.xlsx"'
    },
    {
      title: 'Set Advanced Options',
      description: 'Configure Global (available for all types), Default (auto-selected), and Active (enabled) settings for this export template.',
      tip: 'Global + Default = This export template is the default for all order types'
    }
  ],
  sections: [
    {
      title: '📋 Basic Information',
      icon: '📋',
      content: [
        'Excel Export Type Configuration:',
        '',
        '  Type Name (Required):',
        '  • Descriptive name for this export template',
        '  • Example: "Daily Production Report"',
        '  • Example: "Customer Orders Export"',
        '',
        '  Type Code (Required):',
        '  • Short unique identifier',
        '  • Auto-converts to UPPERCASE',
        '  • Example: "PROD-DAILY", "CUST-ORD"',
        '',
        '  Description (Optional):',
        '  • Explain what data this export includes'
      ]
    },
    {
      title: '📦 Link to Order Types',
      icon: '📦',
      content: [
        'Control which order types can use this export:',
        '',
        '  🌍 Global Export (All Order Types):',
        '  • Check "Global" checkbox in Advanced Settings',
        '  • Export available for ANY order type',
        '  • Example: "All Orders Export"',
        '',
        '  🎯 Specific Order Types:',
        '  • Select specific order types from the list',
        '  • Export only available for selected types',
        '  • Example: Link to "Manufacturing Order" only'
      ]
    },
    {
      title: '🔗 Link to Option Types & Specifications',
      icon: '🔗',
      content: [
        'Add product/material specification columns:',
        '',
        '  What happens when you link:',
        '  • System adds columns for all specifications',
        '  • Column naming: OptionTypeName_SpecificationName',
        '  • Example: "Finished_Products_Width"',
        '',
        '  Use Cases:',
        '  • Manufacturing: Link "Finished Products" for dimensions',
        '  • Material Report: Link "Raw Materials" for specs',
        '  • Complete Export: Link ALL option types'
      ]
    },
    {
      title: '📊 Export Columns Configuration',
      icon: '📊',
      content: [
        'Column Categories:',
        '',
        '  📌 Basic Order Info:',
        '  • Order ID, Date, Status, Priority, Order Type',
        '',
        '  👤 Customer Details:',
        '  • Name, Phone, Email, Address, WhatsApp',
        '',
        '  📦 Products & Materials:',
        '  • Products, Materials, Quantity, All Options',
        '',
        '  🔄 Status & Progress:',
        '  • Current Step, Machine Status, Progress %',
        '',
        '  📅 Dates:',
        '  • Created, Updated, Scheduled, Actual, Dispatched',
        '',
        '  🔧 Other:',
        '  • Branch, Notes, Assigned Manager'
      ]
    },
    {
      title: '⚙️ Export Settings',
      icon: '⚙️',
      content: [
        'Excel file generation settings:',
        '',
        '  📄 Sheet Name:',
        '  • Name of Excel worksheet tab',
        '  • Default: "Orders"',
        '',
        '  📁 File Name Prefix:',
        '  • Text before timestamp',
        '  • Example: "Report_2026-01-18.xlsx"',
        '',
        '  📋 Include Headers:',
        '  • First row contains column names',
        '  • Recommended: Checked'
      ]
    },
    {
      title: '🌟 Advanced Settings',
      icon: '🌟',
      content: [
        'Template availability settings:',
        '',
        '  🌍 Global:',
        '  • Available for ALL order types',
        '',
        '  ⭐ Default:',
        '  • Pre-selected when exporting',
        '',
        '  ✅ Active:',
        '  • Template is enabled for use'
      ]
    }
  ],
  examples: [
    {
      title: 'Example 1: Daily Production Report',
      data: {
        'Type Name': 'Daily Production Report',
        'Type Code': 'PROD-DAILY',
        'Order Types': 'Manufacturing Order',
        'Option Types': 'Finished Products',
        'Columns': 'Order ID, Date, Customer, Products, Quantity, Machine Status',
        'Use Case': 'Daily production tracking'
      }
    },
    {
      title: 'Example 2: Customer Orders Export',
      data: {
        'Type Name': 'Customer Orders Export',
        'Type Code': 'CUST-ORD',
        'Order Types': 'Global (all types)',
        'Option Types': 'None',
        'Columns': 'Order ID, Customer Name, Phone, Email, Status',
        'Use Case': 'Customer relationship management'
      }
    },
    {
      title: 'Example 3: Pending Orders Analysis',
      data: {
        'Type Name': 'Pending Orders Analysis',
        'Type Code': 'PEND-ANALYSIS',
        'Order Types': 'Global',
        'Option Types': 'Finished Products, Raw Materials',
        'Columns': 'Order ID, Customer, Products, Specifications, Scheduled Dates',
        'Use Case': 'Planning and resource allocation'
      }
    }
  ],
  tips: [
    'Use descriptive Type Names',
    'Type Code should be short and meaningful',
    'Global exports work for all order types',
    'Link option types to include specification columns',
    'Select only needed columns',
    'Use Default for most common export format',
    'Include Headers = Yes (recommended)',
    'Test export with sample data',
    'Create multiple exports for different purposes',
    'One default export per order type maximum'
  ]
};
