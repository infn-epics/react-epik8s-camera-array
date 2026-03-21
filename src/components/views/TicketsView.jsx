/**
 * TicketsView — Browse, filter, and categorize tickets for the connected
 * GitHub/GitLab beamline repository.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listIssues, ISSUE_LABELS } from '../../services/ticketApi.js';
import CreateTicketModal from '../common/CreateTicketModal.jsx';

const STATES = ['open', 'closed', 'all'];
const PAGE_SIZE = 20;

export default function TicketsView() {
  const { token, repoInfo, isAuthenticated } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [stateFilter, setStateFilter] = useState('open');
  const [labelFilter, setLabelFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  /* ── Fetch issues ───────────────────────── */
  const fetchIssues = useCallback(async (pageNum = 1, append = false) => {
    if (!isAuthenticated || !repoInfo) return;
    setLoading(true);
    setError(null);
    try {
      const opts = {
        state: stateFilter === 'all' ? undefined : stateFilter,
        labels: labelFilter ? [labelFilter] : undefined,
        perPage: PAGE_SIZE,
        page: pageNum,
      };
      const data = await listIssues(repoInfo, token, opts);
      setIssues(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, repoInfo, token, stateFilter, labelFilter]);

  useEffect(() => {
    fetchIssues(1);
  }, [fetchIssues]);

  const loadMore = () => fetchIssues(page + 1, true);

  /* ── Client-side search filter ──────────── */
  const filteredIssues = useMemo(() => {
    if (!search.trim()) return issues;
    const q = search.toLowerCase();
    return issues.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.author?.toLowerCase().includes(q) ||
      String(i.id).includes(q)
    );
  }, [issues, search]);

  /* ── Label stats ────────────────────────── */
  const labelCounts = useMemo(() => {
    const counts = {};
    issues.forEach(i => {
      (i.labels || []).forEach(l => {
        counts[l] = (counts[l] || 0) + 1;
      });
    });
    return counts;
  }, [issues]);

  /* ── Time helpers ───────────────────────── */
  const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  /* ── Not authenticated ──────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="tickets-view">
        <div className="tickets-empty">
          <div className="tickets-empty-icon">🎫</div>
          <h3>Tickets</h3>
          <p>Authenticate with a PAT in Settings to browse repository issues.</p>
        </div>
      </div>
    );
  }

  if (!repoInfo) {
    return (
      <div className="tickets-view">
        <div className="tickets-empty">
          <div className="tickets-empty-icon">🎫</div>
          <h3>No Repository</h3>
          <p>No <code>giturl</code> configured in values.yaml.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-view">
      {/* Header */}
      <div className="tickets-header">
        <div className="tickets-header-left">
          <h2>🎫 Tickets</h2>
          <span className="tickets-repo">
            {repoInfo.platform === 'github' ? '🐙' : '🦊'} {repoInfo.projectPath}
          </span>
        </div>
        <div className="tickets-header-right">
          <button className="bl-btn bl-btn--sm bl-btn--primary" onClick={() => setShowCreate(true)}>
            + New Ticket
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="tickets-toolbar">
        {/* State filter */}
        <div className="tickets-state-tabs">
          {STATES.map(s => (
            <button key={s}
              className={`tickets-state-tab ${stateFilter === s ? 'active' : ''}`}
              onClick={() => setStateFilter(s)}>
              {s === 'open' ? '🟢' : s === 'closed' ? '🔴' : '⚪'} {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          className="settings-input tickets-search"
          placeholder="Filter by title, author, or #id…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Label categories */}
      <div className="tickets-label-bar">
        <button
          className={`ticket-label-chip ${!labelFilter ? 'active' : ''}`}
          onClick={() => setLabelFilter(null)}
          style={{ '--label-color': '#888' }}>
          All ({issues.length})
        </button>
        {ISSUE_LABELS.map(l => (
          <button key={l.name}
            className={`ticket-label-chip ${labelFilter === l.name ? 'active' : ''}`}
            onClick={() => setLabelFilter(labelFilter === l.name ? null : l.name)}
            style={{ '--label-color': l.color }}>
            {l.name} {labelCounts[l.name] ? `(${labelCounts[l.name]})` : ''}
          </button>
        ))}
      </div>

      {/* Issue list */}
      {error && <div className="bl-editor-flash bl-editor-flash--err">{error}</div>}

      <div className="tickets-list">
        {filteredIssues.map(issue => (
          <a
            key={issue.id}
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`tickets-item ${issue.state === 'closed' || issue.state === 'merged' ? 'tickets-item--closed' : ''}`}
          >
            <div className="tickets-item-icon">
              {issue.state === 'open' || issue.state === 'opened' ? '🟢' : '🔴'}
            </div>
            <div className="tickets-item-body">
              <div className="tickets-item-title">
                <strong>#{issue.id}</strong> {issue.title}
              </div>
              <div className="tickets-item-meta">
                {issue.author && <span>by @{issue.author}</span>}
                <span>{relativeTime(issue.createdAt)}</span>
              </div>
            </div>
            <div className="tickets-item-labels">
              {(issue.labels || []).map(l => {
                const def = ISSUE_LABELS.find(d => d.name === l);
                return (
                  <span key={l} className="ticket-label-chip ticket-label-chip--sm"
                    style={{ '--label-color': def?.color || '#888' }}>
                    {l}
                  </span>
                );
              })}
            </div>
          </a>
        ))}

        {filteredIssues.length === 0 && !loading && (
          <div className="tickets-empty-list">
            No issues found{labelFilter ? ` with label "${labelFilter}"` : ''}.
          </div>
        )}
      </div>

      {/* Pagination */}
      {hasMore && !loading && (
        <div className="tickets-pagination">
          <button className="bl-btn bl-btn--sm" onClick={loadMore}>Load more…</button>
        </div>
      )}

      {loading && (
        <div className="tickets-loading">⟳ Loading issues…</div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateTicketModal
          onClose={() => { setShowCreate(false); fetchIssues(1); }}
        />
      )}
    </div>
  );
}
