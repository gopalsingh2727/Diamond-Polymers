// import { useState, useEffect, useRef } from "react";
// import  '@/componest/allCompones/list.css'
// import BackButton, { handleKeyNavigation } from "@/componest/allCompones/BackButton";
// const ORDERS = [
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },{
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },{
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD001",
//     name: "Amit Sharma",
//     machine: "Product Cutting - Machine 2",
//     status: "In Progress",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD002",
//     name: "Rita Patel",
//     machine: "Product Printing - Machine 1",
//     status: "Completed",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },
//   {
//     id: "ORD003",
//     name: "Sanjay Kumar",
//     machine: "Product Creating - Machine 3",
//     status: "Pending",
//     AllStatus: {
//       "In Progress": {
//         color: "blue",
//         icon: "🔄",
//         description: "The order is currently being processed.",
//       },
//       Completed: {
//         color: "green",
//         icon: "✅",
//         description: "The order has been completed successfully.",
//       },
//       Pending: {
//         color: "orange",
//         icon: "⏳",
//         description: "The order is pending and awaiting action.",
//       },
//     },
//   },

// ];

// export default function DayBook() {
//   const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
//   const [expandedOrder, setExpandedOrder] = useState(null);
//   const ordersRef = useRef([]);
//   const containerRef = useRef();

//   const handleKeyNavigation = (e) => {
//     switch (e.key) {
//       case "ArrowDown":
//         e.preventDefault();
//         setSelectedOrderIndex(prev => (prev + 1) % ORDERS.length);
//         break;
//       case "ArrowUp":
//         e.preventDefault();
//         setSelectedOrderIndex(prev => (prev - 1 + ORDERS.length) % ORDERS.length);
//         break;
//       case "Enter":
//         if (e.shiftKey) {
//           setExpandedOrder(prev => prev === selectedOrderIndex ? null : selectedOrderIndex);
//         }
//         break;
//     }
//   };

//   useEffect(() => {
//     const selectedOrder = ordersRef.current[selectedOrderIndex];
//     if (selectedOrder) {
//       selectedOrder.scrollIntoView({
//         behavior: "smooth",
//         block: "nearest",
//         inline: "start"
//       });
//     }
//   }, [selectedOrderIndex]);

//   return (
//     <div className="daybook-container" ref={containerRef}>
//       <BackButton > 
//         <h3 className="page-title">Orders Daybook</h3>
//       </BackButton>
      
//         <div className="orders-header">
//           <span>Order ID</span>
//           <span>Customer</span>
//           <span>Machine</span>
//           <span>Status</span>
//         </div>
//       <div 
//         className="orders-scroll-wrapper"
//         tabIndex="0"
//         onKeyDown={handleKeyNavigation}
//       >
      

//         {ORDERS.map((order, index) => (
//           <div key={order.id}>
//             <div
//               ref={el => ordersRef.current[index] = el}
//               className={`order-item ${selectedOrderIndex === index ? 'selected' : ''}`}
//               onClick={() => setSelectedOrderIndex(index)}
//               role="button"
//               aria-expanded={expandedOrder === index}
//             >
//               <span>{order.id}</span>
//               <span>{order.name}</span>
//               <span>{order.machine}</span>
//               <span>{order.status}</span>
//             </div>

//             {expandedOrder === index && (
//               <div className="status-list" role="region">
//                 {Object.entries(order.AllStatus).map(([status, { color, icon, description }]) => (
//                   <div 
//                     key={status}
//                     className="status-item"
//                     style={{ backgroundColor: color, color: 'white' }}
//                   >
//                     <span>{icon}</span>
//                     <strong>{status}:</strong>
//                     <span>{description}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }