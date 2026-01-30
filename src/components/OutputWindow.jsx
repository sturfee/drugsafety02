import React from 'react';

const OutputWindow = ({ result, isExecuting }) => {
    if (isExecuting) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-secondary)' }}>
                <div className="spinner" style={{ marginBottom: '10px' }}></div>
                Executing Rule with ChatGPT...
            </div>
        );
    }

    if (!result) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                Apply a rule to see output results here.
            </div>
        );
    }

    if (result.status === 'error') {
        return (
            <div style={{ padding: '20px', color: 'var(--color-danger)' }}>
                <strong>Execution Error:</strong>
                <pre style={{ marginTop: '10px', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{result.message}</pre>
            </div>
        );
    }

    const { data, message, sql, explanation } = result;

    return (
        <div className="output-window" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rule Output</h3>
                    {sql && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', background: 'var(--color-bg-app)', padding: '2px 6px', borderRadius: '4px' }}>SQL MODE</span>
                    )}
                </div>

                {explanation && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-main)', fontStyle: 'italic', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
                        {explanation}
                    </div>
                )}

                {sql && (
                    <details style={{ marginTop: '8px' }}>
                        <summary style={{ fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-subtle)', userSelect: 'none' }}>View Generated SQL</summary>
                        <pre style={{ fontSize: '0.7rem', background: '#000', color: '#0f0', padding: '12px', borderRadius: '4px', marginTop: '4px', overflowX: 'auto', border: '1px solid #333' }}>
                            {sql}
                        </pre>
                    </details>
                )}
            </div>

            <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-app)', borderRadius: '4px' }}>
                {data && data.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-bg-panel)' }}>
                            <tr style={{ textAlign: 'left' }}>
                                {Object.keys(data[0]).map(key => (
                                    <th key={key} style={{ padding: '12px 10px', borderBottom: '2px solid var(--color-border)', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {key.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} style={{ padding: '10px', color: 'var(--color-text-main)' }}>
                                            {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : message ? (
                    <div style={{ padding: '16px', lineHeight: '1.6', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                        {message}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                        No data returned from execution.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputWindow;
