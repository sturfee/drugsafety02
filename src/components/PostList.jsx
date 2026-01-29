import React from 'react';
import { MessageSquare } from 'lucide-react';

const PostList = ({ posts, selectedPostId, onSelectPost }) => {
    if (posts.length === 0) {
        return <div style={{ padding: '20px', color: 'var(--color-text-subtle)' }}>No mentions found.</div>;
    }

    return (
        <div className="post-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {posts.map((post) => (
                <div
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        backgroundColor: selectedPostId === post.id ? 'var(--color-bg-panel)' : 'transparent',
                        border: selectedPostId === post.id ? '1px solid var(--color-primary)' : '1px solid transparent', // Highlight selected
                        borderBottom: '1px solid var(--color-border)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                            {new Date(post.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-text-subtle)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {post.content}
                    </div>
                    <div style={{ marginTop: '6px', display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare size={12} /> Reddit
                        </span>
                        <span style={{
                            color: post.sentiment === 'positive' ? 'var(--color-success)' :
                                post.sentiment === 'negative' ? 'var(--color-danger)' : 'var(--color-warning)'
                        }}>
                            {post.sentiment}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostList;
