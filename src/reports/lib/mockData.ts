// Mock Data for Branch: BRC-001 (Mumbai Branch)

export const mockBranch = {
  _id: "branch001",
  name: "Mumbai Manufacturing Unit",
  location: "Andheri East, Mumbai",
  code: "BRC-001"
};

// Export mock branches from mockBranches file
export { mockBranches } from './mockBranches';

export const mockCustomers = [
  {
    _id: "cust001",
    companyName: "Rajesh Plastics Ltd",
    firstName: "Rajesh",
    lastName: "Kumar",
    phone1: "9876543210",
    state: "Maharashtra",
    branchId: "branch001"
  },
  {
    _id: "cust002",
    companyName: "Sharma Industries",
    firstName: "Amit",
    lastName: "Sharma",
    phone1: "9876543211",
    state: "Maharashtra",
    branchId: "branch001"
  },
  {
    _id: "cust003",
    companyName: "Modern Packaging Co",
    firstName: "Priya",
    lastName: "Patel",
    phone1: "9876543212",
    state: "Gujarat",
    branchId: "branch001"
  },
  {
    _id: "cust004",
    companyName: "Global Exports",
    firstName: "Vikram",
    lastName: "Singh",
    phone1: "9876543213",
    state: "Delhi",
    branchId: "branch001"
  }
];

export const mockMachines = [
  // Printing Machines (4)
  {
    _id: "mach001",
    machineName: "Print-P1",
    machineType: "Printing Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach002",
    machineName: "Print-P2",
    machineType: "Printing Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach003",
    machineName: "Print-P3",
    machineType: "Printing Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach004",
    machineName: "Print-P4",
    machineType: "Printing Machine",
    status: "maintenance",
    branchId: "branch001"
  },
  // Cutting Machines (10)
  {
    _id: "mach005",
    machineName: "Cut-C1",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach006",
    machineName: "Cut-C2",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach007",
    machineName: "Cut-C3",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach008",
    machineName: "Cut-C4",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach009",
    machineName: "Cut-C5",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach010",
    machineName: "Cut-C6",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach011",
    machineName: "Cut-C7",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach012",
    machineName: "Cut-C8",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach013",
    machineName: "Cut-C9",
    machineType: "Cutting Machine",
    status: "maintenance",
    branchId: "branch001"
  },
  {
    _id: "mach014",
    machineName: "Cut-C10",
    machineType: "Cutting Machine",
    status: "active",
    branchId: "branch001"
  },
  // Extrusion Machines (4)
  {
    _id: "mach015",
    machineName: "Extruder-E1",
    machineType: "Extrusion Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach016",
    machineName: "Extruder-E2",
    machineType: "Extrusion Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach017",
    machineName: "Extruder-E3",
    machineType: "Extrusion Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach018",
    machineName: "Extruder-E4",
    machineType: "Extrusion Machine",
    status: "active",
    branchId: "branch001"
  },
  // Sealing Machines (3)
  {
    _id: "mach019",
    machineName: "Seal-S1",
    machineType: "Sealing Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach020",
    machineName: "Seal-S2",
    machineType: "Sealing Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach021",
    machineName: "Seal-S3",
    machineType: "Sealing Machine",
    status: "maintenance",
    branchId: "branch001"
  },
  // Molding Machines (2)
  {
    _id: "mach022",
    machineName: "Mold-M1",
    machineType: "Molding Machine",
    status: "active",
    branchId: "branch001"
  },
  {
    _id: "mach023",
    machineName: "Mold-M2",
    machineType: "Molding Machine",
    status: "active",
    branchId: "branch001"
  }
];

export const mockMaterials = [
  {
    _id: "mat001",
    materialName: "HDPE Plastic",
    materialType: "High Density Polyethylene",
    costPerKg: 65
  },
  {
    _id: "mat002",
    materialName: "LDPE Plastic",
    materialType: "Low Density Polyethylene",
    costPerKg: 58
  },
  {
    _id: "mat003",
    materialName: "PP Plastic",
    materialType: "Polypropylene",
    costPerKg: 72
  },
  {
    _id: "mat004",
    materialName: "PVC Plastic",
    materialType: "Polyvinyl Chloride",
    costPerKg: 55
  }
];

