import React from 'react';
import { Download } from 'lucide-react';

const OutputWindow = ({ result, isExecuting, onSelectPost }) => {

    // Function to convert JSON to CSV and trigger download
    const handleDownloadCSV = () => {
        if (!result || !result.data || result.data.length === 0) return;

        const data = result.data;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','), // Header row
            ...data.map(row => headers.map(header => {
                const val = row[header] ?? '';
                // Escape quotes and wrap in quotes if contains comma
                const escaped = String(val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'rule_output.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle row/cell click for interactivity
    const handleCellClick = (key, row) => {
        // If clicking ID or Post ID, and we have a handler
        if ((key.toLowerCase() === 'id' || key.toLowerCase() === 'post_id') && onSelectPost) {
            // Construct a post object. Ideally the row has author/content/url.
            // We pass the whole row as the post object.
            // Ensure ID is passed correctly (some views might have id as string or number)
            onSelectPost(row);
        }
    };

    if (isExecuting) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-subtle)' }}>
                {/* AI Animation */}
                <div className="ai-loader">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
                <p style={{ marginTop: '16px', fontSize: '0.9rem', fontWeight: 500, animation: 'pulse 1.5s infinite' }}>
                    AI model at work...
                </p>
                <style>{`
                    .ai-loader {
                        display: flex;
                        gap: 4px;
                        height: 24px;
                        align-items: flex-end;
                    }
                    .bar {
                        width: 6px;
                        background: var(--color-primary);
                        animation: ai-bar 1s ease-in-out infinite;
                    }
                    .bar:nth-child(2) { animation-delay: 0.1s; height: 60%; }
                    .bar:nth-child(3) { animation-delay: 0.2s; height: 30%; }
                    
                    @keyframes ai-bar {
                        0%, 100% { height: 20%; }
                        50% { height: 100%; }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    if (!result) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-subtle)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Apply a rule to generate analysis...</p>
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

    const { data, message, explanation } = result;

    return (
        <div className="output-window" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Response</h3>

                    {data && data.length > 0 && (
                        <button
                            onClick={handleDownloadCSV}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'transparent',
                                border: '1px solid var(--color-border)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: 'var(--color-text-main)'
                            }}
                        >
                            <Download size={14} /> Save as CSV
                        </button>
                    )}
                </div>

                {explanation && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-main)', fontStyle: 'italic', borderLeft: '3px solid var(--color-primary)', paddingLeft: '10px' }}>
                        {explanation}
                    </div>
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
                                    {Object.entries(row).map(([key, val], j) => {
                                        const isLink = (key.toLowerCase() === 'id' || key.toLowerCase() === 'post_id');
                                        return (
                                            <td
                                                key={j}
                                                onClick={() => handleCellClick(key, row)}
                                                style={{
                                                    padding: '10px',
                                                    color: 'var(--color-text-main)',
                                                    cursor: isLink ? 'pointer' : 'default',
                                                    textDecoration: isLink ? 'underline' : 'none',
                                                    fontWeight: isLink ? 'bold' : 'normal'
                                                }}
                                            >
                                                {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '')}
                                            </td>
                                        );
                                    })}
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
