import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, User, Users, Shield, Briefcase } from 'lucide-react';
import './PersonSelector.css';

interface Person {
  _id: string;
  role: 'master_admin' | 'admin' | 'manager' | 'employee';
  roleName: string;
  username: string;
  email: string;
  fullName?: string;
  designation?: string;
  branchName: string;
}

interface PersonSelectorProps {
  onSelect: (person: Person) => void;
  selectedPerson?: Person | null;
  excludeRoles?: string[];
}

const PersonSelector: React.FC<PersonSelectorProps> = ({
  onSelect,
  selectedPerson,
  excludeRoles = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_27INFINITY_IN;

  // Fetch people when component mounts or role filter changes
  useEffect(() => {
    fetchPeople();
  }, [selectedRole]);

  const fetchPeople = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const selectedBranch = localStorage.getItem('selectedBranch');

      const params = new URLSearchParams();
      if (selectedRole !== 'all') {
        params.append('role', selectedRole);
      }

      const response = await fetch(
        `${API_URL}/v2/orders/forward/people?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-selected-branch': selectedBranch || '',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }

      const data = await response.json();
      setPeople(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load people');
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'master_admin':
        return <Shield size={16} />;
      case 'admin':
        return <Users size={16} />;
      case 'manager':
        return <Briefcase size={16} />;
      case 'employee':
        return <User size={16} />;
      default:
        return <User size={16} />;
    }
  };

  // Get color for role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'master_admin':
        return 'role-master-admin';
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      case 'employee':
        return 'role-employee';
      default:
        return 'role-default';
    }
  };

  // Filter people based on search query and excluded roles
  const filteredPeople = people.filter(person => {
    // Exclude roles
    if (excludeRoles.includes(person.role)) {
      return false;
    }

    // Search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.fullName?.toLowerCase().includes(query) ||
      person.username?.toLowerCase().includes(query) ||
      person.email?.toLowerCase().includes(query) ||
      person.designation?.toLowerCase().includes(query) ||
      person.roleName?.toLowerCase().includes(query)
    );
  });

  // Available roles (filtered)
  const roles = [
    { value: 'all', label: 'All Roles', icon: <Users size={18} /> },
    { value: 'master_admin', label: 'Master Admin', icon: <Shield size={18} /> },
    { value: 'admin', label: 'Admin', icon: <Users size={18} /> },
    { value: 'manager', label: 'Manager', icon: <Briefcase size={18} /> },
    { value: 'employee', label: 'Employee', icon: <User size={18} /> }
  ].filter(r => r.value === 'all' || !excludeRoles.includes(r.value));

  return (
    <div className="person-selector">
      <div className="person-selector-header">
        <h3>Select Person to Forward To</h3>
        <p className="text-muted">Choose a person from your organization</p>
      </div>

      {/* Search and Filter */}
      <div className="person-selector-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="role-filter">
          {roles.map(role => (
            <button
              key={role.value}
              className={`role-filter-btn ${selectedRole === role.value ? 'active' : ''}`}
              onClick={() => setSelectedRole(role.value)}
            >
              {role.icon}
              <span>{role.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* People List */}
      <div className="people-list">
        {loading && (
          <div className="people-loading">
            <div className="spinner"></div>
            <p>Loading people...</p>
          </div>
        )}

        {error && (
          <div className="people-error">
            <p>{error}</p>
            <button onClick={fetchPeople} className="btn-retry">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredPeople.length === 0 && (
          <div className="people-empty">
            <User size={48} />
            <p>No people found</p>
            <span>Try adjusting your filters</span>
          </div>
        )}

        {!loading && !error && filteredPeople.map(person => (
          <div
            key={person._id}
            className={`person-card ${selectedPerson?._id === person._id ? 'selected' : ''}`}
            onClick={() => onSelect(person)}
          >
            <div className="person-avatar">
              {getRoleIcon(person.role)}
            </div>

            <div className="person-info">
              <div className="person-name">
                {person.fullName || person.username}
              </div>
              <div className="person-email">{person.email}</div>
              {person.designation && (
                <div className="person-designation">{person.designation}</div>
              )}
            </div>

            <div className="person-meta">
              <span className={`role-badge ${getRoleColor(person.role)}`}>
                {person.roleName}
              </span>
              <span className="branch-badge">{person.branchName}</span>
            </div>

            {selectedPerson?._id === person._id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Person Summary */}
      {selectedPerson && (
        <div className="selected-person-summary">
          <div className="summary-icon">
            {getRoleIcon(selectedPerson.role)}
          </div>
          <div className="summary-info">
            <strong>Selected:</strong> {selectedPerson.fullName || selectedPerson.username}
            <span className={`role-badge ${getRoleColor(selectedPerson.role)}`}>
              {selectedPerson.roleName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonSelector;