export const mockOperators = [
  {
    _id: "op001",
    name: "Ramesh Patil",
    employeeId: "EMP-001",
    shift: "Morning",
    experience: "5 years",
    specialization: "Extrusion",
    branchId: "branch001"
  },
  {
    _id: "op002",
    name: "Suresh Kumar",
    employeeId: "EMP-002",
    shift: "Morning",
    experience: "8 years",
    specialization: "Molding",
    branchId: "branch001"
  },
  {
    _id: "op003",
    name: "Amit Desai",
    employeeId: "EMP-003",
    shift: "Evening",
    experience: "3 years",
    specialization: "Cutting",
    branchId: "branch001"
  },
  {
    _id: "op004",
    name: "Prakash Singh",
    employeeId: "EMP-004",
    shift: "Night",
    experience: "6 years",
    specialization: "Sealing",
    branchId: "branch001"
  },
  {
    _id: "op005",
    name: "Vijay Sharma",
    employeeId: "EMP-005",
    shift: "Morning",
    experience: "4 years",
    specialization: "Extrusion",
    branchId: "branch001"
  },
  {
    _id: "op006",
    name: "Manoj Yadav",
    employeeId: "EMP-006",
    shift: "Evening",
    experience: "2 years",
    specialization: "Molding",
    branchId: "branch001"
  },
  {
    _id: "op007",
    name: "Ravi Verma",
    employeeId: "EMP-007",
    shift: "Night",
    experience: "7 years",
    specialization: "Cutting",
    branchId: "branch001"
  },
  {
    _id: "op008",
    name: "Ganesh Naik",
    employeeId: "EMP-008",
    shift: "Morning",
    experience: "9 years",
    specialization: "All-round",
    branchId: "branch001"
  }
];

