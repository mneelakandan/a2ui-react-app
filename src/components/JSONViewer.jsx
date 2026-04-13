import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function colorizeJSON(obj, indent = 0) {
  if (obj === null) return <span className="tag-bool">null</span>;
  if (typeof obj === 'boolean') return <span className="tag-bool">{String(obj)}</span>;
  if (typeof obj === 'number') return <span className="tag-number">{obj}</span>;
  if (typeof obj === 'string') return <span className="tag-string">"{obj}"</span>;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return <span className="tag-keyword">[]</span>;
    return (
      <span>
        <span className="tag-keyword">[</span>
        {obj.map((item, i) => (
          <span key={i}>
            <br />
            <span style={{ paddingLeft: `${(indent + 1) * 16}px` }}>{colorizeJSON(item, indent + 1)}</span>
            {i < obj.length - 1 && <span className="text-muted">,</span>}
          </span>
        ))}
        <br />
        <span style={{ paddingLeft: `${indent * 16}px` }}><span className="tag-keyword">]</span></span>
      </span>
    );
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return <span className="tag-keyword">{'{}'}</span>;

  return (
    <span>
      <span className="tag-keyword">{'{'}</span>
      {keys.map((key, i) => (
        <span key={key}>
          <br />
          <span style={{ paddingLeft: `${(indent + 1) * 16}px` }}>
            <span className="tag-key">"{key}"</span>
            <span className="text-text-dim">: </span>
            {colorizeJSON(obj[key], indent + 1)}
            {i < keys.length - 1 && <span className="text-muted">,</span>}
          </span>
        </span>
      ))}
      <br />
      <span style={{ paddingLeft: `${indent * 16}px` }}><span className="tag-keyword">{'}'}</span></span>
    </span>
  );
}

export function JSONViewer({ messages }) {
  const [expanded, setExpanded] = useState(new Set([0]));

  const toggle = (i) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg, i) => {
        const key = Object.keys(msg).find(k => k !== 'version') || 'message';
        const isOpen = expanded.has(i);
        return (
          <div key={i} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-panel hover:bg-white/[0.02] transition-colors text-left"
            >
              {isOpen ? (
                <ChevronDown size={14} className="text-accent shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-muted shrink-0" />
              )}
              <span className="font-mono text-xs text-accent-glow">{key}</span>
              {msg.version && (
                <span className="ml-auto font-mono text-xs text-muted">{msg.version}</span>
              )}
            </button>
            {isOpen && (
              <div className="px-4 py-3 bg-surface border-t border-border overflow-x-auto">
                <pre className="json-line text-text-dim whitespace-pre-wrap">
                  {colorizeJSON(msg)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
