import { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Clock3 } from 'lucide-react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 4;

async function requestJson(url, signal) {
  const response = await fetch(url, { signal });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to load posts.');
  return result;
}

function Header() {
  return (
    <header className="site-header">
      <Link aria-label="Fieldnotes home" className="wordmark" to="/">
        <span className="wordmark-icon">f.</span>
        <span>fieldnotes</span>
      </Link>
      <nav aria-label="Main navigation" className="header-nav">
        <a href="/#latest">The journal</a>
        <a href="/#about">Our note</a>
        <a className="nav-arrow" href="mailto:hello@fieldnotes.example" aria-label="Send Fieldnotes an email">
          <ArrowUpRight size={17} strokeWidth={1.7} />
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="about">
      <Link className="wordmark footer-mark" to="/">
        <span className="wordmark-icon">f.</span>
        <span>fieldnotes</span>
      </Link>
      <p>A journal for a more considered everyday.</p>
      <span className="footer-date">Made for slower moments · 2026</span>
    </footer>
  );
}

function LoadingState({ label = 'Gathering the latest notes' }) {
  return (
    <div aria-live="polite" className="status-state">
      <span className="loader" />
      <p>{label}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-mark">!</span>
      <div>
        <h2>We couldn't find the page just yet.</h2>
        <p>{message}</p>
        {onRetry && <button className="text-button" onClick={onRetry}>Try again <ArrowRight size={15} /></button>}
        {!onRetry && <Link className="text-button" to="/">Back to the journal <ArrowRight size={15} /></Link>}
      </div>
    </div>
  );
}

function PostMeta({ post }) {
  const date = new Date(`${post.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="post-meta">
      <span>{post.category}</span>
      <span className="meta-dot" aria-hidden="true">·</span>
      <time dateTime={post.date}>{date}</time>
      <span className="meta-reading"><Clock3 size={13} strokeWidth={1.7} /> {post.readTime} min read</span>
    </div>
  );
}

function PostCard({ post, featured = false }) {
  return (
    <article className={`post-card${featured ? ' featured-card' : ''}`}>
      <Link className="post-image-link" to={`/posts/${post.slug}`} aria-label={`Read ${post.title}`}>
        <img alt={post.imageAlt} className="post-image" src={post.coverImage} loading={featured ? 'eager' : 'lazy'} />
        <span aria-hidden="true" className="image-link-icon"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="post-card-copy">
        <PostMeta post={post} />
        <h2><Link to={`/posts/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.excerpt}</p>
        <span className="post-author">Words by {post.author}</span>
      </div>
    </article>
  );
}

function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    requestJson(`/api/posts?page=${page}&limit=${PAGE_SIZE}`, controller.signal)
      .then((response) => setResult(response))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, reloadKey]);

  function changePage(nextPage) {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) });
    document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <section className="intro-band">
        <div className="intro-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> A journal for the in-between</span>
          <h1>Make a little<br /><em>room to notice.</em></h1>
          <p>Stories on the small things that make a life feel like your own.</p>
          <a className="intro-link" href="#latest">Read the journal <ArrowDown size={15} /></a>
        </div>
        <div className="intro-art" aria-label="An open book and a quiet afternoon" role="img">
          <img alt="Sunlit wildflowers in a field" src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85" />
          <span className="art-caption">Notes from the everyday <span>01 — 07</span></span>
        </div>
        <span className="intro-index" aria-hidden="true">Vol. 04<br />Autumn 2026</span>
      </section>

      <main className="journal-section" id="latest">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A few things worth keeping</span>
            <h2>The journal<span className="heading-period">.</span></h2>
          </div>
          {result && <span className="result-count">{String(result.pagination.total).padStart(2, '0')} stories</span>}
        </div>
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />}
        {!loading && !error && result && (
          <>
            {result.data.length === 0 ? (
              <div className="empty-state">No stories on this page. <button className="text-button" onClick={() => changePage(1)}>Back to the first page <ArrowRight size={15} /></button></div>
            ) : (
              <div className="post-grid">
                {result.data.map((post, index) => <PostCard featured={index === 0} key={post.slug} post={post} />)}
              </div>
            )}
            {result.pagination.totalPages > 1 && (
              <nav aria-label="Post pages" className="pagination">
                <button aria-label="Previous page" disabled={!result.pagination.hasPreviousPage} onClick={() => changePage(page - 1)}>
                  <ArrowLeft size={17} /> <span>Previous</span>
                </button>
                <span className="page-count">Page <strong>{result.pagination.page}</strong> of {result.pagination.totalPages}</span>
                <button aria-label="Next page" disabled={!result.pagination.hasNextPage} onClick={() => changePage(page + 1)}>
                  <span>Next</span> <ArrowRight size={17} />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    requestJson(`/api/posts/${encodeURIComponent(slug)}`, controller.signal)
      .then((response) => setPost(response.data))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [slug, reloadKey]);

  if (loading) return <><main className="detail-shell"><LoadingState label="Opening this story" /></main><Footer /></>;
  if (error) return <><main className="detail-shell"><ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} /></main><Footer /></>;
  if (!post) return null;

  return (
    <>
      <main className="detail-shell">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> All stories</Link>
        <article className="story">
          <header className="story-header">
            <PostMeta post={post} />
            <h1>{post.title}</h1>
            <p className="story-deck">{post.excerpt}</p>
            <p className="story-byline">Words by <strong>{post.author}</strong></p>
          </header>
          <figure className="story-cover">
            <img src={post.coverImage} alt={post.imageAlt} />
            <figcaption>{post.imageAlt}</figcaption>
          </figure>
          <div className="story-body">
            {post.body.map((paragraph, index) => <p key={`${post.slug}-${index}`}>{paragraph}</p>)}
            <div className="story-endmark" aria-hidden="true">✳</div>
          </div>
          <div className="story-return"><Link className="text-button" to="/"><ArrowLeft size={15} /> Return to the journal</Link></div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function NotFoundPage() {
  return <main className="detail-shell"><ErrorState message="That address doesn't point to a story." /></main>;
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route element={<JournalPage />} path="/" />
        <Route element={<PostPage />} path="/posts/:slug" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </div>
  );
}
