import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store';
import './OrdersRoleSideMenu.css';

// Icons
const AllOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

const MyOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const TeamOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const BranchOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
  </svg>
);

const CompanyOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 15H9v-2h2v2zm0-4H9V8h2v5zm2 0h-2V8h2v5zm2 4h-2v-2h2v2z"/>
  </svg>
);

const SharedOrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
  </svg>
);

interface OrdersRoleSideMenuProps {
  activeView: string;
  onViewChange: (view: string) => void;
  orderCounts: {
    myOrders: number;
    teamOrders: number;
    branchOrders: number;
    allBranchOrders: number;
    companyOrders: number;
    sharedOrders: number;
  };
}

const OrdersRoleSideMenu: React.FC<OrdersRoleSideMenuProps> = ({
  activeView,
  onViewChange,
  orderCounts
}) => {
  const userData = useSelector((state: RootState) => state.auth?.userData);
  const userRole = userData?.role || 'employee';

  // Determine which menu items to show based on role
  const getMenuItems = () => {
    const items = [];

    // All roles see their own orders
    items.push({
      id: 'myOrders',
      label: 'My Orders',
      icon: <MyOrdersIcon />,
      count: orderCounts.myOrders,
      description: 'Orders assigned to me'
    });

    // Manager and above see team orders
    if (['manager', 'admin', 'master_admin'].includes(userRole)) {
      items.push({
        id: 'teamOrders',
        label: 'Team Orders',
        icon: <TeamOrdersIcon />,
        count: orderCounts.teamOrders,
        description: 'Orders from my team members'
      });
    }

    // Manager and above see branch orders
    if (['manager', 'admin', 'master_admin'].includes(userRole)) {
      items.push({
        id: 'branchOrders',
        label: 'Branch Orders',
        icon: <BranchOrdersIcon />,
        count: orderCounts.branchOrders,
        description: 'All orders in my branch'
      });
    }

    // Admin and master_admin see all branches
    if (['admin', 'master_admin'].includes(userRole)) {
      items.push({
        id: 'allBranchOrders',
        label: 'All Branches',
        icon: <AllOrdersIcon />,
        count: orderCounts.allBranchOrders,
        description: 'Orders from all my branches'
      });
    }

    // Master admin sees all company orders
    if (userRole === 'master_admin') {
      items.push({
        id: 'companyOrders',
        label: 'All Company Orders',
        icon: <CompanyOrdersIcon />,
        count: orderCounts.companyOrders,
        description: 'All orders in the company'
      });
    }

    // All roles see shared orders (person-to-person forwarding)
    items.push({
      id: 'sharedOrders',
      label: 'Shared Orders',
      icon: <SharedOrdersIcon />,
      count: orderCounts.sharedOrders,
      description: 'Orders shared with me'
    });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="orders-role-side-menu">
      <div className="role-menu-header">
        <h3>Order Views</h3>
        <span className="role-badge">{userRole.replace('_', ' ')}</span>
      </div>

      <div className="role-menu-items">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`role-menu-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={item.description}
          >
            <div className="menu-item-icon">{item.icon}</div>
            <div className="menu-item-content">
              <div className="menu-item-label">{item.label}</div>
              <div className="menu-item-description">{item.description}</div>
            </div>
            <div className="menu-item-count">{item.count}</div>
          </button>
        ))}
      </div>

      <div className="role-menu-footer">
        <div className="role-capabilities">
          <h4>Your Capabilities</h4>
          <ul>
            <li>✓ View orders based on your role</li>
            <li>✓ Share orders person-to-person</li>
            {['manager', 'admin', 'master_admin'].includes(userRole) && (
              <li>✓ Cancel orders</li>
            )}
            {['admin', 'master_admin'].includes(userRole) && (
              <li>✓ Cross-branch visibility</li>
            )}
            {userRole === 'master_admin' && (
              <li>✓ Full company access</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrdersRoleSideMenu;