export const mockOrders = [
  {
    _id: "ord001",
    orderId: "ORD-BRC-001-241020-001",
    customerId: "cust001",
    customerName: "Rajesh Plastics Ltd",
    operatorId: "op008",
    operatorName: "Ganesh Naik",
    materialWeight: 500,
    materialType: "High Density Polyethylene",
    Width: 300,
    Height: 400,
    Thickness: 0.5,
    overallStatus: "completed",
    priority: "high",
    createdAt: "2024-10-20T08:00:00Z",
    actualStartDate: "2024-10-20T09:00:00Z",
    actualEndDate: "2024-10-22T18:00:00Z",
    mixMaterial: [
      { materialId: "mat001", materialName: "HDPE Plastic", plannedWeight: 350, actualUsedWeight: 340, wastageWeight: 10, costPerKg: 65, totalCost: 22100 },
      { materialId: "mat002", materialName: "LDPE Plastic", plannedWeight: 150, actualUsedWeight: 145, wastageWeight: 5, costPerKg: 58, totalCost: 8410 }
    ],
    realTimeData: {
      totalNetWeight: 475,
      totalWastage: 25,
      totalCost: 30510,
      overallEfficiency: 95,
      activeMachines: 0,
      completedMachines: 3,
      totalRowsProcessed: 45
    },
    qualityControl: {
      inspectionStatus: "passed",
      qualityScore: 92,
      inspectedBy: "Inspector A"
    },
    financial: {
      estimatedCost: 29000,
      actualCost: 30510,
      materialCost: 30510,
      laborCost: 6000,
      overheadCost: 2500,
      finalPrice: 48000,
      profitMargin: 9000
    },
    delivery: {
      deliveryStatus: "delivered",
      expectedDate: "2024-10-25T00:00:00Z",
      actualDate: "2024-10-24T00:00:00Z"
    },
    branchId: "branch001"
  },
  {
    _id: "ord002",
    orderId: "ORD-BRC-001-241021-002",
    customerId: "cust002",
    customerName: "Sharma Industries",
    operatorId: "op002",
    operatorName: "Suresh Kumar",
    materialWeight: 750,
    materialType: "Polypropylene",
    Width: 350,
    Height: 450,
    Thickness: 0.6,
    overallStatus: "in_progress",
    priority: "normal",
    createdAt: "2024-10-21T10:00:00Z",
    actualStartDate: "2024-10-21T11:00:00Z",
    actualEndDate: null,
    mixMaterial: [
      { materialId: "mat003", materialName: "PP Plastic", plannedWeight: 500, actualUsedWeight: 385, wastageWeight: 25, costPerKg: 72, totalCost: 27720 },
      { materialId: "mat001", materialName: "HDPE Plastic", plannedWeight: 250, actualUsedWeight: 170, wastageWeight: 10, costPerKg: 65, totalCost: 11050 }
    ],
    realTimeData: {
      totalNetWeight: 520,
      totalWastage: 35,
      totalCost: 38770,
      overallEfficiency: 93.7,
      activeMachines: 2,
      completedMachines: 1,
      totalRowsProcessed: 62
    },
    qualityControl: {
      inspectionStatus: "in_progress",
      qualityScore: null,
      inspectedBy: null
    },
    financial: {
      estimatedCost: 42000,
      actualCost: 38770,
      materialCost: 38770,
      laborCost: 8000,
      overheadCost: 2000,
      finalPrice: 62000,
      profitMargin: 13230
    },
    delivery: {
      deliveryStatus: "pending",
      expectedDate: "2024-10-28T00:00:00Z",
      actualDate: null
    },
    branchId: "branch001"
  },
  {
    _id: "ord003",
    orderId: "ORD-BRC-001-241022-003",
    customerId: "cust003",
    customerName: "Modern Packaging Co",
    operatorId: "op006",
    operatorName: "Manoj Yadav",
    materialWeight: 600,
    materialType: "Low Density Polyethylene",
    Width: 280,
    Height: 380,
    Thickness: 0.4,
    overallStatus: "completed",
    priority: "urgent",
    createdAt: "2024-10-22T07:00:00Z",
    actualStartDate: "2024-10-22T08:00:00Z",
    actualEndDate: "2024-10-24T16:00:00Z",
    mixMaterial: [
      { materialId: "mat002", materialName: "LDPE Plastic", plannedWeight: 400, actualUsedWeight: 385, wastageWeight: 15, costPerKg: 58, totalCost: 22330 },
      { materialId: "mat004", materialName: "PVC Plastic", plannedWeight: 200, actualUsedWeight: 185, wastageWeight: 15, costPerKg: 55, totalCost: 10175 }
    ],
    realTimeData: {
      totalNetWeight: 570,
      totalWastage: 30,
      totalCost: 32505,
      overallEfficiency: 95,
      activeMachines: 0,
      completedMachines: 3,
      totalRowsProcessed: 54
    },
    qualityControl: {
      inspectionStatus: "passed",
      qualityScore: 95,
      inspectedBy: "Inspector B"
    },
    financial: {
      estimatedCost: 32000,
      actualCost: 32505,
      materialCost: 32505,
      laborCost: 7000,
      overheadCost: 2600,
      finalPrice: 52000,
      profitMargin: 9895
    },
    delivery: {
      deliveryStatus: "delivered",
      expectedDate: "2024-10-26T00:00:00Z",
      actualDate: "2024-10-25T00:00:00Z"
    },
    branchId: "branch001"
  },
  {
    _id: "ord004",
    orderId: "ORD-BRC-001-241023-004",
    customerId: "cust004",
    customerName: "Global Exports",
    operatorId: "op003",
    operatorName: "Amit Desai",
    materialWeight: 900,
    materialType: "High Density Polyethylene",
    Width: 400,
    Height: 500,
    Thickness: 0.7,
    overallStatus: "pending",
    priority: "normal",
    createdAt: "2024-10-23T09:00:00Z",
    actualStartDate: null,
    actualEndDate: null,
    mixMaterial: [
      { materialId: "mat001", materialName: "HDPE Plastic", plannedWeight: 600, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 65, totalCost: 0 },
      { materialId: "mat003", materialName: "PP Plastic", plannedWeight: 300, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 72, totalCost: 0 }
    ],
    realTimeData: {
      totalNetWeight: 0,
      totalWastage: 0,
      totalCost: 0,
      overallEfficiency: 0,
      activeMachines: 0,
      completedMachines: 0,
      totalRowsProcessed: 0
    },
    qualityControl: {
      inspectionStatus: "pending",
      qualityScore: null,
      inspectedBy: null
    },
    financial: {
      estimatedCost: 60600,
      actualCost: 0,
      materialCost: 0,
      laborCost: 10000,
      overheadCost: 4000,
      finalPrice: 95000,
      profitMargin: 0
    },
    delivery: {
      deliveryStatus: "pending",
      expectedDate: "2024-10-30T00:00:00Z",
      actualDate: null
    },
    branchId: "branch001"
  },
  {
    _id: "ord005",
    orderId: "ORD-BRC-001-241024-005",
    customerId: "cust001",
    customerName: "Rajesh Plastics Ltd",
    operatorId: "op001",
    operatorName: "Ramesh Patil",
    materialWeight: 450,
    materialType: "High Density Polyethylene",
    Width: 320,
    Height: 420,
    Thickness: 0.5,
    overallStatus: "in_progress",
    priority: "high",
    createdAt: "2024-10-24T11:00:00Z",
    actualStartDate: "2024-10-24T12:00:00Z",
    actualEndDate: null,
    mixMaterial: [
      { materialId: "mat001", materialName: "HDPE Plastic", plannedWeight: 300, actualUsedWeight: 185, wastageWeight: 12, costPerKg: 65, totalCost: 12025 },
      { materialId: "mat002", materialName: "LDPE Plastic", plannedWeight: 150, actualUsedWeight: 95, wastageWeight: 6, costPerKg: 58, totalCost: 5510 }
    ],
    realTimeData: {
      totalNetWeight: 280,
      totalWastage: 18,
      totalCost: 17535,
      overallEfficiency: 94,
      activeMachines: 1,
      completedMachines: 1,
      totalRowsProcessed: 28
    },
    qualityControl: {
      inspectionStatus: "in_progress",
      qualityScore: null,
      inspectedBy: null
    },
    financial: {
      estimatedCost: 26100,
      actualCost: 17535,
      materialCost: 17535,
      laborCost: 5500,
      overheadCost: 1500,
      finalPrice: 42000,
      profitMargin: 17965
    },
    delivery: {
      deliveryStatus: "pending",
      expectedDate: "2024-10-27T00:00:00Z",
      actualDate: null
    },
    branchId: "branch001"
  },
  {
    _id: "ord006",
    orderId: "ORD-BRC-001-241018-006",
    customerId: "cust002",
    customerName: "Sharma Industries",
    operatorId: "op005",
    operatorName: "Vijay Sharma",
    materialWeight: 550,
    materialType: "Polypropylene",
    Width: 310,
    Height: 410,
    Thickness: 0.55,
    overallStatus: "completed",
    priority: "normal",
    createdAt: "2024-10-18T08:30:00Z",
    actualStartDate: "2024-10-18T09:30:00Z",
    actualEndDate: "2024-10-20T17:00:00Z",
    mixMaterial: [
      { materialId: "mat003", materialName: "PP Plastic", plannedWeight: 350, actualUsedWeight: 335, wastageWeight: 15, costPerKg: 72, totalCost: 24120 },
      { materialId: "mat004", materialName: "PVC Plastic", plannedWeight: 200, actualUsedWeight: 185, wastageWeight: 15, costPerKg: 55, totalCost: 10175 }
    ],
    realTimeData: {
      totalNetWeight: 520,
      totalWastage: 30,
      totalCost: 34295,
      overallEfficiency: 94.5,
      activeMachines: 0,
      completedMachines: 3,
      totalRowsProcessed: 48
    },
    qualityControl: {
      inspectionStatus: "passed",
      qualityScore: 88,
      inspectedBy: "Inspector A"
    },
    financial: {
      estimatedCost: 33000,
      actualCost: 34295,
      materialCost: 34295,
      laborCost: 6500,
      overheadCost: 2300,
      finalPrice: 55000,
      profitMargin: 12205
    },
    delivery: {
      deliveryStatus: "delivered",
      expectedDate: "2024-10-22T00:00:00Z",
      actualDate: "2024-10-21T00:00:00Z"
    },
    branchId: "branch001"
  },
  {
    _id: "ord007",
    orderId: "ORD-BRC-001-241019-007",
    customerId: "cust003",
    customerName: "Modern Packaging Co",
    operatorId: "op007",
    operatorName: "Ravi Verma",
    materialWeight: 700,
    materialType: "High Density Polyethylene",
    Width: 360,
    Height: 460,
    Thickness: 0.65,
    overallStatus: "dispatched",
    priority: "urgent",
    createdAt: "2024-10-19T07:00:00Z",
    actualStartDate: "2024-10-19T08:00:00Z",
    actualEndDate: "2024-10-21T18:00:00Z",
    mixMaterial: [
      { materialId: "mat001", materialName: "HDPE Plastic", plannedWeight: 500, actualUsedWeight: 480, wastageWeight: 20, costPerKg: 65, totalCost: 31200 },
      { materialId: "mat002", materialName: "LDPE Plastic", plannedWeight: 200, actualUsedWeight: 185, wastageWeight: 15, costPerKg: 58, totalCost: 10730 }
    ],
    realTimeData: {
      totalNetWeight: 665,
      totalWastage: 35,
      totalCost: 41930,
      overallEfficiency: 95,
      activeMachines: 0,
      completedMachines: 3,
      totalRowsProcessed: 63
    },
    qualityControl: {
      inspectionStatus: "passed",
      qualityScore: 96,
      inspectedBy: "Inspector B"
    },
    financial: {
      estimatedCost: 40600,
      actualCost: 41930,
      materialCost: 41930,
      laborCost: 8500,
      overheadCost: 2700,
      finalPrice: 68000,
      profitMargin: 14870
    },
    delivery: {
      deliveryStatus: "shipped",
      expectedDate: "2024-10-24T00:00:00Z",
      actualDate: null
    },
    branchId: "branch001"
  },
  {
    _id: "ord008",
    orderId: "ORD-BRC-001-241025-008",
    customerId: "cust001",
    customerName: "Rajesh Plastics Ltd",
    operatorId: "op004",
    operatorName: "Prakash Singh",
    materialWeight: 650,
    materialType: "Low Density Polyethylene",
    Width: 340,
    Height: 440,
    Thickness: 0.6,
    overallStatus: "Wait for Approval",
    priority: "normal",
    createdAt: "2024-10-25T14:00:00Z",
    actualStartDate: null,
    actualEndDate: null,
    mixMaterial: [
      { materialId: "mat002", materialName: "LDPE Plastic", plannedWeight: 450, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 58, totalCost: 0 },
      { materialId: "mat003", materialName: "PP Plastic", plannedWeight: 200, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 72, totalCost: 0 }
    ],
    realTimeData: {
      totalNetWeight: 0,
      totalWastage: 0,
      totalCost: 0,
      overallEfficiency: 0,
      activeMachines: 0,
      completedMachines: 0,
      totalRowsProcessed: 0
    },
    qualityControl: {
      inspectionStatus: "pending",
      qualityScore: null,
      inspectedBy: null
    },
    financial: {
      estimatedCost: 40500,
      actualCost: 0,
      materialCost: 0,
      laborCost: 7500,
      overheadCost: 2800,
      finalPrice: 63000,
      profitMargin: 0
    },
    delivery: {
      deliveryStatus: "pending",
      expectedDate: "2024-10-29T00:00:00Z",
      actualDate: null
    },
    branchId: "branch001"
  },
  {
    _id: "ord009",
    orderId: "ORD-BRC-001-241017-009",
    customerId: "cust004",
    customerName: "Global Exports",
    operatorId: "op002",
    operatorName: "Suresh Kumar",
    materialWeight: 400,
    materialType: "Polyvinyl Chloride",
    Width: 290,
    Height: 390,
    Thickness: 0.45,
    overallStatus: "cancelled",
    priority: "low",
    createdAt: "2024-10-17T10:00:00Z",
    actualStartDate: null,
    actualEndDate: null,
    mixMaterial: [
      { materialId: "mat004", materialName: "PVC Plastic", plannedWeight: 300, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 55, totalCost: 0 },
      { materialId: "mat002", materialName: "LDPE Plastic", plannedWeight: 100, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 58, totalCost: 0 }
    ],
    realTimeData: {
      totalNetWeight: 0,
      totalWastage: 0,
      totalCost: 0,
      overallEfficiency: 0,
      activeMachines: 0,
      completedMachines: 0,
      totalRowsProcessed: 0
    },
    qualityControl: {
      inspectionStatus: "cancelled",
      qualityScore: null,
      inspectedBy: null
    },
    financial: {
      estimatedCost: 22300,
      actualCost: 0,
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      finalPrice: 0,
      profitMargin: 0
    },
    delivery: {
      deliveryStatus: "cancelled",
      expectedDate: null,
      actualDate: null
    },
    branchId: "branch001"
  },
  {
    _id: "ord010",
    orderId: "ORD-BRC-001-241026-010",
    customerId: "cust003",
    customerName: "Modern Packaging Co",
    operatorId: "op001",
    operatorName: "Ramesh Patil",
    materialWeight: 350,
    materialType: "Polypropylene",
    Width: 270,
    Height: 370,
    Thickness: 0.4,
    overallStatus: "Wait for Approval",
    priority: "low",
    createdAt: "2024-10-26T09:00:00Z",
    actualStartDate: null,
    actualEndDate: null,
    mixMaterial: [
      { materialId: "mat003", materialName: "PP Plastic", plannedWeight: 250, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 72, totalCost: 0 },
      { materialId: "mat001", materialName: "HDPE Plastic", plannedWeight: 100, actualUsedWeight: 0, wastageWeight: 0, costPerKg: 65, totalCost: 0 }
    ],
    realTimeData: {
      totalNetWeight: 0,
      totalWastage: 0,
      totalCost: 0,
      overallEfficiency: 0,
      activeMachines: 0,
      completedMachines: 0,
      totalRowsProcessed: 0
    },
    qualityControl: {
      inspectionStatus: "pending",
      qualityScore: null,
      inspectedBy: null
    },
    financial: {
      estimatedCost: 24500,
      actualCost: 0,
      materialCost: 0,
      laborCost: 4500,
      overheadCost: 1800,
      finalPrice: 38000,
      profitMargin: 0
    },
    delivery: {
      deliveryStatus: "pending",
      expectedDate: "2024-10-30T00:00:00Z",
      actualDate: null
    },
    branchId: "branch001"
  }
];

