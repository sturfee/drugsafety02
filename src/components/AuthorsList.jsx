import React, { useState, useEffect } from 'react';
import { fetchAuthors } from '../services/api';

const AuthorsList = ({ authors, loading }) => {
    if (loading && authors.length === 0) return <div style={{ padding: '10px' }}>Loading authors...</div>;

    return (
        <div className="authors-list" style={{ padding: '0' }}>
            {authors.length === 0 ? (
                <div style={{ padding: '10px', color: 'var(--color-text-subtle)' }}>No authors found</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {authors.map((a, i) => (
                        <li key={i} style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ fontWeight: 500 }}>{a.author}</span>
                            <span style={{
                                background: 'var(--color-bg-panel)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-subtle)'
                            }}>
                                {a.count} posts
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AuthorsList;
