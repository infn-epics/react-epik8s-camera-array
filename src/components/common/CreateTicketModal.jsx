/**
 * CreateTicketModal — Create GitHub/GitLab issues from anywhere in the app.
 *
 * Supports context-aware ticket creation for:
 *  - Devices (pre-fills device info)
 *  - Services (pre-fills service info)
 *  - Beamline general (freeform)
 *
 * Features:
 *  - File attachments via drag-drop or file picker
 *  - Display snapshot (screenshot) support
 *  - Automatic metadata from device/service context
 */
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { createIssue, buildIssueBody, uploadAttachments, ISSUE_LABELS } from '../../services/ticketApi.js';

export default function CreateTicketModal({ onClose, deviceInfo, serviceInfo, initialSnapshot }) {
  const { token, user, repoInfo, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const [title, setTitle] = useState(() => {
    if (deviceInfo) return `[${deviceInfo.name}] `;
    if (serviceInfo) return `[${serviceInfo.name}] `;
    return '';
  });
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState(() => {
    if (deviceInfo) return ['device'];
    if (serviceInfo) return ['service'];
    return ['beamline'];
  });
  const [attachments, setAttachments] = useState(() => {
    if (initialSnapshot) return [initialSnapshot];
    return [];
  });
  const [dragOver, setDragOver] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const toggleLabel = (label) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  /* ── File handling ────────────────────────── */
  const addFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).filter(f => {
      // Limit individual file to 10MB
      if (f.size > 10 * 1024 * 1024) return false;
      // Avoid duplicates
      return !attachments.some(a => a.name === f.name && a.size === f.size);
    });
    if (newFiles.length) setAttachments(prev => [...prev, ...newFiles]);
  }, [attachments]);

  const removeAttachment = useCallback((idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  /* ── Snapshot capture ─────────────────────── */
  const captureSnapshot = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, { useCORS: true, scale: 1 });
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `snapshot-${Date.now()}.png`, { type: 'image/png' });
          setAttachments(prev => [...prev, file]);
        }
      }, 'image/png');
    } catch {
      // html2canvas not available — silently skip
    }
  }, []);

  /* ── Create issue with attachments ────────── */
  const previewBody = useMemo(() => buildIssueBody({
    description,
    deviceInfo,
    serviceInfo,
    user,
  }), [description, deviceInfo, serviceInfo, user]);

  const handleCreate = async () => {
    if (!title.trim() || !isAuthenticated || !repoInfo) return;
    setCreating(true);
    setError(null);
    try {
      let body = previewBody;

      // Upload attachments and append markdown
      if (attachments.length > 0) {
        setUploadProgress(`Uploading ${attachments.length} file(s)…`);
        const uploaded = await uploadAttachments(repoInfo, token, attachments);
        const attachmentSection = [
          '',
          '### 📎 Attachments',
          ...uploaded.map(u => u.markdown),
        ].join('\n');
        body += attachmentSection;
      }

      setUploadProgress('Creating issue…');
      const issue = await createIssue(repoInfo, token, {
        title: title.trim(),
        body,
        labels: selectedLabels,
      });
      setResult(issue);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
      setUploadProgress('');
    }
  };

  /* ── Helper: thumbnail preview ────────────── */
  const AttachmentThumbnail = ({ file, idx }) => {
    const [preview, setPreview] = useState(null);
    useEffect(() => {
      if (file.type?.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      }
    }, [file]);
    return (
      <div className="ticket-attachment-item">
        {preview ? (
          <img src={preview} alt={file.name} className="ticket-attachment-thumb" />
        ) : (
          <div className="ticket-attachment-icon">📄</div>
        )}
        <span className="ticket-attachment-name" title={file.name}>{file.name}</span>
        <span className="ticket-attachment-size">{(file.size / 1024).toFixed(0)} KB</span>
        <button className="ticket-attachment-remove" onClick={() => removeAttachment(idx)} title="Remove">✕</button>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="widget-modal-overlay" onClick={onClose}>
        <div className="widget-modal ticket-modal" onClick={e => e.stopPropagation()}>
          <div className="widget-modal-header">
            <span className="widget-title">🎫 Create Ticket</span>
            <button className="widget-btn" onClick={onClose}>✕</button>
          </div>
          <div className="widget-modal-body">
            <div className="ticket-auth-required">
              <p>🔑 Authentication required to create tickets.</p>
              <p>Please provide a PAT in Settings → Authentication.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!repoInfo) {
    return (
      <div className="widget-modal-overlay" onClick={onClose}>
        <div className="widget-modal ticket-modal" onClick={e => e.stopPropagation()}>
          <div className="widget-modal-header">
            <span className="widget-title">🎫 Create Ticket</span>
            <button className="widget-btn" onClick={onClose}>✕</button>
          </div>
          <div className="widget-modal-body">
            <div className="ticket-auth-required">
              <p>No repository configured (<code>giturl</code> missing in values.yaml).</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-modal-overlay" onClick={onClose}>
      <div className="widget-modal ticket-modal ticket-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="widget-modal-header">
          <span className="widget-title">
            🎫 Create Ticket — {repoInfo.platform === 'github' ? '🐙' : '🦊'} {repoInfo.projectPath}
          </span>
          <button className="widget-btn" onClick={onClose}>✕</button>
        </div>
        <div className="widget-modal-body">
          {result ? (
            <div className="ticket-success">
              <div className="ticket-success-icon">✓</div>
              <h4>Ticket Created!</h4>
              <p><strong>#{result.id}</strong> — {result.title}</p>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="ticket-link">
                Open in {repoInfo.platform === 'github' ? 'GitHub' : 'GitLab'} →
              </a>
              <button className="bl-btn bl-btn--sm" onClick={onClose} style={{ marginTop: 12 }}>Close</button>
            </div>
          ) : (
            <>
              <div className="bl-tpl-field">
                <label className="bl-tpl-field-label">Title</label>
                <input className="settings-input" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Issue title..." autoFocus />
              </div>

              <div className="bl-tpl-field">
                <label className="bl-tpl-field-label">Description</label>
                <textarea className="settings-input ticket-description" rows={5} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the issue..." />
              </div>

              <div className="bl-tpl-field">
                <label className="bl-tpl-field-label">Labels</label>
                <div className="ticket-labels">
                  {ISSUE_LABELS.map(l => (
                    <button key={l.name}
                      className={`ticket-label-chip ${selectedLabels.includes(l.name) ? 'active' : ''}`}
                      onClick={() => toggleLabel(l.name)}
                      style={{ '--label-color': l.color }}>
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div className="bl-tpl-field">
                <label className="bl-tpl-field-label">
                  Attachments
                  <button className="ticket-snapshot-btn" onClick={captureSnapshot} title="Capture page snapshot">
                    📸 Snapshot
                  </button>
                </label>
                <div
                  ref={dropRef}
                  className={`ticket-dropzone ${dragOver ? 'ticket-dropzone--active' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>📎 Drop files here or click to browse</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                  />
                </div>
                {attachments.length > 0 && (
                  <div className="ticket-attachment-list">
                    {attachments.map((f, i) => <AttachmentThumbnail key={`${f.name}-${i}`} file={f} idx={i} />)}
                  </div>
                )}
              </div>

              {/* Context preview */}
              {(deviceInfo || serviceInfo) && (
                <div className="bl-tpl-field">
                  <label className="bl-tpl-field-label">Context (auto-filled)</label>
                  <div className="ticket-context-preview">
                    {deviceInfo && (
                      <div>📟 <strong>{deviceInfo.name}</strong> — {deviceInfo.family} · {deviceInfo.iocName || 'no IOC'}
                        {deviceInfo.pvPrefix && <span> · PV: {deviceInfo.pvPrefix}</span>}
                        {deviceInfo.zone && <span> · Zone: {deviceInfo.zone}</span>}
                      </div>
                    )}
                    {serviceInfo && (
                      <div>🔌 <strong>{serviceInfo.name}</strong> — {serviceInfo.type || 'service'}</div>
                    )}
                  </div>
                </div>
              )}

              {error && <div className="bl-editor-flash bl-editor-flash--err">{error}</div>}
              {uploadProgress && <div className="ticket-upload-progress">⟳ {uploadProgress}</div>}

              <div className="bll-picker-actions">
                <button className="bl-btn bl-btn--sm" onClick={onClose}>Cancel</button>
                <button className="bl-btn bl-btn--sm bl-btn--primary" onClick={handleCreate}
                  disabled={!title.trim() || creating}>
                  {creating ? '⟳ Creating…' : `🎫 Create Ticket${attachments.length ? ` (${attachments.length} files)` : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
