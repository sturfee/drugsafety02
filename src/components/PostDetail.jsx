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

    const highlightKeywords = (content) => {
        if (!content || !selectedKeywords || selectedKeywords.length === 0) return content;

        let kws = selectedKeywords;
        if (selectedKeywords.includes('All')) {
            // If 'All' is selected, highlight nothing or we'd need to know all available keywords.
            // Based on user feedback, they probably mean the specific ones they are looking at.
            // I will skip highlighting for 'All' to avoid messy UI, or if kws has more than 'All'.
            kws = selectedKeywords.filter(k => k !== 'All');
        }

        if (kws.length === 0) return content;

        // Create a regex to match any of the keywords (case-insensitive)
        const escapedKws = kws.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${escapedKws.join('|')})`, 'gi');

        const parts = content.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} style={{ backgroundColor: '#E6FE53', color: '#000', padding: '0 2px', borderRadius: '2px' }}>
                    {part}
                </mark>
            ) : part
        );
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
                {highlightKeywords(post.content)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-subtle)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                <span>Received: {new Date(post.date).toLocaleString()}</span>
                <span>Source: {post.source}</span>
            </div>
        </div>
    );
};

export default PostDetail;
