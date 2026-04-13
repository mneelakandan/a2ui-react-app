/**
 * A2UI Core Engine
 * Implements the A2UI v0.9 spec: surfaces, component registry, data model, event handling.
 * Reference: https://a2ui.org
 */

// ─── Data Model ──────────────────────────────────────────────────────────────

export class A2UIDataModel {
  constructor() {
    this._store = {};
    this._listeners = [];
  }

  get(surfaceId, path = '/') {
    const surface = this._store[surfaceId] || {};
    const parts = path.replace(/^\//, '').split('/').filter(Boolean);
    return parts.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), surface);
  }

  update(surfaceId, path, value) {
    if (!this._store[surfaceId]) this._store[surfaceId] = {};
    const parts = path.replace(/^\//, '').split('/').filter(Boolean);
    let obj = this._store[surfaceId];
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    this._notify(surfaceId, path, value);
  }

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  _notify(surfaceId, path, value) {
    this._listeners.forEach(fn => fn({ surfaceId, path, value }));
  }

  snapshot(surfaceId) {
    return this._store[surfaceId] || {};
  }
}

// ─── Component Registry ───────────────────────────────────────────────────────

export class A2UIRegistry {
  constructor() {
    this._catalog = {};
  }

  register(componentType, ReactComponent) {
    this._catalog[componentType] = ReactComponent;
  }

  resolve(componentType) {
    return this._catalog[componentType] || null;
  }

  listTypes() {
    return Object.keys(this._catalog);
  }
}

// ─── Surface Manager ─────────────────────────────────────────────────────────

export class A2UISurfaceManager {
  constructor() {
    this._surfaces = {};
    this._listeners = [];
  }

  createSurface(surfaceId, catalogId) {
    this._surfaces[surfaceId] = { surfaceId, catalogId, components: {}, root: null };
    this._notify();
  }

  updateComponents(surfaceId, components) {
    if (!this._surfaces[surfaceId]) return;
    components.forEach(c => {
      this._surfaces[surfaceId].components[c.id] = c;
    });
    this._notify();
  }

  setRoot(surfaceId, rootId) {
    if (!this._surfaces[surfaceId]) return;
    this._surfaces[surfaceId].root = rootId;
    this._notify();
  }

  getSurface(surfaceId) {
    return this._surfaces[surfaceId] || null;
  }

  getAllSurfaces() {
    return Object.values(this._surfaces);
  }

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  _notify() {
    this._listeners.forEach(fn => fn(this._surfaces));
  }
}

// ─── A2UI Message Processor ───────────────────────────────────────────────────

export class A2UIProcessor {
  constructor(surfaceManager, dataModel) {
    this.surfaceManager = surfaceManager;
    this.dataModel = dataModel;
  }

  processMessage(message) {
    if (!message || typeof message !== 'object') return;

    // v0.9 format
    if (message.createSurface) {
      const { surfaceId, catalogId } = message.createSurface;
      this.surfaceManager.createSurface(surfaceId, catalogId);
    }

    if (message.updateComponents) {
      const { surfaceId, components } = message.updateComponents;
      this.surfaceManager.updateComponents(surfaceId, components);
    }

    if (message.setRoot) {
      const { surfaceId, componentId } = message.setRoot;
      this.surfaceManager.setRoot(surfaceId, componentId);
    }

    if (message.updateDataModel) {
      const { surfaceId, path, value } = message.updateDataModel;
      this.dataModel.update(surfaceId, path, value);
    }

    // v0.8 compat
    if (message.surfaceUpdate) {
      const { surfaceId, components } = message.surfaceUpdate;
      if (!this.surfaceManager.getSurface(surfaceId)) {
        this.surfaceManager.createSurface(surfaceId, 'basic');
      }
      this.surfaceManager.updateComponents(surfaceId, components);
    }

    if (message.beginRendering) {
      const { surfaceId, root } = message.beginRendering;
      this.surfaceManager.setRoot(surfaceId, root);
    }

    if (message.dataModelUpdate) {
      const { surfaceId, contents } = message.dataModelUpdate;
      contents?.forEach(({ key, valueMap, valueString, valueInt, valueBool }) => {
        if (valueMap) {
          const obj = {};
          valueMap.forEach(({ key: k, valueString: vs, valueInt: vi, valueBool: vb }) => {
            obj[k] = vs ?? vi ?? vb;
          });
          this.dataModel.update(surfaceId, `/${key}`, obj);
        } else {
          this.dataModel.update(surfaceId, `/${key}`, valueString ?? valueInt ?? valueBool);
        }
      });
    }
  }

  processMessageStream(messages) {
    messages.forEach(msg => this.processMessage(msg));
  }
}

// ─── Built-in Catalog (Basic) ─────────────────────────────────────────────────

export const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v0_9/basic_catalog.json';

export const BASIC_COMPONENT_TYPES = [
  'Text', 'Button', 'TextField', 'DateTimeInput', 'Card',
  'Row', 'Column', 'Divider', 'Image', 'Select', 'Checkbox',
  'Slider', 'Badge', 'Timeline', 'List', 'Chart'
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function resolveValue(valueSpec, dataModel, surfaceId) {
  if (!valueSpec) return undefined;
  if (typeof valueSpec === 'string' || typeof valueSpec === 'number' || typeof valueSpec === 'boolean') {
    return valueSpec;
  }
  if (valueSpec.literalString !== undefined) return valueSpec.literalString;
  if (valueSpec.literalInt !== undefined) return valueSpec.literalInt;
  if (valueSpec.literalBool !== undefined) return valueSpec.literalBool;
  if (valueSpec.path !== undefined) return dataModel.get(surfaceId, valueSpec.path);
  return undefined;
}
