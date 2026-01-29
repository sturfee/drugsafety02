import React, { useEffect, useRef } from 'react';

const InfiniteScroll = ({ loadMore, hasMore, isLoading, children }) => {
    const observerTarget = useRef(null);

    useEffect(() => {
        if (!hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadMore, hasMore, isLoading]);

    return (
        <div className="infinite-scroll-container">
            {children}
            <div ref={observerTarget} style={{ height: '20px', margin: '10px 0' }}>
                {isLoading && <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>Loading more...</div>}
                {!hasMore && children.props?.posts?.length > 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No more items to display</div>}
            </div>
        </div>
    );
};

export default InfiniteScroll;
