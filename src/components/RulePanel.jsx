
import React, { useState, useEffect } from 'react';
import { Save, Trash2, Play, Plus } from 'lucide-react';
import { fetchRules, saveRule, deleteRule, executeRule } from '../services/api';

const RulePanel = ({
    activeRuleId,
    onActiveRuleChange,
    onExecutionStart,
    onExecutionComplete,
    selectedKeywords = ['All'],
    startDate = null,
    endDate = null,
    rules,
    setRules,
    ruleResults
}) => {
    const [loading, setLoading] = useState(false);

    // Local Edit State
    const [localTitle, setLocalTitle] = useState('');
    const [localInstruction, setLocalInstruction] = useState('');
    const [useChaining, setUseChaining] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [executingId, setExecutingId] = useState(null);

    // Load Rules on mount
    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        setLoading(true);
        try {
            const data = await fetchRules();
            setRules(data);
            if (data.length > 0 && !activeRuleId) {
                // Select first by default
                onActiveRuleChange(data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Sync local state when active rule changes
    useEffect(() => {
        const active = rules.find(r => r.id === activeRuleId);
        if (active) {
            setLocalTitle(active.title);
            setLocalInstruction(active.instruction);
        } else {
            setLocalTitle('');
            setLocalInstruction('');
        }
    }, [activeRuleId, rules]);

    // Handle Creating a New Rule
    const handleCreate = async () => {
        const tempRule = { title: "New Rule", instruction: "Enter instructions..." };
        try {
            const saved = await saveRule(tempRule);
            setRules(prev => [...prev, saved]);
            onActiveRuleChange(saved.id);
        } catch (err) {
            alert("Failed to create rule");
        }
    };

    // Handle Saving Changes
    const handleSave = async () => {
        if (!activeRuleId) return;
        setIsSaving(true);
        try {
            const payload = { title: localTitle, instruction: localInstruction };
            const updated = await saveRule(payload, activeRuleId);

            // Update local list
            setRules(prev => prev.map(r => r.id === activeRuleId ? updated : r));
            setIsSaving(false);
        } catch (err) {
            alert("Failed to save changes");
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!activeRuleId || !window.confirm("Delete this rule?")) return;
        try {
            await deleteRule(activeRuleId);
            const remaining = rules.filter(r => r.id !== activeRuleId);
            setRules(remaining);
            onActiveRuleChange(remaining.length > 0 ? remaining[0].id : null);
        } catch (err) {
            alert("Failed to delete rule");
        }
    };

    const handleExecute = async () => {
        if (!activeRuleId) return;
        setExecutingId(activeRuleId);
        onExecutionStart();
        try {
            // Determine Chaining Context
            let contextResult = null;
            if (useChaining && rules.length > 0) {
                const currentIndex = rules.findIndex(r => r.id === activeRuleId);
                if (currentIndex > 0) {
                    const prevRuleId = rules[currentIndex - 1].id;
                    contextResult = ruleResults[prevRuleId];
                }
            }

            // Pass the context (filters and previous results) to the API
            const result = await executeRule(
                activeRuleId,
                selectedKeywords,
                startDate,
                endDate,
                contextResult
            );
            onExecutionComplete(result);
        } catch (err) {
            onExecutionComplete({ status: 'error', message: err.message });
        } finally {
            setExecutingId(null);
        }
    };

    return (
        <div className="rule-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>

            {/* Tab Header */}
            <div className="rule-tabs" style={{ display: 'flex', overflowX: 'auto', background: 'var(--color-bg-app)', borderBottom: '1px solid var(--color-border)' }}>
                {rules.map(rule => (
                    <button
                        key={rule.id}
                        onClick={() => onActiveRuleChange(rule.id)}
                        style={{
                            padding: '10px 16px',
                            border: 'none',
                            borderRight: '1px solid var(--color-border)',
                            background: activeRuleId === rule.id ? 'var(--color-primary)' : 'transparent',
                            color: activeRuleId === rule.id ? '#000' : 'var(--color-text-subtle)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {rule.title}
                    </button>
                ))}
                <button
                    onClick={handleCreate}
                    style={{ padding: '0 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    title="Add Rule"
                >
                    <Plus size={18} color="var(--color-text-main)" />
                </button>
            </div>

            {/* Prompt Editor Area */}
            {activeRuleId ? (
                <div className="rule-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', background: 'var(--color-bg-surface)' }}>

                    {/* Title Input */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-subtle)', fontWeight: 700 }}>Rule Title</label>
                        <input
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={handleSave} // Auto-save on blur logic could go here
                            style={{
                                display: 'block',
                                width: '100%',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                border: 'none',
                                borderBottom: '1px solid var(--color-border)',
                                background: 'transparent',
                                padding: '8px 0',
                                color: 'var(--color-text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Instruction Textarea */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-subtle)', fontWeight: 700, marginBottom: '8px' }}>Instructions (Prompt)</label>
                        <textarea
                            value={localInstruction}
                            onChange={(e) => setLocalInstruction(e.target.value)}
                            style={{
                                flex: 1,
                                width: '100%',
                                resize: 'none',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '12px',
                                background: 'var(--color-bg-app)',
                                color: 'var(--color-text-main)',
                                fontSize: '0.95rem',
                                fontFamily: 'var(--font-mono)',
                                lineHeight: '1.5'
                            }}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
                                <input
                                    type="checkbox"
                                    id="chaining-toggle"
                                    checked={useChaining}
                                    onChange={(e) => setUseChaining(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label htmlFor="chaining-toggle" style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', cursor: 'pointer', userSelect: 'none' }}>
                                    Use previous result as context (Chaining)
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{
                                        background: 'var(--color-bg-panel)',
                                        border: '1px solid var(--color-border)',
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: '6px',
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-danger)',
                                        padding: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <button
                                onClick={handleExecute}
                                disabled={!!executingId}
                                style={{
                                    background: executingId ? 'var(--color-text-subtle)' : '#000',
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: executingId ? 'not-allowed' : 'pointer',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                <Play size={16} fill="#FFF" /> {executingId ? 'Executing...' : 'Apply Rule'}
                            </button>
                        </div>

                    </div>
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                    No rules created. Click '+' to start.
                </div>
            )}
        </div>
    );
};
export default RulePanel;
