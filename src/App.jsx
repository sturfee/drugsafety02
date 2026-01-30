import { useState, useEffect } from 'react';
import './App.css';
import { fetchKeywords, fetchMentions, fetchUniqueAuthors, fetchAuthors } from './services/api';
import KeywordDropdown from './components/KeywordDropdown';
import PostDetail from './components/PostDetail';
import OutputPanel from './components/OutputPanel';
import RulePanel from './components/RulePanel';
import OutputWindow from './components/OutputWindow';
import AuthorsList from './components/AuthorsList'; // New
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider } from './context/ThemeContext';
import SourceDropdown from './components/SourceDropdown';
import InfiniteScroll from './components/InfiniteScroll';
import PostList from './components/PostList';

const DEFAULT_KEYWORD = { label: 'All', count: 0 };

function App() {
    const [keywords, setKeywords] = useState([DEFAULT_KEYWORD]);

    // Persisted States
    const [selectedKeywords, setSelectedKeywords] = useState(() => {
        try {
            const saved = localStorage.getItem('dxe_v2_selectedKeywords');
            return saved ? JSON.parse(saved) : ['All'];
        } catch (e) {
            return ['All'];
        }
    });

    const [selectedSources, setSelectedSources] = useState(() => {
        try {
            const saved = localStorage.getItem('dxe_v2_selectedSources');
            return saved ? JSON.parse(saved) : ['reddit'];
        } catch (e) {
            return ['reddit'];
        }
    });

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

    const [selectedPost, setSelectedPost] = useState(() => {
        try {
            const saved = localStorage.getItem('dxe_v2_selectedPost');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [activeListTab, setActiveListTab] = useState(() => {
        const saved = localStorage.getItem('dxe_v2_activeListTab');
        return saved || 'mentions';
    });

    const [activeRuleId, setActiveRuleId] = useState(() => {
        try {
            const saved = localStorage.getItem('dxe_v2_activeRuleId');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [rules, setRules] = useState([]);

    // Rule Execution State
    const [ruleResults, setRuleResults] = useState({}); // Map: ruleId -> result
    const [isExecutingRule, setIsExecutingRule] = useState(false);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('dxe_v2_selectedKeywords', JSON.stringify(selectedKeywords));
        localStorage.setItem('dxe_v2_selectedSources', JSON.stringify(selectedSources));
        localStorage.setItem('dxe_v2_activeListTab', activeListTab);
        localStorage.setItem('dxe_v2_selectedPost', JSON.stringify(selectedPost));
        localStorage.setItem('dxe_v2_activeRuleId', JSON.stringify(activeRuleId));
    }, [selectedKeywords, selectedSources, activeListTab, selectedPost, activeRuleId]);

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

                </div>
            </header>

            <div className="app-container">
                {/* Left Panel: Output & Rules */}
                <div className="left-panel">
                    {/* Top Left: Output (Response Area) */}
                    <section className="panel output-section" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <div className="panel output-panel" style={{ flex: 1, minHeight: 0, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                            <OutputWindow
                                result={ruleResults[activeRuleId]}
                                isExecuting={isExecutingRule}
                            />
                        </div>
                    </section>

                    {/* Bottom Left: Rules (Editable & Persisted) */}
                    <section className="panel rules-section" style={{ height: '400px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        <div className="panel rule-panel-container" style={{ flex: 1, minHeight: 0 }}>
                            <RulePanel
                                rules={rules}
                                setRules={setRules}
                                activeRuleId={activeRuleId}
                                onActiveRuleChange={setActiveRuleId}
                                onExecutionStart={() => setIsExecutingRule(true)}
                                onExecutionComplete={(res) => {
                                    setRuleResults(prev => ({
                                        ...prev,
                                        [activeRuleId]: res
                                    }));
                                    setIsExecutingRule(false);
                                }}
                                selectedKeywords={selectedKeywords}
                                ruleResults={ruleResults} // Pass all results for chaining
                            />
                        </div>
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
                        <div className="post-detail-container" style={{ height: '200px', background: 'var(--color-bg-panel)', borderRadius: 'var(--radius-sm)', padding: '8px', overflow: 'hidden' }}>
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
