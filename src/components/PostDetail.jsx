import React from 'react';
import { ExternalLink } from 'lucide-react';

const PostDetail = ({ post }) => {
    if (!post) {
        return (
            <div style={{ padding: '20px', color: 'var(--color-text-subtle)', textAlign: 'center' }}>
                Select a mention to view details
            </div>
        );
    }

    return (
        <div className="post-detail" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                <div>
                    <div style={{ fontWeight: 'bold' }}>{post.author}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>ID: {post.id}</div>
                </div>
                <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                    Open Source <ExternalLink size={14} />
                </a>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', lineHeight: '1.5' }}>
                {post.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-subtle)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                <span>Received: {new Date(post.date).toLocaleString()}</span>
                <span>Source: {post.source}</span>
            </div>
        </div>
    );
};

export default PostDetail;
