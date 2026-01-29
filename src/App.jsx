import { useState, useEffect } from 'react';
import './App.css';
import { fetchKeywords, fetchMentions, fetchUniqueAuthors, fetchAuthors } from './services/api';
import KeywordDropdown from './components/KeywordDropdown';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import OutputPanel from './components/OutputPanel';
import RulePanel from './components/RulePanel';
import AuthorsList from './components/AuthorsList'; // New
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider } from './context/ThemeContext';
import SourceDropdown from './components/SourceDropdown';
import InfiniteScroll from './components/InfiniteScroll';

const DEFAULT_KEYWORD = { label: 'All', count: 0 };

function App() {
    const [keywords, setKeywords] = useState([DEFAULT_KEYWORD]);
    const [selectedKeywords, setSelectedKeywords] = useState(['All']);
    const [selectedSources, setSelectedSources] = useState(['reddit']);

    // Lists Data
    const [mentions, setMentions] = useState([]);
    const [totalMentions, setTotalMentions] = useState(0);
    const [loadingMentions, setLoadingMentions] = useState(false);
    const [mentionsPage, setMentionsPage] = useState(0);
    const [hasMoreMentions, setHasMoreMentions] = useState(true);

    const [authors, setAuthors] = useState([]);
    const [totalAuthors, setTotalAuthors] = useState(0);
    const [loadingAuthors, setLoadingAuthors] = useState(false);
    const [authorsPage, setAuthorsPage] = useState(0);
    const [hasMoreAuthors, setHasMoreAuthors] = useState(true);

    const [selectedPost, setSelectedPost] = useState(null);
    const [activeListTab, setActiveListTab] = useState('mentions');

    // Initial Load: Keywords
    useEffect(() => {
        fetchKeywords()
            .then(data => {
                const mapped = data.map(k => ({
                    id: k.keyword.toLowerCase(),
                    label: k.keyword,
                    count: k.count
                }));
                setKeywords(mapped);
            })
            .catch(err => console.error(err));
    }, []);

    // Fetch Mentions & Authors on Keyword Change (Reset Pagination)
    useEffect(() => {
        setMentions([]);
        setMentionsPage(0);
        setHasMoreMentions(true);
        setLoadingMentions(true);

        fetchMentions(selectedKeywords, 0)
            .then(data => {
                const newMentions = data.mentions || [];
                setMentions(newMentions);
                setTotalMentions(data.total || 0);
                setHasMoreMentions(newMentions.length < (data.total || 0));
                setLoadingMentions(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingMentions(false);
            });

        // Authors
        setAuthors([]);
        setAuthorsPage(0);
        setHasMoreAuthors(true);
        setLoadingAuthors(true);

        fetchAuthors(selectedKeywords, 0)
            .then(data => {
                const newAuthors = data.authors || [];
                setAuthors(newAuthors);
                setTotalAuthors(data.total || 0);
                setHasMoreAuthors(newAuthors.length < (data.total || 0));
                setLoadingAuthors(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingAuthors(false);
            });

        fetchUniqueAuthors(selectedKeywords)
            .then(data => {
                setTotalAuthors(data.count || 0);
            })
            .catch(err => console.error(err));
    }, [selectedKeywords]);

    const loadMoreMentions = () => {
        if (loadingMentions || !hasMoreMentions) return;
        setLoadingMentions(true);
        const nextPage = mentionsPage + 1;
        fetchMentions(selectedKeywords, nextPage)
            .then(data => {
                const newMentions = data.mentions || [];
                setMentions(prev => [...prev, ...newMentions]);
                setMentionsPage(nextPage);
                setHasMoreMentions((mentions.length + newMentions.length) < data.total);
                setLoadingMentions(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingMentions(false);
            });
    };

    const loadMoreAuthors = () => {
        if (loadingAuthors || !hasMoreAuthors) return;
        setLoadingAuthors(true);
        const nextPage = authorsPage + 1;
        fetchAuthors(selectedKeywords, nextPage)
            .then(data => {
                const newAuthors = data.authors || [];
                setAuthors(prev => [...prev, ...newAuthors]);
                setAuthorsPage(nextPage);
                setHasMoreAuthors((authors.length + newAuthors.length) < data.total);
                setLoadingAuthors(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingAuthors(false);
            });
    };

    return (
        <div className="main-wrapper">
            <header className="app-header">
                <div className="header-left">
                    <h1>K Pharmacovigilance</h1>
                    <p>Drug performance and safety insights from patient experience</p>
                </div>
                <div className="header-right">
                    <span className="powered-by">Workbench powered by DeK</span>
                    <nav className="header-nav">
                        <span>Login</span>
                        <span>Signup</span>
                    </nav>
                </div>
            </header>

            <div className="app-container">
                {/* Left Panel: Output & Rules */}
                <div className="left-panel">
                    {/* Top Left: Output (Empty Response Area) */}
                    <section className="panel output-section" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ marginBottom: '12px', fontSize: '1rem', flexShrink: 0 }}>Output</h2>
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                            <OutputPanel />
                        </div>
                    </section>

                    {/* Bottom Left: Rules (Editable & Persisted) */}
                    <section className="panel rules-section" style={{ height: '400px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        <RulePanel onApplyRule={(id) => console.log('Applying rule', id)} />
                    </section>
                </div>

                {/* Right Panel: Controls & Lists */}
                <div className="right-panel">

                    {/* Top Right: Controls */}
                    <section className="panel control-section">
                        <KeywordDropdown
                            keywords={keywords}
                            selectedKeywords={selectedKeywords}
                            onKeywordsChange={setSelectedKeywords}
                        />
                        <SourceDropdown
                            selectedSources={selectedSources}
                            onSourcesChange={setSelectedSources}
                        />
                        {/* User Count Text Removed per Request */}
                    </section>

                    {/* Middle Right: Selected Post */}
                    <section className="panel detail-section">
                        <h3>Selected Post</h3>
                        <div style={{ height: '200px', background: 'var(--color-bg-panel)', borderRadius: 'var(--radius-sm)', padding: '8px', overflow: 'hidden' }}>
                            <PostDetail post={selectedPost} selectedKeywords={selectedKeywords} />
                        </div>
                    </section>

                    {/* Bottom Right: Tabs (Mentions / Authors) */}
                    <section className="panel list-section" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* List Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '8px', flexShrink: 0 }}>
                            <button
                                onClick={() => setActiveListTab('mentions')}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderBottom: activeListTab === 'mentions' ? '2px solid var(--color-primary)' : 'none',
                                    fontWeight: activeListTab === 'mentions' ? 700 : 400,
                                    cursor: 'pointer',
                                    color: 'inherit'
                                }}
                            >
                                Mentions ({totalMentions})
                            </button>
                            <button
                                onClick={() => setActiveListTab('authors')}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderBottom: activeListTab === 'authors' ? '2px solid var(--color-primary)' : 'none',
                                    fontWeight: activeListTab === 'authors' ? 700 : 400,
                                    cursor: 'pointer',
                                    color: 'inherit'
                                }}
                            >
                                Authors ({totalAuthors})
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', minHeight: 0 }}>
                            {activeListTab === 'mentions' ? (
                                <InfiniteScroll
                                    loadMore={loadMoreMentions}
                                    hasMore={hasMoreMentions}
                                    isLoading={loadingMentions}
                                >
                                    <PostList
                                        posts={mentions}
                                        selectedPostId={selectedPost?.id}
                                        onSelectPost={setSelectedPost}
                                    />
                                </InfiniteScroll>
                            ) : (
                                <InfiniteScroll
                                    loadMore={loadMoreAuthors}
                                    hasMore={hasMoreAuthors}
                                    isLoading={loadingAuthors}
                                >
                                    <AuthorsList authors={authors} loading={loadingAuthors} />
                                </InfiniteScroll>
                            )}
                        </div>
                    </section>
                </div>
                <ThemeSwitcher />
            </div>
        </div>
    );
}

export default App;
