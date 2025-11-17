import React, { useState } from 'react';
import { EditTableExample } from '../../../../components/examples/EditTableExample';
import { AnimationsShowcase } from '../../../../components/examples/AnimationsShowcase';
import { CRUDExample } from '../../../../components/examples/CRUDExample';

/**
 * Examples Page - View all component examples
 * This page lets you see:
 * 1. EditTable Example - Unified table with search, sort, pagination
 * 2. Animations Showcase - All available animations
 * 3. CRUD Example - Save/Update/Delete with animations
 */
export const ExamplesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edittable' | 'animations' | 'crud'>('edittable');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
          Component Examples
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          View all the new components and features
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #e2e8f0',
        padding: '0 2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('edittable')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'edittable' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'edittable' ? '#667eea' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'all 0.2s'
            }}
          >
            📊 EditTable Example
          </button>
          <button
            onClick={() => setActiveTab('animations')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'animations' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'animations' ? '#667eea' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'all 0.2s'
            }}
          >
            🎨 Animations Showcase
          </button>
          <button
            onClick={() => setActiveTab('crud')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'crud' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'crud' ? '#667eea' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'all 0.2s'
            }}
          >
            💾 CRUD Example
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '2rem' }}>
        {/* EditTable Example */}
        {activeTab === 'edittable' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                EditTable Component
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                Unified table component with search, sort, pagination, and CRUD operations built-in.
                This replaces all custom table CSS in edit sections!
              </p>
            </div>
            <EditTableExample />
          </div>
        )}

        {/* Animations Showcase */}
        {activeTab === 'animations' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                Animations Showcase
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                All available CSS animations. Click buttons to see different animation effects.
              </p>
            </div>
            <AnimationsShowcase />
          </div>
        )}

        {/* CRUD Example */}
        {activeTab === 'crud' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                CRUD Operations Example
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                Demonstration of save/update/delete operations with ActionButton, Toast notifications,
                and Confirm dialogs.
              </p>
            </div>
            <CRUDExample />
          </div>
        )}
      </div>

      {/* Footer with Documentation Links */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        marginTop: '3rem',
        borderTop: '2px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
          📚 Documentation
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: '#f8f9fc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 600 }}>
              EDIT_TABLE_GUIDE.md
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              Complete guide for using EditTable component in all edit sections
            </p>
          </div>
          <div style={{
            backgroundColor: '#f8f9fc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 600 }}>
              CRUD_SYSTEM_GUIDE.md
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              How to use ActionButton, Toast, and ConfirmDialog components
            </p>
          </div>
          <div style={{
            backgroundColor: '#f8f9fc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 600 }}>
              CACHING_SYSTEM_GUIDE.md
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              How to prevent repeated API calls with useOrderFormData hook
            </p>
          </div>
          <div style={{
            backgroundColor: '#f8f9fc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 600 }}>
              QUICK_START.md
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              Quick reference for all systems in 3 steps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamplesPage;
