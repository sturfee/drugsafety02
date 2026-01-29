import React from 'react';

const OutputPanel = () => {
    return (
        <div className="output-panel" style={{
            height: '100%',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            {/* Placeholder for future response stream */}
            <div style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>
                Apply a rule to generate analysis...
            </div>
        </div>
    );
};

export default OutputPanel;
