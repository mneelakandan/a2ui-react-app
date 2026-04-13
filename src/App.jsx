import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, Layers, Zap, Code2, Eye, ChevronRight, Terminal, CheckCircle } from 'lucide-react';
import { A2UIProvider, useA2UI } from './hooks/useA2UI.jsx';
import { A2UISurface, A2UIComponent } from './components/A2UIRenderer.jsx';
import { JSONViewer } from './components/JSONViewer.jsx';
import { DEMOS } from './lib/sample-messages.js';
import './styles/globals.css';

// ─── Action Log ────────────────────────────────────────────────────────────────

function ActionLog({ actions }) {
  if (actions.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-4">
      <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim">Action Log</p>
      {actions.map((a, i) => (
        <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 animate-fade-in">
          <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-mono text-xs text-emerald-400">{a.actionName}</span>
            <span className="font-mono text-xs text-text-dim ml-2">on surface: {a.surfaceId}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Demo Panel ───────────────────────────────────────────────────────────────

function DemoPanel({ demo, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(demo.id)}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 group
        ${isActive
          ? 'border-accent/50 bg-accent/8 shadow-md shadow-accent/10'
          : 'border-border hover:border-accent/30 hover:bg-white/[0.02]'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{demo.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-body text-sm font-semibold truncate ${isActive ? 'text-accent-glow' : 'text-text'}`}>
            {demo.label}
          </p>
          <p className="font-body text-xs text-text-dim mt-0.5 line-clamp-2">{demo.description}</p>
        </div>
        <ChevronRight size={14} className={`shrink-0 transition-transform ${isActive ? 'text-accent rotate-90' : 'text-muted'}`} />
      </div>
    </button>
  );
}

// ─── Inner App (needs A2UIProvider) ──────────────────────────────────────────

function InnerApp({ actions, setActions }) {
  const { processor, surfaceManager } = useA2UI();
  const [activeDemo, setActiveDemo] = useState(DEMOS[0].id);
  const [tab, setTab] = useState('rendered'); // 'rendered' | 'json'
  const [streaming, setStreaming] = useState(false);
  const [streamIdx, setStreamIdx] = useState(0);
  const streamRef = useRef(null);

  const demo = DEMOS.find(d => d.id === activeDemo);

  // Reset surface when demo changes
  useEffect(() => {
    // Clear and restart
    setActions([]);
    setStreamIdx(0);
    setStreaming(false);
    if (streamRef.current) clearTimeout(streamRef.current);
    // Re-initialize processor
    processor.processMessageStream(demo.messages);
  }, [activeDemo]);

  // Simulate streaming effect
  const simulateStream = useCallback(() => {
    setStreaming(true);
    setStreamIdx(0);
    // Re-create surfaces
    processor.processMessageStream(demo.messages);

    let idx = 0;
    const advance = () => {
      if (idx < demo.messages.length) {
        setStreamIdx(idx + 1);
        idx++;
        streamRef.current = setTimeout(advance, 300 + Math.random() * 200);
      } else {
        setStreaming(false);
      }
    };
    advance();
  }, [demo, processor]);

  const handleAction = useCallback((action) => {
    setActions(prev => [action, ...prev].slice(0, 5));
  }, []);

  return (
    <div className="min-h-screen bg-surface font-body">
      {/* Header */}
      <header className="border-b border-border bg-panel/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Layers size={16} className="text-accent-glow" />
            </div>
            <div>
              <h1 className="font-display text-lg text-text">A2UI</h1>
              <p className="font-mono text-xs text-text-dim -mt-0.5">Agent-to-UI Protocol · React Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v0.9</span>
            <a
              href="https://github.com/google/A2UI"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-dim hover:text-text border border-border transition-all duration-200"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-4xl text-text mb-3 leading-tight">
            Agents that speak <span className="text-accent-glow italic">UI</span>
          </h2>
          <p className="font-body text-text-dim text-base leading-relaxed">
            A2UI lets AI agents generate rich, interactive interfaces as declarative JSON — no code execution, no iframes. 
            This React integration renders A2UI message streams natively using your own component catalog.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Cpu size={16} />, label: 'Framework-agnostic', value: 'React · Flutter · Angular' },
            { icon: <Zap size={16} />, label: 'Streaming updates', value: 'Incremental rendering' },
            { icon: <Code2 size={16} />, label: 'Declarative JSON', value: 'No arbitrary code exec' },
          ].map(stat => (
            <div key={stat.label} className="a2ui-surface p-4 flex items-start gap-3">
              <div className="text-accent mt-0.5">{stat.icon}</div>
              <div>
                <p className="font-body text-xs text-text-dim">{stat.label}</p>
                <p className="font-body text-sm font-medium text-text mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-[260px_1fr_340px] gap-6">
          {/* Left: Demo selector */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim px-1">Demos</p>
            {DEMOS.map(d => (
              <DemoPanel key={d.id} demo={d} isActive={activeDemo === d.id} onSelect={setActiveDemo} />
            ))}

            {/* Architecture notes */}
            <div className="mt-4 p-4 rounded-xl border border-border bg-panel">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim mb-2">How it works</p>
              {[
                'Agent outputs A2UI JSON',
                'Surface manager processes messages',
                'Registry maps types → React components',
                'Data model binds state to components',
                'Actions dispatch back to agent',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="font-mono text-xs text-accent mt-0.5">{i + 1}.</span>
                  <span className="font-body text-xs text-text-dim">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Rendered surface */}
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 bg-panel rounded-lg border border-border">
                {[
                  { id: 'rendered', icon: <Eye size={13} />, label: 'Rendered' },
                  { id: 'json', icon: <Terminal size={13} />, label: 'Message Stream' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-body font-medium transition-all duration-150 ${
                      tab === t.id ? 'bg-accent text-white shadow' : 'text-text-dim hover:text-text'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={simulateStream}
                disabled={streaming}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-panel border border-border text-xs font-body text-text-dim hover:text-text hover:border-accent/40 transition-all duration-200 disabled:opacity-50"
              >
                {streaming ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
                    Streaming {streamIdx}/{demo.messages.length}
                  </>
                ) : (
                  <>
                    <Zap size={13} className="text-accent" />
                    Simulate Stream
                  </>
                )}
              </button>
            </div>

            {/* Surface label */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted">surface_id:</span>
              <span className="font-mono text-xs text-accent-glow">{demo.surfaceId}</span>
              <span className="ml-auto font-mono text-xs text-muted">{demo.messages.length} messages</span>
            </div>

            {/* Content */}
            <div className="a2ui-surface p-6 min-h-[420px]">
              {tab === 'rendered' ? (
                <A2UISurface key={activeDemo} surfaceId={demo.surfaceId} />
              ) : (
                <JSONViewer messages={demo.messages} />
              )}
            </div>

            {/* Action log */}
            <ActionLog actions={actions} />
          </div>

          {/* Right: Spec + info */}
          <div className="flex flex-col gap-5">
            <div className="a2ui-surface p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">Current Surface State</p>
              <SurfaceInspector surfaceId={demo.surfaceId} />
            </div>

            <div className="a2ui-surface p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">Component Catalog</p>
              <div className="flex flex-wrap gap-1.5">
                {['Text', 'Button', 'TextField', 'DateTimeInput', 'Card', 'Row', 'Column', 'Select', 'Checkbox', 'Slider', 'Badge', 'List', 'Image', 'Divider'].map(t => (
                  <span key={t} className="font-mono text-xs px-2 py-0.5 rounded bg-accent/8 border border-accent/20 text-accent-glow">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="a2ui-surface p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">Quick Example</p>
              <pre className="json-line text-xs text-text-dim overflow-x-auto leading-relaxed">
                <span className="tag-keyword">{'{'}</span>{'\n'}
                {'  '}<span className="tag-key">"version"</span><span className="text-text-dim">: </span><span className="tag-string">"v0.9"</span>,{'\n'}
                {'  '}<span className="tag-key">"updateComponents"</span><span className="text-text-dim">: {'{'}</span>{'\n'}
                {'    '}<span className="tag-key">"surfaceId"</span><span className="text-text-dim">: </span><span className="tag-string">"main"</span>,{'\n'}
                {'    '}<span className="tag-key">"components"</span><span className="text-text-dim">: [...]</span>{'\n'}
                {'  '}<span className="tag-keyword">{'}'}</span>{'\n'}
                <span className="tag-keyword">{'}'}</span>
              </pre>
            </div>

            <div className="a2ui-surface p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim mb-3">Deploy on Cloud Run</p>
              <div className="flex flex-col gap-2">
                {[
                  { cmd: 'npm run build', desc: 'Build static assets' },
                  { cmd: 'docker build -t a2ui .', desc: 'Build container' },
                  { cmd: 'gcloud run deploy', desc: 'Deploy to Cloud Run' },
                ].map(({ cmd, desc }) => (
                  <div key={cmd} className="flex flex-col gap-0.5">
                    <code className="font-mono text-xs text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded border border-emerald-500/20">
                      $ {cmd}
                    </code>
                    <span className="font-body text-xs text-muted px-1">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6 px-6 text-center">
        <p className="font-mono text-xs text-muted">
          A2UI is Apache 2.0 licensed · Created by Google ·{' '}
          <a href="https://a2ui.org" className="text-accent-glow hover:underline" target="_blank" rel="noreferrer">a2ui.org</a>
          {' '}· React integration sample
        </p>
      </footer>
    </div>
  );
}

// ─── Surface Inspector ────────────────────────────────────────────────────────

function SurfaceInspector({ surfaceId }) {
  const { surfaceManager, dataModel } = useA2UI();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = surfaceManager.subscribe(() => forceUpdate(n => n + 1));
    return unsub;
  }, [surfaceManager]);

  const surface = surfaceManager.getSurface(surfaceId);
  const data = dataModel.snapshot(surfaceId);
  const compCount = surface ? Object.keys(surface.components).length : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-text-dim">Surface ID</span>
        <span className="text-accent-glow">{surfaceId}</span>
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-text-dim">Components</span>
        <span className="text-text">{compCount}</span>
      </div>
      <div className="flex justify-between text-xs font-mono">
        <span className="text-text-dim">Root</span>
        <span className="text-text">{surface?.root || '—'}</span>
      </div>
      {Object.keys(data).length > 0 && (
        <>
          <div className="border-t border-border my-1" />
          <p className="font-mono text-xs text-text-dim">Data Model</p>
          <pre className="font-mono text-xs text-text-dim overflow-x-auto bg-surface rounded-lg p-2 border border-border">
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [actions, setActions] = useState([]);

  const handleAction = useCallback((action) => {
    setActions(prev => [action, ...prev].slice(0, 5));
  }, []);

  return (
    <A2UIProvider onAction={handleAction}>
      <InnerApp actions={actions} setActions={setActions} />
    </A2UIProvider>
  );
}
