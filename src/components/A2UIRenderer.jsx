import { useState } from 'react';
import { resolveValue } from '../lib/a2ui-engine.js';
import { useA2UI, useDataValue } from '../hooks/useA2UI.jsx';

// ─── Component Resolver ───────────────────────────────────────────────────────

export function A2UIComponent({ componentDef, surfaceId, components }) {
  const { dispatch } = useA2UI();

  if (!componentDef) return null;

  const { id, component } = componentDef;
  if (!component) return null;

  const componentType = typeof component === 'string' ? component : Object.keys(component)[0];
  const props = typeof component === 'string' ? {} : component[componentType];

  const renderProps = { id, props, surfaceId, components, dispatch };

  switch (componentType) {
    case 'Text':       return <A2UIText {...renderProps} />;
    case 'Button':     return <A2UIButton {...renderProps} />;
    case 'TextField':  return <A2UITextField {...renderProps} />;
    case 'DateTimeInput': return <A2UIDateTimeInput {...renderProps} />;
    case 'Card':       return <A2UICard {...renderProps} />;
    case 'Row':        return <A2UIRow {...renderProps} />;
    case 'Column':     return <A2UIColumn {...renderProps} />;
    case 'Divider':    return <A2UIDivider {...renderProps} />;
    case 'Badge':      return <A2UIBadge {...renderProps} />;
    case 'Select':     return <A2UISelect {...renderProps} />;
    case 'Checkbox':   return <A2UICheckbox {...renderProps} />;
    case 'Slider':     return <A2UISlider {...renderProps} />;
    case 'List':       return <A2UIList {...renderProps} />;
    case 'Image':      return <A2UIImage {...renderProps} />;
    default:           return <UnknownComponent type={componentType} />;
  }
}

// Helper to render a child by ID
function RenderChild({ childId, surfaceId, components }) {
  if (!childId || !components) return null;
  const childDef = components[childId];
  return childDef ? <A2UIComponent componentDef={childDef} surfaceId={surfaceId} components={components} /> : null;
}

function resolveText(spec, dataModel, surfaceId) {
  if (!spec) return '';
  if (typeof spec === 'string') return spec;
  if (spec.literalString) return spec.literalString;
  return '';
}

// ─── Text ─────────────────────────────────────────────────────────────────────

function A2UIText({ id, props, surfaceId }) {
  const { dataModel } = useA2UI();
  const textSpec = props?.text;
  const hint = props?.usageHint || 'body';

  let text = '';
  if (textSpec?.literalString) text = textSpec.literalString;
  else if (textSpec?.path) text = dataModel.get(surfaceId, textSpec.path) ?? '';
  else if (typeof textSpec === 'string') text = textSpec;

  const classes = {
    h1: 'font-display text-3xl font-normal text-text leading-tight',
    h2: 'font-display text-2xl font-normal text-text',
    h3: 'font-body text-xl font-semibold text-text',
    label: 'font-body text-xs font-semibold uppercase tracking-widest text-text-dim',
    body: 'font-body text-sm text-text-dim leading-relaxed',
    caption: 'font-body text-xs text-muted',
  };

  const Tag = hint === 'h1' ? 'h1' : hint === 'h2' ? 'h2' : hint === 'h3' ? 'h3' : 'p';
  return <Tag className={`a2ui-component ${classes[hint] || classes.body}`}>{text}</Tag>;
}

// ─── Button ───────────────────────────────────────────────────────────────────

function A2UIButton({ id, props, surfaceId, components, dispatch }) {
  const child = props?.child;
  const action = props?.action;
  const variant = props?.variant || 'primary';

  const handleClick = () => {
    if (action) dispatch({ type: 'ACTION', actionName: action.name, surfaceId, payload: action.payload });
  };

  const variants = {
    primary: 'bg-accent hover:bg-accent-glow text-white border border-accent/40 shadow-lg shadow-accent/20',
    secondary: 'bg-transparent hover:bg-white/5 text-text border border-border',
    ghost: 'bg-transparent hover:bg-white/5 text-text-dim hover:text-text border border-transparent',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30',
  };

  return (
    <button
      onClick={handleClick}
      className={`a2ui-component px-5 py-2.5 rounded-lg text-sm font-medium font-body transition-all duration-200 cursor-pointer flex items-center gap-2 ${variants[variant] || variants.primary}`}
    >
      {child ? <RenderChild childId={child} surfaceId={surfaceId} components={components} /> : props?.label || 'Button'}
    </button>
  );
}

