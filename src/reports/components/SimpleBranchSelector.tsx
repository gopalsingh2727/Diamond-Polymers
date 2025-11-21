/**
 * Simple Branch Selector for Reports
 * Uses main app Redux store (not separate reports store)
 * Only shows "All Branches" option to admins
 */

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../../store";
import { setSelectedBranchInAuth } from "../../../../redux/login/authActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./pure";
import { Building2, MapPin } from "lucide-react";

interface SimpleBranchSelectorProps {
  showAllOption?: boolean;
  className?: string;
}

export function SimpleBranchSelector({
  showAllOption = true,
  className = '',
}: SimpleBranchSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Get auth and branches from main store
  const { userData } = useSelector((state: RootState) => state.auth);
  const branchesState = useSelector((state: RootState) => state.branches);
  const branchList = useSelector((state: RootState) => state.branchList);

  const isAdmin = userData?.role === 'admin';
  const isManager = userData?.role === 'manager';

  // Get branches array - could be in branches or branchList state
  const branches = branchesState?.branches || branchList?.branches || [];
  const loading = branchesState?.loading || branchList?.loading || false;

  // Get selected branch ID from multiple sources
  const selectedBranchId = userData?.selectedBranch?._id
    || userData?.selectedBranch
    || localStorage.getItem("selectedBranch");

  // Find the selected branch - try multiple ID fields
  const selectedBranch = branches?.find((b: any) =>
    b._id === selectedBranchId
    || b.id === selectedBranchId
    || b.branchId === selectedBranchId
  );

  console.log('SimpleBranchSelector Debug:', {
    userData,
    selectedBranchId,
    branches,
    selectedBranch,
    isManager,
    isAdmin
  });

  const handleBranchChange = (value: string) => {
    if (value === 'all') {
      // Only admins can select "all"
      if (isAdmin) {
        localStorage.setItem("selectedBranch", "all");
        dispatch(setSelectedBranchInAuth("all"));
      }
    } else {
      localStorage.setItem("selectedBranch", value);
      dispatch(setSelectedBranchInAuth(value));
    }
  };

  // Managers can't change branch (use their assigned branch)
  if (isManager) {
    // For managers, show their branch info
    const managerBranchName = selectedBranch?.name
      || branches?.[0]?.name
      || 'Loading branch...';

    const managerBranchLocation = selectedBranch?.location
      || branches?.[0]?.location;

    return (
      <div className={`branch-selector-readonly ${className}`} style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--color-slate-100)',
        borderRadius: '0.375rem',
        border: '1px solid var(--color-slate-300)'
      }}>
        <div className="flex items-center gap-2">
          <Building2 style={{ width: '1rem', height: '1rem', color: 'var(--color-slate-600)' }} />
          <div className="flex flex-col">
            <span className="font-medium">{managerBranchName}</span>
            {managerBranchLocation && (
              <span className="text-xs text-slate-500">{managerBranchLocation}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admins can select branches
  const displayValue = selectedBranchId === "all" || !selectedBranchId ? 'all' : selectedBranchId;

  return (
    <Select value={displayValue} onValueChange={handleBranchChange} disabled={loading}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Building2 style={{ width: '1rem', height: '1rem', color: 'var(--color-slate-600)' }} />
          <SelectValue placeholder={loading ? "Loading branches..." : "Select Branch"}>
            {loading ? (
              "Loading..."
            ) : selectedBranch ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{(selectedBranch as any).code || (selectedBranch as any).name}</span>
                {(selectedBranch as any).code && (
                  <>
                    <span className="text-slate-600">-</span>
                    <span>{(selectedBranch as any).name}</span>
                  </>
                )}
              </span>
            ) : (
              "All Branches"
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && isAdmin && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Building2 style={{ width: '1rem', height: '1rem' }} />
              <span className="font-medium">All Branches</span>
              <span className="text-xs text-slate-500">(Admin only)</span>
            </div>
          </SelectItem>
        )}
        {branches?.map((branch: any) => (
          <SelectItem key={branch._id || branch.id} value={branch._id || branch.id}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Building2 style={{ width: '1rem', height: '1rem', color: '#FF6B35' }} />
                <span className="font-medium">{branch.code || branch.name}</span>
                {branch.code && (
                  <>
                    <span className="text-slate-600">-</span>
                    <span>{branch.name}</span>
                  </>
                )}
              </div>
              {branch.location && (
                <div className="flex items-center gap-1 text-xs text-secondary mt-1">
                  <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                  <span>{branch.location}</span>
                </div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
