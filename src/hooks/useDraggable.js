import { useRef, useCallback } from 'react';

/**
 * Hook that makes a detached console panel draggable by its header.
 * Returns { panelRef, onHeaderMouseDown } — attach panelRef to the
 * `.console-panel` div and onHeaderMouseDown to the `.console-header` div.
 */
export function useDraggable(detached) {
  const panelRef = useRef(null);
  const dragging = useRef(null);

  const onHeaderMouseDown = useCallback((e) => {
    if (!detached) return;
    // Don't drag when clicking buttons or inputs inside the header
    if (e.target.closest('button, input, label')) return;

    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    dragging.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
    };

    // Switch from bottom/right positioning to top/left for free movement
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';

    const onMouseMove = (ev) => {
      if (!dragging.current) return;
      const dx = ev.clientX - dragging.current.startX;
      const dy = ev.clientY - dragging.current.startY;
      const newLeft = Math.max(0, Math.min(window.innerWidth - 100, dragging.current.origLeft + dx));
      const newTop = Math.max(0, Math.min(window.innerHeight - 40, dragging.current.origTop + dy));
      panel.style.left = `${newLeft}px`;
      panel.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      dragging.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [detached]);

  return { panelRef, onHeaderMouseDown };
}