export const mockMachineTableData = [
  {
    _id: "table001",
    machineId: "mach015",
    machineName: "Extruder-E1",
    orderId: "ord001",
    status: "completed",
    totalCalculations: {
      totalNetWeight: 158,
      totalRawWeight: 167,
      totalWastage: 9,
      overallEfficiency: 94.6,
      totalRows: 15,
      totalCost: 10170
    },
    shiftInfo: {
      shiftNumber: 1,
      startTime: "2024-10-20T09:00:00Z"
    }
  },
  {
    _id: "table002",
    machineId: "mach001",
    machineName: "Print-P1",
    orderId: "ord001",
    status: "completed",
    totalCalculations: {
      totalNetWeight: 159,
      totalRawWeight: 167,
      totalWastage: 8,
      overallEfficiency: 95.2,
      totalRows: 15,
      totalCost: 10170
    },
    shiftInfo: {
      shiftNumber: 1,
      startTime: "2024-10-21T09:00:00Z"
    }
  },
  {
    _id: "table003",
    machineId: "mach005",
    machineName: "Cut-C1",
    orderId: "ord001",
    status: "completed",
    totalCalculations: {
      totalNetWeight: 158,
      totalRawWeight: 166,
      totalWastage: 8,
      overallEfficiency: 95.2,
      totalRows: 15,
      totalCost: 10170
    },
    shiftInfo: {
      shiftNumber: 1,
      startTime: "2024-10-22T09:00:00Z"
    }
  }
];