// ─── TextField ───────────────────────────────────────────────────────────────

function A2UITextField({ id, props, surfaceId }) {
  const { dataModel, dispatch } = useA2UI();
  const placeholder = props?.placeholder?.literalString || props?.placeholder || '';
  const label = props?.label?.literalString || props?.label || '';
  const valuePath = props?.value?.path;
  const [local, setLocal] = useState(() => valuePath ? dataModel.get(surfaceId, valuePath) ?? '' : '');

  const handleChange = (e) => {
    setLocal(e.target.value);
    if (valuePath) {
      dataModel.update(surfaceId, valuePath, e.target.value);
    }
    if (props?.onChange) {
      dispatch({ type: 'FIELD_CHANGE', field: id, value: e.target.value, surfaceId });
    }
  };

  return (
    <div className="a2ui-component flex flex-col gap-1.5">
      {label && <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim">{label}</label>}
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-body text-text placeholder-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
      />
    </div>
  );
}

// ─── DateTimeInput ────────────────────────────────────────────────────────────

function A2UIDateTimeInput({ id, props, surfaceId }) {
  const { dataModel } = useA2UI();
  const valuePath = props?.value?.path;
  const enableDate = props?.enableDate !== false;
  const enableTime = props?.enableTime !== false;
  const [val, setVal] = useState(() => valuePath ? dataModel.get(surfaceId, valuePath) ?? '' : '');

  const handleChange = (e) => {
    setVal(e.target.value);
    if (valuePath) dataModel.update(surfaceId, valuePath, e.target.value);
  };

  const inputType = enableDate && enableTime ? 'datetime-local' : enableDate ? 'date' : 'time';
  const label = props?.label?.literalString || props?.label || (enableDate && enableTime ? 'Date & Time' : enableDate ? 'Date' : 'Time');

  return (
    <div className="a2ui-component flex flex-col gap-1.5">
      <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim">{label}</label>
      <input
        type={inputType}
        value={val}
        onChange={handleChange}
        className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-body text-text focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all duration-200 [color-scheme:dark]"
      />
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function A2UICard({ id, props, surfaceId, components }) {
  const children = props?.children || [];
  const elevation = props?.elevation || 1;

  return (
    <div className={`a2ui-component a2ui-surface p-5 flex flex-col gap-4 ${elevation > 1 ? 'shadow-xl shadow-black/30' : ''}`}>
      {children.map(childId => (
        <RenderChild key={childId} childId={childId} surfaceId={surfaceId} components={components} />
      ))}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function A2UIRow({ props, surfaceId, components }) {
  const children = props?.children || [];
  const gap = props?.gap || 3;
  const align = props?.align || 'center';

  const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };

  return (
    <div className={`a2ui-component flex flex-row gap-${gap} ${alignMap[align] || 'items-center'} flex-wrap`}>
      {children.map(childId => (
        <RenderChild key={childId} childId={childId} surfaceId={surfaceId} components={components} />
      ))}
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function A2UIColumn({ props, surfaceId, components }) {
  const children = props?.children || [];
  const gap = props?.gap || 4;

  return (
    <div className={`a2ui-component flex flex-col gap-${gap}`}>
      {children.map(childId => (
        <RenderChild key={childId} childId={childId} surfaceId={surfaceId} components={components} />
      ))}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function A2UIDivider() {
  return <hr className="a2ui-component border-border my-1" />;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function A2UIBadge({ props }) {
  const label = props?.label?.literalString || props?.label || '';
  const color = props?.color || 'default';

  const colors = {
    default: 'bg-white/5 text-text-dim border-border',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    error:   'bg-red-500/10 text-red-400 border-red-500/30',
    info:    'bg-accent/10 text-accent-glow border-accent/30',
  };

  return (
    <span className={`a2ui-component inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${colors[color] || colors.default}`}>
      {label}
    </span>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function A2UISelect({ id, props, surfaceId }) {
  const { dataModel } = useA2UI();
  const options = props?.options || [];
  const label = props?.label?.literalString || props?.label || '';
  const valuePath = props?.value?.path;
  const [val, setVal] = useState(() => valuePath ? dataModel.get(surfaceId, valuePath) ?? '' : '');

  const handleChange = (e) => {
    setVal(e.target.value);
    if (valuePath) dataModel.update(surfaceId, valuePath, e.target.value);
  };

  return (
    <div className="a2ui-component flex flex-col gap-1.5">
      {label && <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim">{label}</label>}
      <select
        value={val}
        onChange={handleChange}
        className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-body text-text focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function A2UICheckbox({ id, props, surfaceId }) {
  const { dataModel } = useA2UI();
  const label = props?.label?.literalString || props?.label || '';
  const valuePath = props?.value?.path;
  const [checked, setChecked] = useState(() => valuePath ? !!dataModel.get(surfaceId, valuePath) : false);

  return (
    <div className="a2ui-component flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => {
          setChecked(e.target.checked);
          if (valuePath) dataModel.update(surfaceId, valuePath, e.target.checked);
        }}
        className="w-4 h-4 rounded accent-accent"
      />
      {label && <span className="font-body text-sm text-text">{label}</span>}
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function A2UISlider({ id, props, surfaceId }) {
  const { dataModel } = useA2UI();
  const label = props?.label?.literalString || props?.label || '';
  const min = props?.min ?? 0;
  const max = props?.max ?? 100;
  const valuePath = props?.value?.path;
  const [val, setVal] = useState(() => valuePath ? dataModel.get(surfaceId, valuePath) ?? min : min);

  return (
    <div className="a2ui-component flex flex-col gap-2">
      {label && (
        <div className="flex justify-between">
          <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-dim">{label}</label>
          <span className="font-mono text-xs text-accent-glow">{val}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={val}
        onChange={e => {
          const n = Number(e.target.value);
          setVal(n);
          if (valuePath) dataModel.update(surfaceId, valuePath, n);
        }}
        className="w-full accent-accent"
      />
    </div>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────

function A2UIList({ props, surfaceId, components }) {
  const items = props?.items || [];
  return (
    <ul className="a2ui-component flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm font-body text-text-dim">
          <span className="text-accent mt-0.5">▸</span>
          <span>{item?.literalString || item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────────

function A2UIImage({ props }) {
  const src = props?.src?.literalString || props?.src || '';
  const alt = props?.alt?.literalString || props?.alt || '';
  return (
    <div className="a2ui-component rounded-lg overflow-hidden border border-border">
      <img src={src} alt={alt} className="w-full object-cover" />
    </div>
  );
}

// ─── Unknown ──────────────────────────────────────────────────────────────────

function UnknownComponent({ type }) {
  return (
    <div className="a2ui-component border border-amber-500/30 bg-amber-500/5 rounded-lg px-3 py-2 text-xs font-mono text-amber-400">
      Unknown component: {type}
    </div>
  );
}

// ─── Surface Renderer ─────────────────────────────────────────────────────────

export function A2UISurface({ surfaceId }) {
  const { surfaceManager } = useA2UI();
  const [surface, setSurface] = useState(() => surfaceManager.getSurface(surfaceId));

  useState(() => {
    return surfaceManager.subscribe(() => {
      setSurface({ ...surfaceManager.getSurface(surfaceId) });
    });
  });

  if (!surface || !surface.root) {
    return (
      <div className="flex items-center justify-center h-32 text-text-dim text-sm font-body">
        <span className="shimmer px-4 py-2 rounded-lg">Waiting for agent...</span>
      </div>
    );
  }

  const rootDef = surface.components[surface.root];
  return (
    <div className="a2ui-surface-container">
      <A2UIComponent componentDef={rootDef} surfaceId={surfaceId} components={surface.components} />
    </div>
  );
}
