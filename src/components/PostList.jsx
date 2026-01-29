import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

const PostList = ({ posts, selectedPostId, onSelectPost }) => {
    const [, setTick] = useState(0);

    // Refresh every 10s to update "xx mins ago"
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 10000);
        return () => clearInterval(interval);
    }, []);

    const getTimeAgoLabel = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();

        // Check if same day
        const isSameDay = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (!isSameDay) return null;

        const diffInSecs = Math.floor((now - date) / 1000);

        if (diffInSecs < 0) return null; // Future or clock skew

        if (diffInSecs < 60) {
            return `(${diffInSecs} secs ago)`;
        }

        const diffInMins = Math.floor(diffInSecs / 60);
        if (diffInMins < 60) {
            return `(${diffInMins} min ago)`;
        }

        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) {
            return `(${diffInHours} hours ago)`;
        }

        return null;
    };

    if (posts.length === 0) {
        return <div style={{ padding: '20px', color: 'var(--color-text-subtle)' }}>No mentions found.</div>;
    }

    return (
        <div className="post-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {posts.map((post) => {
                const timeAgo = getTimeAgoLabel(post.date);
                return (
                    <div
                        key={post.id}
                        onClick={() => onSelectPost(post)}
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            backgroundColor: selectedPostId === post.id ? 'var(--color-bg-panel)' : 'transparent',
                            border: selectedPostId === post.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                            borderBottom: '1px solid var(--color-border)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{post.author}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                                {new Date(post.date).toLocaleDateString()}
                                {timeAgo && (
                                    <span style={{ color: '#3b82f6', marginLeft: '4px', fontWeight: 500 }}>
                                        {timeAgo}
                                    </span>
                                )}
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
                );
            })}
        </div>
    );
};

export default PostList;