// Efficiency trends over last 30 days
export const mockEfficiencyTrends = [
  { date: "2024-09-26", efficiency: 89, orders: 3 },
  { date: "2024-09-27", efficiency: 91, orders: 4 },
  { date: "2024-09-28", efficiency: 88, orders: 2 },
  { date: "2024-09-29", efficiency: 90, orders: 3 },
  { date: "2024-09-30", efficiency: 92, orders: 5 },
  { date: "2024-10-01", efficiency: 90, orders: 4 },
  { date: "2024-10-02", efficiency: 93, orders: 4 },
  { date: "2024-10-03", efficiency: 91, orders: 3 },
  { date: "2024-10-04", efficiency: 92, orders: 5 },
  { date: "2024-10-05", efficiency: 94, orders: 4 },
  { date: "2024-10-06", efficiency: 93, orders: 3 },
  { date: "2024-10-07", efficiency: 95, orders: 6 },
  { date: "2024-10-08", efficiency: 94, orders: 5 },
  { date: "2024-10-09", efficiency: 92, orders: 4 },
  { date: "2024-10-10", efficiency: 93, orders: 5 },
  { date: "2024-10-11", efficiency: 94, orders: 4 },
  { date: "2024-10-12", efficiency: 95, orders: 6 },
  { date: "2024-10-13", efficiency: 93, orders: 5 },
  { date: "2024-10-14", efficiency: 94, orders: 4 },
  { date: "2024-10-15", efficiency: 95, orders: 5 },
  { date: "2024-10-16", efficiency: 94, orders: 4 },
  { date: "2024-10-17", efficiency: 93, orders: 3 },
  { date: "2024-10-18", efficiency: 94.5, orders: 4 },
  { date: "2024-10-19", efficiency: 95, orders: 5 },
  { date: "2024-10-20", efficiency: 95, orders: 6 },
  { date: "2024-10-21", efficiency: 93.7, orders: 4 },
  { date: "2024-10-22", efficiency: 95, orders: 5 },
  { date: "2024-10-23", efficiency: 0, orders: 1 },
  { date: "2024-10-24", efficiency: 94, orders: 5 },
  { date: "2024-10-25", efficiency: 0, orders: 0 }
];

