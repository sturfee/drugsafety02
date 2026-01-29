import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette } from 'lucide-react';

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'enterprise', label: '🏢 Enterprise' },
        { id: 'clinical', label: '🟡 Kognitos' },
        { id: 'cyber', label: '👾 Cyber' }
    ];

    return (
        <div className="theme-switcher">
            <div className="trigger">
                <Palette size={20} />
            </div>
            <div className="options">
                {themes.map(t => (
                    <button
                        key={t.id}
                        className={theme === t.id ? 'active' : ''}
                        onClick={() => setTheme(t.id)}
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
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    transition: all 0.3s ease;
                }
                .theme-switcher .trigger {
                    width: 36px;
                    height: 36px;
                    background: var(--color-primary);
                    color: #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 4px;
                }
                .theme-switcher .options {
                    display: flex;
                    gap: 4px;
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
                }
                .theme-switcher button:hover {
                    background: var(--color-bg-panel);
                    color: var(--color-text-main);
                }
                .theme-switcher button.active {
                    background: var(--color-text-main);
                    color: var(--color-bg-surface);
                }
            `}</style>
        </div>
    );
};

export default ThemeSwitcher;
