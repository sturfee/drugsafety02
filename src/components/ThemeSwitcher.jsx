import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette } from 'lucide-react';

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const themes = [
        { id: 'enterprise', label: '🏢 Enterprise' },
        { id: 'boxy', label: '🟡 Boxy' },
        { id: 'pharma', label: '🏥 Pharma' }
    ];

    return (
        <div
            className={`theme-switcher ${isExpanded ? 'expanded' : ''}`}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div
                className="trigger"
                onClick={() => setIsExpanded(!isExpanded)}
                title="Change Theme"
            >
                <Palette size={20} />
            </div>

            <div className="options">
                {themes.map(t => (
                    <button
                        key={t.id}
                        className={theme === t.id ? 'active' : ''}
                        onClick={() => {
                            setTheme(t.id);
                            setIsExpanded(false);
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <style>{`
                .theme-switcher {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--color-bg-surface);
                    border: 1px solid var(--color-border);
                    border-radius: 99px;
                    padding: 6px;
                    display: flex;
                    align-items: center;
                    gap: 0;
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    max-width: 48px;
                    overflow: hidden;
                    white-space: nowrap;
                }
                
                .theme-switcher.expanded {
                    max-width: 300px;
                    padding-right: 12px;
                    gap: 8px;
                }

                .theme-switcher .trigger {
                    width: 36px;
                    height: 36px;
                    background: #60A5FA;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                
                .theme-switcher .trigger:hover {
                    transform: scale(1.05);
                }

                .theme-switcher .options {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.2s ease 0.1s;
                    pointer-events: none;
                }
                
                .theme-switcher.expanded .options {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: all;
                }

                .theme-switcher button {
                    background: transparent;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    color: var(--color-text-subtle);
                    font-weight: 500;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .theme-switcher button:hover {
                    background: var(--color-bg-panel);
                    color: var(--color-text-main);
                }

                .theme-switcher button.active {
                    background: var(--color-text-main);
                    color: var(--color-bg-surface);
                }

                @media (max-width: 768px) {
                    .theme-switcher {
                        right: auto;
                        left: 20px;
                        bottom: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ThemeSwitcher;