// Production output by day
export const mockProductionOutput = [
  { date: "2024-10-18", netWeight: 520, wastage: 30 },
  { date: "2024-10-19", netWeight: 665, wastage: 35 },
  { date: "2024-10-20", netWeight: 475, wastage: 25 },
  { date: "2024-10-21", netWeight: 520, wastage: 35 },
  { date: "2024-10-22", netWeight: 570, wastage: 30 },
  { date: "2024-10-23", netWeight: 0, wastage: 0 },
  { date: "2024-10-24", netWeight: 280, wastage: 18 },
  { date: "2024-10-25", netWeight: 0, wastage: 0 }
];

// Machine utilization
export const mockMachineUtilization = [
  { machine: "Print-P1", machineType: "Printing Machine", utilization: 85, status: "active", ordersProcessed: 18 },
  { machine: "Print-P2", machineType: "Printing Machine", utilization: 78, status: "active", ordersProcessed: 15 },
  { machine: "Print-P3", machineType: "Printing Machine", utilization: 82, status: "active", ordersProcessed: 16 },
  { machine: "Print-P4", machineType: "Printing Machine", utilization: 0, status: "maintenance", ordersProcessed: 0 },
  { machine: "Cut-C1", machineType: "Cutting Machine", utilization: 88, status: "active", ordersProcessed: 22 },
  { machine: "Cut-C2", machineType: "Cutting Machine", utilization: 92, status: "active", ordersProcessed: 24 },
  { machine: "Cut-C3", machineType: "Cutting Machine", utilization: 85, status: "active", ordersProcessed: 20 },
  { machine: "Cut-C4", machineType: "Cutting Machine", utilization: 79, status: "active", ordersProcessed: 18 },
  { machine: "Cut-C5", machineType: "Cutting Machine", utilization: 86, status: "active", ordersProcessed: 21 },
  { machine: "Cut-C6", machineType: "Cutting Machine", utilization: 90, status: "active", ordersProcessed: 23 },
  { machine: "Cut-C7", machineType: "Cutting Machine", utilization: 83, status: "active", ordersProcessed: 19 },
  { machine: "Cut-C8", machineType: "Cutting Machine", utilization: 87, status: "active", ordersProcessed: 21 },
  { machine: "Cut-C9", machineType: "Cutting Machine", utilization: 0, status: "maintenance", ordersProcessed: 0 },
  { machine: "Cut-C10", machineType: "Cutting Machine", utilization: 84, status: "active", ordersProcessed: 20 },
  { machine: "Extruder-E1", machineType: "Extrusion Machine", utilization: 91, status: "active", ordersProcessed: 25 },
  { machine: "Extruder-E2", machineType: "Extrusion Machine", utilization: 89, status: "active", ordersProcessed: 23 },
  { machine: "Extruder-E3", machineType: "Extrusion Machine", utilization: 87, status: "active", ordersProcessed: 22 },
  { machine: "Extruder-E4", machineType: "Extrusion Machine", utilization: 85, status: "active", ordersProcessed: 21 },
  { machine: "Seal-S1", machineType: "Sealing Machine", utilization: 76, status: "active", ordersProcessed: 16 },
  { machine: "Seal-S2", machineType: "Sealing Machine", utilization: 72, status: "active", ordersProcessed: 14 },
  { machine: "Seal-S3", machineType: "Sealing Machine", utilization: 0, status: "maintenance", ordersProcessed: 0 },
  { machine: "Mold-M1", machineType: "Molding Machine", utilization: 80, status: "active", ordersProcessed: 17 },
  { machine: "Mold-M2", machineType: "Molding Machine", utilization: 77, status: "active", ordersProcessed: 15 }
];
