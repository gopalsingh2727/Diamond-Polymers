export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function isDateInRange(dateString: string, range: DateRange): boolean {
  if (!range.from || !range.to) return true;
  
  const date = new Date(dateString);
  const from = new Date(range.from);
  const to = new Date(range.to);
  
  // Set time to start of day for from date
  from.setHours(0, 0, 0, 0);
  // Set time to end of day for to date
  to.setHours(23, 59, 59, 999);
  
  return date >= from && date <= to;
}

export function filterOrdersByDateRange(orders: any[], range: DateRange): any[] {
  if (!range.from || !range.to) return orders;
  
  return orders.filter(order => {
    // Check createdAt date
    if (order.createdAt && isDateInRange(order.createdAt, range)) {
      return true;
    }
    
    // Also check actualStartDate if available
    if (order.actualStartDate && isDateInRange(order.actualStartDate, range)) {
      return true;
    }
    
    return false;
  });
}

export function getDefaultDateRange(): DateRange {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
  
  return {
    from: thirtyDaysAgo,
    to: today
  };
}
