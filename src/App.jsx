import { useState, useEffect } from 'react';
import './App.css';
import { fetchKeywords, fetchMentions, fetchUniqueAuthors } from './services/api';
import KeywordDropdown from './components/KeywordDropdown';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import OutputPanel from './components/OutputPanel';
import RulePanel from './components/RulePanel';
import AuthorsList from './components/AuthorsList'; // New
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider } from './context/ThemeContext';

const DEFAULT_KEYWORD = { label: 'All', count: 0 };

function App() {
    const [keywords, setKeywords] = useState([DEFAULT_KEYWORD]);
    const [selectedKeyword, setSelectedKeyword] = useState('All');

    // Lists Data
    const [mentions, setMentions] = useState([]);
    const [loadingMentions, setLoadingMentions] = useState(false);

    const [selectedPost, setSelectedPost] = useState(null);
    const [activeListTab, setActiveListTab] = useState('mentions'); // 'mentions' or 'authors'

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

    // Fetch Mentions on Keyword Change
    useEffect(() => {
        setLoadingMentions(true);
        setMentions([]);
        setSelectedPost(null);

        fetchMentions(selectedKeyword)
            .then(data => {
                setMentions(data.mentions || []);
                setLoadingMentions(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingMentions(false);
            });
    }, [selectedKeyword]);

    return (
        <div className="app-container">
            {/* Left Panel: Output & Rules */}
            <div className="left-panel">

                {/* Top Left: Output (Empty Response Area) */}
                <section className="panel output-section" style={{ flex: 1, marginBottom: '16px' }}>
                    <h2 style={{ marginBottom: '8px', fontSize: '1rem' }}>Output</h2>
                    <OutputPanel />
                </section>

                {/* Bottom Left: Rules (Editable & Persisted) */}
                <section className="panel rules-section" style={{ height: '45%', display: 'flex', flexDirection: 'column' }}>
                    <RulePanel onApplyRule={(id) => console.log('Applying rule', id)} />
                </section>
            </div>

            {/* Right Panel: Controls & Lists */}
            <div className="right-panel">

                {/* Top Right: Controls */}
                <section className="panel control-section">
                    <KeywordDropdown
                        keywords={keywords}
                        selectedKeyword={selectedKeyword}
                        onKeywordChange={setSelectedKeyword}
                    />
                    {/* User Count Text Removed per Request */}
                </section>

                {/* Middle Right: Selected Post */}
                <section className="panel detail-section">
                    <h3>Selected Post</h3>
                    <div style={{ height: '200px', background: 'var(--color-bg-panel)', borderRadius: 'var(--radius-sm)', padding: '8px', overflow: 'hidden' }}>
                        <PostDetail post={selectedPost} />
                    </div>
                </section>

                {/* Bottom Right: Tabs (Mentions / Authors) */}
                <section className="panel list-section" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

                    {/* List Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
                        <button
                            onClick={() => setActiveListTab('mentions')}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: 'transparent',
                                borderBottom: activeListTab === 'mentions' ? '2px solid var(--color-primary)' : 'none',
                                fontWeight: activeListTab === 'mentions' ? 700 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            Mentions ({mentions.length})
                        </button>
                        <button
                            onClick={() => setActiveListTab('authors')}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: 'transparent',
                                borderBottom: activeListTab === 'authors' ? '2px solid var(--color-primary)' : 'none',
                                fontWeight: activeListTab === 'authors' ? 700 : 400,
                                cursor: 'pointer'
                            }}
                        >
                            Authors
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                        {activeListTab === 'mentions' ? (
                            loadingMentions ? (
                                <div style={{ padding: '20px', color: 'var(--color-text-subtle)' }}>Loading...</div>
                            ) : (
                                <PostList
                                    posts={mentions}
                                    selectedPostId={selectedPost?.id}
                                    onSelectPost={setSelectedPost}
                                />
                            )
                        ) : (
                            <AuthorsList keyword={selectedKeyword} />
                        )}
                    </div>
                </section>
            </div>
            <ThemeSwitcher />
        </div>
    );
}

export default App;
