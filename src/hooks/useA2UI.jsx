import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  A2UIDataModel,
  A2UIRegistry,
  A2UISurfaceManager,
  A2UIProcessor,
} from '../lib/a2ui-engine.js';

// ─── Context ─────────────────────────────────────────────────────────────────

const A2UIContext = createContext(null);

export function A2UIProvider({ children, onAction }) {
  const dataModel = useRef(new A2UIDataModel()).current;
  const registry = useRef(new A2UIRegistry()).current;
  const surfaceManager = useRef(new A2UISurfaceManager()).current;
  const processor = useRef(new A2UIProcessor(surfaceManager, dataModel)).current;

  const [surfaces, setSurfaces] = useState({});
  const [dataSnapshot, setDataSnapshot] = useState({});

  useEffect(() => {
    const unsub1 = surfaceManager.subscribe(s => setSurfaces({ ...s }));
    const unsub2 = dataModel.subscribe(() => {
      // Collect all surface snapshots
      const snap = {};
      Object.keys(surfaces).forEach(id => { snap[id] = dataModel.snapshot(id); });
      setDataSnapshot({ ...snap });
    });
    return () => { unsub1(); unsub2(); };
  }, [surfaces]);

  const dispatch = useCallback((action) => {
    onAction && onAction(action);
  }, [onAction]);

  return (
    <A2UIContext.Provider value={{ dataModel, registry, surfaceManager, processor, surfaces, dataSnapshot, dispatch }}>
      {children}
    </A2UIContext.Provider>
  );
}

export function useA2UI() {
  const ctx = useContext(A2UIContext);
  if (!ctx) throw new Error('useA2UI must be used within A2UIProvider');
  return ctx;
}

// ─── Hook: load messages ─────────────────────────────────────────────────────

export function useA2UIMessages(messages) {
  const { processor } = useA2UI();
  useEffect(() => {
    if (messages && messages.length > 0) {
      processor.processMessageStream(messages);
    }
  }, [messages, processor]);
}

// ─── Hook: data model value ───────────────────────────────────────────────────

export function useDataValue(surfaceId, path) {
  const { dataModel } = useA2UI();
  const [value, setValue] = useState(() => dataModel.get(surfaceId, path));

  useEffect(() => {
    return dataModel.subscribe(({ surfaceId: sid }) => {
      if (sid === surfaceId) setValue(dataModel.get(surfaceId, path));
    });
  }, [dataModel, surfaceId, path]);

  return value;
}
