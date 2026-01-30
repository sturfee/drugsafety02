import React from 'react';
import { ExternalLink } from 'lucide-react';

const PostDetail = ({ post, selectedKeywords = [] }) => {
    if (!post) {
        return (
            <div style={{ padding: '20px', color: 'var(--color-text-subtle)', textAlign: 'center' }}>
                Select a mention to view details
            </div>
        );
    }

    // Use original URL, but strip query parameters for cleanliness
    const cleanUrl = post.url ? post.url.split('?')[0] : '#';

    const highlightContent = (content) => {
        if (!content) return content;

        // 1. Gather Keywords (Yellow)
        let kws = [];
        if (selectedKeywords && selectedKeywords.length > 0 && !selectedKeywords.includes('All')) {
            kws = selectedKeywords.filter(k => k !== 'All');
        }

        // 2. Gather Extracted Values (Blue)
        let extractedValues = [];
        if (post.extractedData) {
            extractedValues = Object.entries(post.extractedData)
                .filter(([key, val]) => {
                    if (['id', 'post_id', 'url', 'date', 'received_at', 'source', 'sentiment', 'c', 'keyword'].includes(key.toLowerCase())) return false;
                    return val && String(val).length > 1;
                })
                .map(([, val]) => String(val));
        }

        // 3. Build Regex
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const allTerms = [
            ...kws.map(k => ({ term: k, type: 'keyword' })),
            ...extractedValues.map(v => ({ term: v, type: 'extracted' }))
        ];

        if (allTerms.length === 0) return content;

        // Sort by length desc
        allTerms.sort((a, b) => b.term.length - a.term.length);

        const pattern = allTerms.map(t => escapeRegExp(t.term)).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');

        const parts = content.split(regex);

        return parts.map((part, i) => {
            const match = allTerms.find(t => t.term.toLowerCase() === part.toLowerCase());
            if (match) {
                if (match.type === 'keyword') {
                    return (
                        <mark key={i} style={{ backgroundColor: '#E6FE53', color: '#000', padding: '0 2px', borderRadius: '2px' }}>
                            {part}
                        </mark>
                    );
                } else {
                    return (
                        <mark key={i} style={{ backgroundColor: '#60A5FA', color: '#FFF', padding: '0 2px', borderRadius: '2px' }}>
                            {part}
                        </mark>
                    );
                }
            }
            return part;
        });
    };

    return (
        <div className="post-detail" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <div>
                    <div style={{ fontWeight: 'bold' }}>{post.author}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>ID: {post.id}</div>
                </div>
                <a
                    href={cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                    Open Source <ExternalLink size={14} />
                </a>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', lineHeight: '1.5', fontSize: '0.95rem' }}>

                {/* Extracted Fields Highlight Section */}
                {post.extractedData && (
                    <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '4px', borderLeft: '3px solid #60A5FA' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#60A5FA', fontWeight: 700, marginBottom: '4px' }}>
                            Reported Fields
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'x 12px', rowGap: '4px' }}>
                            {Object.entries(post.extractedData).map(([key, val]) => {
                                // Filter out standard fields to focus on extracted insights
                                if (['id', 'post_id', 'content', 'url', 'date', 'received_at', 'source', 'sentiment', 'c', 'keyword'].includes(key.toLowerCase())) return null;
                                return (
                                    <React.Fragment key={key}>
                                        <div style={{ fontWeight: 600, color: '#60A5FA', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                            {key.replace(/_/g, ' ')}:
                                        </div>
                                        <div style={{ wordBreak: 'break-word', fontSize: '0.85rem' }}>
                                            {String(val)}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}

                {highlightContent(post.content)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-subtle)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                <span>Received: {new Date(post.date).toLocaleString()}</span>
                <span>Source: {post.source}</span>
            </div>
        </div>
    );
};

export default PostDetail;
