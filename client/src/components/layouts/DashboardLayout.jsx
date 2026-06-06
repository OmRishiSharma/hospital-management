import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useBranding } from '../../context/BrandingContext';
import {
    FiHome, FiUsers, FiCalendar, FiActivity, FiPackage,
    FiSettings, FiLogOut, FiPieChart, FiClipboard,
    FiFileText, FiPlusSquare, FiDatabase, FiGrid, FiShield,
    FiChevronDown, FiChevronRight, FiAlertCircle, FiUser
} from 'react-icons/fi';
import './DashboardLayout.css';

const DashboardSidebar = ({ isOpen, setOpen }) => {
    const { user } = useAuth();
    const { branding, hospitalName } = useBranding();
    const role = (user?.role || '').toLowerCase();

    // Toggle states for Collapsible sidebar groups
    const [openGroups, setOpenGroups] = useState({
        'Hospital Operations': true,
        'Human Resources': true,
        'Clinical Services': true,
        'Financial Management': true,
        'Resources': true,
        'Insights': true,
        'Administration': true
    });

    const toggleGroup = (groupName) => {
        setOpenGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };
    
    // Categorized Menus
    const getMenu = () => {
        if (role === 'centraladmin' || role === 'superadmin') {
            return [
                { label: 'System Overview', path: '/supremeadmin', icon: <FiPieChart /> },
                { label: 'Question Library', path: '/admin/question-library', icon: <FiFileText /> },
                { label: 'Role & Permissions', path: '/admin/roles', icon: <FiShield /> },
                { label: 'Manage All Staff', path: '/admin/users', icon: <FiUsers /> },
            ];
        }
        if (role === 'hospitaladmin') {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            if (u.clinicType === 'clinic') {
                // Simple clinic — single hub page with built-in role switcher
                return [
                    { label: 'Clinic Hub', path: '/hospitaladmin', icon: <FiHome /> },
                ];
            }
            return [
                { label: 'Hospital Overview', path: '/hospitaladmin', icon: <FiPieChart /> },
                { label: 'Clinical Questions', path: '/hospitaladmin/question-library', icon: <FiFileText /> },
                { label: 'Staff Management', path: '/admin/users', icon: <FiUsers /> },
                { label: 'Doctors Feed', path: '/admin/doctors', icon: <FiActivity /> },
                { label: 'Pharma Inventory', path: '/pharmacy/inventory', icon: <FiPackage /> },
            ];
        }
        if (role === 'doctor') {
            return [
                { label: 'My Patients', path: '/doctor/dashboard', icon: <FiUsers /> },
                { label: 'Appointments', path: '/doctor/patients', icon: <FiCalendar /> },
                { label: 'All Cases', path: '/doctor/cases', icon: <FiClipboard /> },
            ];
        }
        if (role === 'reception' || role === 'receptionist') {
            return [
                { label: 'Reception Dashboard', path: '/reception/dashboard', icon: <FiHome /> },
                { label: 'Appointments/Booking', path: '/appointment', icon: <FiPlusSquare /> },
            ];
        }
        if (role === 'lab' || role === 'lab technician') {
            return [
                { label: 'Dashboard', path: '/lab/dashboard', icon: <FiGrid /> },
                { label: 'Lab Orders', path: '/lab/orders', icon: <FiClipboard /> },
                { label: 'Sample Collection', path: '/lab/sample-collection', icon: <FiPlusSquare /> },
                { label: 'Test Processing', path: '/lab/processing', icon: <FiActivity /> },
                { label: 'Reports', path: '/lab/completed', icon: <FiFileText /> },
            ];
        }
        if (role === 'pharmacy' || role === 'pharmacist') {
            return [
                { label: 'Inventory', path: '/pharmacy/inventory', icon: <FiPackage /> },
                { label: 'Pharmacy Orders', path: '/pharmacy/orders', icon: <FiClipboard /> },
            ];
        }

        if (['cashier', 'billing', 'billing executive', 'billing manager', 'senior billing officer'].includes(role)) {
            return [
                { label: 'Billing Dashboard', path: '/billing/dashboard', icon: <FiPieChart /> },
                { label: 'Patient Billing', path: '/billing/patient', icon: <FiUsers /> },
                { label: 'Pending Payments', path: '/billing/pending', icon: <FiClipboard /> },
                { label: 'Invoices', path: '/billing/invoices', icon: <FiFileText /> },
                { label: 'Payment Collection', path: '/billing/collect', icon: <FiPlusSquare /> },
                { label: 'Payment History', path: '/billing/history', icon: <FiDatabase /> },
                { label: 'Refunds', path: '/billing/log-out' /* FiLogOut */, icon: <FiLogOut /> },
                { label: 'Revenue Reports', path: '/billing/reports', icon: <FiGrid /> },
                { label: 'Billing Analytics', path: '/billing/analytics', icon: <FiPieChart /> },
                { label: 'Invoice Templates', path: '/billing/templates', icon: <FiClipboard /> },
                { label: 'Settings', path: '/billing/settings', icon: <FiSettings /> },
            ];
        }
        if (role === 'nurse') {
            return [
                { label: 'Patient Queue', path: '/doctor/patients', icon: <FiUsers /> },
                { label: 'Appointments', path: '/appointment', icon: <FiCalendar /> },
            ];
        }
        if (role === 'administrator' || role === 'accountant') {
            return [
                {
                    category: '',
                    items: [
                        { label: 'Dashboard', path: '/administrator/dashboard', icon: <FiHome /> }
                    ]
                },
                {
                    category: 'Hospital Operations',
                    items: [
                        { label: 'Patient Flow', path: '/administrator/patient-flow', icon: <FiUsers /> },
                        { label: 'Admissions', path: '/administrator/admissions', icon: <FiPlusSquare /> },
                        { label: 'Bed Management', path: '/administrator/beds', icon: <FiDatabase /> },
                        { label: 'Appointments', path: '/administrator/appointments', icon: <FiCalendar /> },
                        { label: 'Hospital Operations Center', path: '/administrator/operations', icon: <FiActivity /> }
                    ]
                },
                {
                    category: 'Human Resources',
                    items: [
                        { label: 'Staff Management', path: '/administrator/staff', icon: <FiUsers /> },
                        { label: 'Doctor Management', path: '/administrator/doctors', icon: <FiActivity /> },
                        { label: 'Departments', path: '/administrator/departments', icon: <FiGrid /> },
                        { label: 'Roles & Permissions', path: '/administrator/roles', icon: <FiShield /> }
                    ]
                },
                {
                    category: 'Clinical Services',
                    items: [
                        { label: 'Laboratory Management', path: '/administrator/lab', icon: <FiGrid /> },
                        { label: 'Pharmacy Management', path: '/administrator/pharmacy', icon: <FiPackage /> }
                    ]
                },
                {
                    category: 'Financial Management',
                    items: [
                        { label: 'Billing Oversight', path: '/administrator/billing', icon: <FiFileText /> },
                        { label: 'Revenue Monitoring', path: '/administrator/revenue', icon: <FiPieChart /> }
                    ]
                },
                {
                    category: 'Resources',
                    items: [
                        { label: 'Inventory Monitoring', path: '/administrator/inventory', icon: <FiPackage /> },
                        { label: 'Resource Management', path: '/administrator/resources', icon: <FiSettings /> }
                    ]
                },
                {
                    category: 'Insights',
                    items: [
                        { label: 'Reports', path: '/administrator/reports', icon: <FiFileText /> },
                        { label: 'Analytics', path: '/administrator/analytics', icon: <FiPieChart /> },
                        { label: 'Audit Logs', path: '/administrator/audit-logs', icon: <FiClipboard /> }
                    ]
                },
                {
                    category: 'Administration',
                    items: [
                        { label: 'Notifications', path: '/administrator/notifications', icon: <FiAlertCircle /> },
                        { label: 'Settings', path: '/administrator/settings', icon: <FiSettings /> },
                        { label: 'Profile Settings', path: '/administrator/profile-settings', icon: <FiUser /> }
                    ]
                }
            ];
        }
        return [
            { label: 'My Dashboard', path: '/my-dashboard', icon: <FiHome /> },
        ];
    };

    const menuItems = getMenu();

    return (
        <aside className={`erp-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-brand">
                {branding.logoUrl ? (
                    <img
                        src={branding.logoUrl}
                        alt={hospitalName}
                        style={{ height: '32px', maxWidth: '120px', objectFit: 'contain', borderRadius: '4px' }}
                    />
                ) : (
                    <>
                        <div className="brand-dot" />
                        <span>{hospitalName !== 'Medical HMS' ? hospitalName : 'Medical HMS'}</span>
                    </>
                )}
            </div>
            
            <nav className="sidebar-nav">
                {role === 'administrator' || role === 'accountant' ? (
                    menuItems.map((group, gIdx) => {
                        const hasHeader = !!group.category;
                        const isExpanded = openGroups[group.category] ?? true;

                        return (
                            <div key={gIdx} className={`sidebar-group-wrap ${hasHeader ? 'has-header' : 'no-header'}`}>
                                {hasHeader && isOpen && (
                                    <div 
                                        className="sidebar-category-header" 
                                        onClick={() => toggleGroup(group.category)}
                                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span>{group.category}</span>
                                        <span className="caret-icon">
                                            {isExpanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
                                        </span>
                                    </div>
                                )}
                                {(!hasHeader || !isOpen || isExpanded) && (
                                    <div className="sidebar-group-links">
                                        {group.items.map((item, idx) => (
                                            <NavLink 
                                                key={idx} 
                                                to={item.path} 
                                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                                title={!isOpen ? item.label : undefined}
                                            >
                                                <span className="sidebar-link-icon">{item.icon}</span>
                                                <span className="sidebar-link-text">{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    menuItems.map((item, idx) => (
                        <NavLink 
                            key={idx} 
                            to={item.path} 
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            <span className="sidebar-link-text">{item.label}</span>
                        </NavLink>
                    ))
                )}
            </nav>

            <div className="sidebar-footer">
                <NavLink 
                    to="/profile"
                    className={({ isActive }) => `sidebar-link settings-item ${isActive ? 'active' : ''}`}
                >
                    <span className="sidebar-link-icon"><FiSettings /></span>
                    <span className="sidebar-link-text">Profile Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

const TopBar = ({ toggleSidebar, sidebarOpen }) => {
    const { user } = useAuth();
    const { branding, hospitalName } = useBranding();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Helper to get initials
    const getInitials = (name) => {
        return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <header className="erp-topbar">
            <div className="topbar-left">
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <div className={`hamburger ${sidebarOpen ? 'active' : ''}`}>
                        <span />
                        <span />
                        <span />
                    </div>
                </button>
                {branding.logoUrl && (
                    <img
                        src={branding.logoUrl}
                        alt={hospitalName}
                        style={{ height: '28px', maxWidth: '100px', objectFit: 'contain', borderRadius: '3px', marginRight: '8px' }}
                    />
                )}
                <div className="breadcrumb-wrap">
                    <span className="curr-page-name">
                        {location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}
                    </span>
                    <span className="path-slash">/</span>
                    <span className="path-user-role">{user?.role}</span>
                </div>
            </div>

            <div className="topbar-right">
                <div className="user-profile-widget">
                    <div className="profile-text-info">
                        <span className="user-disp-name">{user?.role === 'doctor' ? 'DR. ' : ''}{user?.name || 'User'}</span>
                        <span className="user-disp-role">{user?.email}</span>
                    </div>
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                            {user?.avatar
                                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                : getInitials(user?.name)
                            }
                        </div>
                        <div className="online-indicator" />
                        
                        <div className="profile-dropdown-content">
                            <div className="p-header">
                                <strong>{user?.name}</strong>
                                <span>{user?.email}</span>
                                <span className="p-role-badge">{user?.role}</span>
                            </div>
                             <div className="p-body">
                                 <Link to="/profile" className="p-item" style={{ textDecoration: 'none', color: 'inherit' }}><FiUsers size={14} /> My Profile</Link>
                                 <Link to="/profile" className="p-item" style={{ textDecoration: 'none', color: 'inherit' }}><FiSettings size={14} /> Account Settings</Link>
                             </div>
                            <div className="p-footer">
                                <button onClick={handleLogout} className="btn-p-logout">
                                    <FiLogOut size={14} /> Logout Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="erp-layout">
            <DashboardSidebar isOpen={sidebarOpen} />
            <div className={`erp-main-area ${sidebarOpen ? 'shifted' : 'full'}`}>
                <TopBar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="erp-page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
