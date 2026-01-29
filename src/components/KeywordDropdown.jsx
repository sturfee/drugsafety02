import React from 'react';

const KeywordDropdown = ({ keywords, selectedKeyword, onKeywordChange }) => {
    return (
        <div className="keyword-dropdown">
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-subtle)' }}>
                Keywords
            </label>
            <select
                value={selectedKeyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-main)',
                    fontSize: '1rem',
                    outline: 'none'
                }}
            >
                {keywords.map((k) => (
                    <option key={k.id} value={k.label}>
                        {k.label} ({k.count})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default KeywordDropdown;
