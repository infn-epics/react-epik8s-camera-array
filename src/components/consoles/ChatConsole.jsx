import { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { createBackendWs } from '../../services/backendWs.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDraggable } from '../../hooks/useDraggable.js';

// Notification sound — short beep via Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* audio not available */ }
}

function isImage(name) {
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(name);
}

const MAX_MESSAGES = 500;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB per file
const MAX_ATTACHMENTS = 5;

export default function ChatConsole({ detached, onDetach, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [connected, setConnected] = useState(false);
  const [attachments, setAttachments] = useState([]); // { name, dataUrl }
  const [snapping, setSnapping] = useState(false);
  const wsRef = useRef(null);
  const listRef = useRef(null);
  const fileRef = useRef(null);
  const { panelRef, onHeaderMouseDown } = useDraggable(detached);
  const userName = user?.name || user?.login || 'anonymous';

  useEffect(() => {
    const ws = createBackendWs('/ws/chat');
    wsRef.current = ws;

    const unMsg = ws.onMessage((msg) => {
      if (msg.type !== 'chat') return;
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
      if (msg.broadcast && msg.user !== userName) {
        playNotificationSound();
      }
    });

    const unSt = ws.onStatus(setConnected);
    return () => { unMsg(); unSt(); ws.close(); };
  }, [userName]);

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // ── Send ─────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || !wsRef.current) return;
    wsRef.current.send({
      user: userName,
      text,
      broadcast: isBroadcast,
      attachments: attachments.length ? attachments : undefined,
    });
    setInput('');
    setIsBroadcast(false);
    setAttachments([]);
  }, [input, isBroadcast, userName, attachments]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── File attach ──────────────────────────────
  const handleFiles = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting same file
    for (const file of files) {
      if (attachments.length >= MAX_ATTACHMENTS) break;
      if (file.size > MAX_FILE_SIZE) continue; // silently skip too-large
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => {
          if (prev.length >= MAX_ATTACHMENTS) return prev;
          return [...prev, { name: file.name, dataUrl: reader.result }];
        });
      };
      reader.readAsDataURL(file);
    }
  }, [attachments.length]);

  const removeAttachment = useCallback((idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // ── Screenshot ───────────────────────────────
  const handleSnapshot = useCallback(async () => {
    setSnapping(true);
    try {
      // Hide all chat/system console panels during capture
      const panels = document.querySelectorAll('.console-panel');
      panels.forEach(p => { p.dataset.prevDisplay = p.style.display; p.style.display = 'none'; });

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: window.devicePixelRatio || 1,
        logging: false,
      });

      panels.forEach(p => { p.style.display = p.dataset.prevDisplay || ''; delete p.dataset.prevDisplay; });

      const dataUrl = canvas.toDataURL('image/png');
      const name = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      setAttachments(prev => {
        if (prev.length >= MAX_ATTACHMENTS) return prev;
        return [...prev, { name, dataUrl }];
      });
    } catch { /* capture failed */ }
    setSnapping(false);
  }, []);

  return (
    <div ref={panelRef} className={`console-panel chat-console ${detached ? 'console-detached' : ''}`}>
      <div className="console-header" onMouseDown={onHeaderMouseDown}>
        <span className="console-title">
          💬 Chat
          <span className={`console-conn ${connected ? 'on' : 'off'}`} />
        </span>
        <div className="console-actions">
          {!detached && (
            <button className="console-btn" onClick={onDetach} title="Pop out">⧉</button>
          )}
          <button className="console-btn" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      <div className="console-body" ref={listRef}>
        {messages.length === 0 && (
          <div className="console-empty">No messages yet</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.broadcast ? 'chat-broadcast' : ''}`}>
            <span className="chat-time">{new Date(m.ts).toLocaleTimeString()}</span>
            <span className="chat-user">{m.user}</span>
            {m.broadcast && <span className="chat-badge-broadcast">📢</span>}
            <span className="chat-text">{m.text}</span>
            {m.attachments?.length > 0 && (
              <div className="chat-attachments">
                {m.attachments.map((a, j) =>
                  isImage(a.name) ? (
                    <a key={j} href={a.dataUrl} target="_blank" rel="noopener noreferrer" className="chat-attach-img-link" title={a.name}>
                      <img src={a.dataUrl} alt={a.name} className="chat-attach-img" />
                    </a>
                  ) : (
                    <a key={j} href={a.dataUrl} download={a.name} className="chat-attach-file">
                      📄 {a.name}
                    </a>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pending attachments preview */}
      {attachments.length > 0 && (
        <div className="chat-attach-bar">
          {attachments.map((a, i) => (
            <span key={i} className="chat-attach-pill">
              {isImage(a.name) ? (
                <img src={a.dataUrl} alt={a.name} className="chat-attach-thumb" />
              ) : (
                <span className="chat-attach-name">📄 {a.name}</span>
              )}
              <button className="chat-attach-remove" onClick={() => removeAttachment(i)} title="Remove">✕</button>
            </span>
          ))}
        </div>
      )}

      <div className="console-input-row">
        <label className="chat-broadcast-toggle" title="Important broadcast (plays sound)">
          <input
            type="checkbox"
            checked={isBroadcast}
            onChange={e => setIsBroadcast(e.target.checked)}
          />
          📢
        </label>
        <button
          className="console-btn chat-action-btn"
          onClick={() => fileRef.current?.click()}
          title="Attach file (max 2 MB)"
          disabled={attachments.length >= MAX_ATTACHMENTS}
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={handleFiles}
        />
        <button
          className="console-btn chat-action-btn"
          onClick={handleSnapshot}
          title="Screenshot (hides console)"
          disabled={snapping}
        >
          {snapping ? '⏳' : '📸'}
        </button>
        <input
          className="console-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          maxLength={2000}
        />
        <button
          className="console-send-btn"
          onClick={handleSend}
          disabled={!input.trim() && attachments.length === 0}
        >
          Send
        </button>
      </div>
    </div>
  );
}
