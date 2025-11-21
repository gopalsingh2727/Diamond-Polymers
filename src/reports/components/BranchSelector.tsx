/**
 * Branch Selector Component
 * Pure CSS - NO TAILWIND - NO SHADCN
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loadBranches, changeBranch } from '../redux/branches/branchActions';
import {
  selectBranches,
  selectSelectedBranchId,
  selectBranchLoading,
  selectActiveBranches,
  selectRegions,
} from '../redux/branches/branchSelectors';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './pure';
import { Building2, MapPin } from 'lucide-react';

interface BranchSelectorProps {
  showAllOption?: boolean;
  activeOnly?: boolean;
  onBranchChange?: (branchId: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BranchSelector({
  showAllOption = true,
  activeOnly = true,
  onBranchChange,
  className = '',
  size = 'md',
}: BranchSelectorProps) {
  const dispatch = useAppDispatch();
  const allBranches = useAppSelector(selectBranches);
  const activeBranches = useAppSelector(selectActiveBranches);
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const loading = useAppSelector(selectBranchLoading);

  const branches = activeOnly ? activeBranches : allBranches;

  useEffect(() => {
    if (branches.length === 0) {
      dispatch(loadBranches());
    }
  }, [dispatch, branches.length]);

  const handleBranchChange = (value: string) => {
    const branchId = value === 'all' ? null : value;
    dispatch(changeBranch(branchId));
    onBranchChange?.(branchId);
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const displayValue = selectedBranchId ? selectedBranchId : 'all';

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
                <span className="font-medium">{selectedBranch.code}</span>
                <span className="text-slate-600">-</span>
                <span>{selectedBranch.name}</span>
              </span>
            ) : (
              "All Branches"
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Building2 style={{ width: '1rem', height: '1rem' }} />
              <span className="font-medium">All Branches</span>
            </div>
          </SelectItem>
        )}
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Building2 style={{ width: '1rem', height: '1rem', color: '#FF6B35' }} />
                <span className="font-medium">{branch.code}</span>
                <span className="text-slate-600">-</span>
                <span>{branch.name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-secondary mt-1">
                <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>{branch.location}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Compact Branch Selector (for toolbars)
 */
export function CompactBranchSelector({
  showAllOption = true,
  onBranchChange,
  className = '',
}: Omit<BranchSelectorProps, 'activeOnly' | 'size'>) {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectActiveBranches);
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const loading = useAppSelector(selectBranchLoading);

  useEffect(() => {
    if (branches.length === 0) {
      dispatch(loadBranches());
    }
  }, [dispatch, branches.length]);

  const handleBranchChange = (value: string) => {
    const branchId = value === 'all' ? null : value;
    dispatch(changeBranch(branchId));
    onBranchChange?.(branchId);
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const displayValue = selectedBranchId ? selectedBranchId : 'all';

  return (
    <Select value={displayValue} onValueChange={handleBranchChange} disabled={loading}>
      <SelectTrigger className={`w-200px ${className}`}>
        <SelectValue>
          {loading ? "Loading..." : selectedBranch ? selectedBranch.code : "All Branches"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <span className="font-medium">All Branches</span>
          </SelectItem>
        )}
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            <span>{branch.code} - {branch.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Branch Selector with Region Grouping
 */
export function RegionBranchSelector({
  showAllOption = true,
  onBranchChange,
  className = '',
}: Omit<BranchSelectorProps, 'activeOnly' | 'size'>) {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectActiveBranches);
  const regions = useAppSelector(selectRegions);
  const selectedBranchId = useAppSelector(selectSelectedBranchId);
  const loading = useAppSelector(selectBranchLoading);

  useEffect(() => {
    if (branches.length === 0) {
      dispatch(loadBranches());
    }
  }, [dispatch, branches.length]);

  const handleBranchChange = (value: string) => {
    const branchId = value === 'all' ? null : value;
    dispatch(changeBranch(branchId));
    onBranchChange?.(branchId);
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const displayValue = selectedBranchId ? selectedBranchId : 'all';

  const branchesByRegion = regions.reduce((acc, region) => {
    acc[region] = branches.filter(b => b.region === region);
    return acc;
  }, {} as Record<string, typeof branches>);

  return (
    <Select value={displayValue} onValueChange={handleBranchChange} disabled={loading}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Building2 style={{ width: '1rem', height: '1rem' }} />
          <SelectValue>
            {loading ? "Loading..." : selectedBranch ? `${selectedBranch.code} - ${selectedBranch.name}` : "All Branches"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <span className="font-medium">All Branches</span>
          </SelectItem>
        )}
        {regions.map((region) => (
          <div key={region}>
            <div style={{
              padding: '0.375rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-slate-600)',
              backgroundColor: 'var(--color-slate-50)'
            }}>
              {region} Region
            </div>
            {branchesByRegion[region]?.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                <div className="flex items-center gap-2 pl-2">
                  <Building2 style={{ width: '0.875rem', height: '0.875rem', color: '#FF6B35' }} />
                  <span>{branch.code} - {branch.name}</span>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
