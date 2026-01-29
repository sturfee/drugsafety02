import React, { useState, useRef, useEffect } from 'react';
import redditLogo from '../assets/reddit-logo.png';
import fdaLogo from '../assets/fda-logo.png';

const SourceDropdown = ({ selectedSources = [], onSourcesChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const sources = [
        { id: 'reddit', label: 'Reddit', icon: redditLogo },
        { id: 'fda', label: 'FDA FAERS', icon: fdaLogo },
        { id: 'pharmacy', label: 'Pharmacy Claims', icon: null }, // Placeholder icon
        { id: 'medical', label: 'Medical Claims', icon: null },   // Placeholder icon
    ];

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSource = (sourceId) => {
        const newSelection = selectedSources.includes(sourceId)
            ? selectedSources.filter(id => id !== sourceId)
            : [...selectedSources, sourceId];
        onSourcesChange(newSelection);
    };

    const getDisplayLabel = () => {
        if (selectedSources.length === 0) return "Select Sources";
        if (selectedSources.length === 1) {
            return sources.find(s => s.id === selectedSources[0])?.label;
        }
        return `${selectedSources.length} Sources Selected`;
    };

    return (
        <div className="source-dropdown-container" ref={dropdownRef} style={{ marginBottom: '20px' }}>
            <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--color-text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                Data Sources
            </label>

            <div
                className={`source-dropdown-header ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '8px'
                }}
            >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{getDisplayLabel()}</span>
                    {selectedSources.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false); // Just close
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                cursor: 'pointer',
                                color: 'var(--color-text-subtle)',
                                opacity: 0.6,
                                transition: 'opacity 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = 1}
                            onMouseLeave={(e) => e.target.style.opacity = 0.6}
                            title="Close menu"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <span style={{
                    transition: 'transform 0.2s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    fontSize: '0.8rem',
                    opacity: 0.7
                }}>▼</span>
            </div>

            {isOpen && (
                <div className="source-dropdown-menu" style={{
                    position: 'absolute',
                    zIndex: 100,
                    width: 'calc(100% - var(--spacing-md) * 2)',
                    marginTop: '4px',
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {sources.map((source) => (
                        <div
                            key={source.id}
                            className="source-menu-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSource(source.id);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 14px',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease',
                                borderBottom: '1px solid var(--color-border-faint)',
                                gap: '12px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <input
                                type="checkbox"
                                checked={selectedSources.includes(source.id)}
                                onChange={() => { }} // Controlled by parent div click
                                style={{ pointerEvents: 'none' }}
                            />
                            {source.icon && (
                                <img
                                    src={source.icon}
                                    alt={source.label}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                            <span style={{
                                fontSize: '0.9rem',
                                color: 'var(--color-text-main)',
                                flex: 1
                            }}>
                                {source.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SourceDropdown;
