/**
 * Sample A2UI message payloads (v0.9 spec)
 * These simulate what a real agent would stream back.
 */

export const RESTAURANT_BOOKING_MESSAGES = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'booking',
      catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'booking',
      components: [
        { id: 'title', component: { Text: { text: { literalString: 'Book Your Table' }, usageHint: 'h1' } } },
        { id: 'subtitle', component: { Text: { text: { literalString: 'Reserve at La Maison — Michelin-starred dining in central Bangalore' }, usageHint: 'body' } } },
        { id: 'divider1', component: { Divider: {} } },
        { id: 'date-input', component: { DateTimeInput: { label: { literalString: 'Date & Time' }, value: { path: '/booking/datetime' }, enableDate: true, enableTime: true } } },
        { id: 'guest-label', component: { Text: { text: { literalString: 'Number of Guests' }, usageHint: 'label' } } },
        { id: 'guest-select', component: { Select: { label: { literalString: 'Party Size' }, value: { path: '/booking/guests' }, options: [
          { value: '1', label: '1 person' },
          { value: '2', label: '2 people' },
          { value: '3', label: '3 people' },
          { value: '4', label: '4 people' },
          { value: '6', label: '6 people' },
          { value: '8', label: '8 people (private dining)' },
        ] } } },
        { id: 'name-input', component: { TextField: { label: { literalString: 'Name on Reservation' }, value: { path: '/booking/name' }, placeholder: 'e.g. Aditya Sharma' } } },
        { id: 'notes-input', component: { TextField: { label: { literalString: 'Special Requests' }, value: { path: '/booking/notes' }, placeholder: 'Dietary restrictions, occasion, seating preference...' } } },
        { id: 'veg-check', component: { Checkbox: { label: { literalString: 'Vegetarian menu preferred' }, value: { path: '/booking/vegetarian' } } } },
        { id: 'badge-avail', component: { Badge: { label: { literalString: '● Available' }, color: 'success' } } },
        { id: 'badge-slots', component: { Badge: { label: { literalString: '3 slots left tonight' }, color: 'warning' } } },
        { id: 'badges-row', component: { Row: { children: ['badge-avail', 'badge-slots'], gap: 2 } } },
        { id: 'divider2', component: { Divider: {} } },
        { id: 'cancel-text', component: { Text: { text: { literalString: 'Cancel' } } } },
        { id: 'cancel-btn', component: { Button: { child: 'cancel-text', action: { name: 'cancel_booking' }, variant: 'ghost' } } },
        { id: 'confirm-text', component: { Text: { text: { literalString: 'Confirm Reservation' } } } },
        { id: 'confirm-btn', component: { Button: { child: 'confirm-text', action: { name: 'confirm_booking' }, variant: 'primary' } } },
        { id: 'actions-row', component: { Row: { children: ['cancel-btn', 'confirm-btn'], gap: 3, align: 'center' } } },
        {
          id: 'root-column',
          component: {
            Column: {
              children: ['title', 'subtitle', 'divider1', 'date-input', 'guest-select', 'name-input', 'notes-input', 'veg-check', 'badges-row', 'divider2', 'actions-row'],
              gap: 4,
            },
          },
        },
      ],
    },
  },
  {
    version: 'v0.9',
    setRoot: { surfaceId: 'booking', componentId: 'root-column' },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'booking',
      path: '/booking',
      value: { datetime: '', guests: '2', name: '', notes: '', vegetarian: false },
    },
  },
];

export const CONTACT_LOOKUP_MESSAGES = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'contact',
      catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'contact',
      components: [
        { id: 'title', component: { Text: { text: { literalString: 'Contact Lookup' }, usageHint: 'h2' } } },
        { id: 'search-field', component: { TextField: { label: { literalString: 'Search by name or email' }, value: { path: '/query/term' }, placeholder: 'Type to search...' } } },
        { id: 'filter-label', component: { Text: { text: { literalString: 'Filter by department' }, usageHint: 'label' } } },
        { id: 'dept-select', component: { Select: { label: { literalString: 'Department' }, value: { path: '/query/dept' }, options: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'design', label: 'Design' },
          { value: 'product', label: 'Product' },
          { value: 'sales', label: 'Sales' },
        ] } } },
        { id: 'search-text', component: { Text: { text: { literalString: 'Search' } } } },
        { id: 'search-btn', component: { Button: { child: 'search-text', action: { name: 'search_contact' }, variant: 'primary' } } },
        { id: 'results-label', component: { Text: { text: { literalString: 'Results' }, usageHint: 'label' } } },
        { id: 'results-list', component: { List: { items: [
          { literalString: 'Priya Nair — priya@corp.com — Engineering' },
          { literalString: 'Rohan Mehta — rohan@corp.com — Product' },
          { literalString: 'Kavya Reddy — kavya@corp.com — Design' },
        ] } } },
        {
          id: 'root-column',
          component: {
            Column: { children: ['title', 'search-field', 'dept-select', 'search-btn', 'results-label', 'results-list'], gap: 4 },
          },
        },
      ],
    },
  },
  {
    version: 'v0.9',
    setRoot: { surfaceId: 'contact', componentId: 'root-column' },
  },
];

export const AGENT_SETTINGS_MESSAGES = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'settings',
      catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'settings',
      components: [
        { id: 'title', component: { Text: { text: { literalString: 'Agent Configuration' }, usageHint: 'h2' } } },
        { id: 'subtitle', component: { Text: { text: { literalString: 'Adjust the agent runtime parameters.' }, usageHint: 'body' } } },
        { id: 'temp-slider', component: { Slider: { label: { literalString: 'Temperature' }, value: { path: '/config/temperature' }, min: 0, max: 100 } } },
        { id: 'tokens-slider', component: { Slider: { label: { literalString: 'Max Tokens' }, value: { path: '/config/maxTokens' }, min: 256, max: 4096 } } },
        { id: 'model-select', component: { Select: { label: { literalString: 'Model' }, value: { path: '/config/model' }, options: [
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
          { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' },
        ] } } },
        { id: 'stream-check', component: { Checkbox: { label: { literalString: 'Enable streaming responses' }, value: { path: '/config/streaming' } } } },
        { id: 'save-text', component: { Text: { text: { literalString: 'Save Configuration' } } } },
        { id: 'save-btn', component: { Button: { child: 'save-text', action: { name: 'save_config' }, variant: 'primary' } } },
        { id: 'badge-saved', component: { Badge: { label: { literalString: 'Unsaved changes' }, color: 'warning' } } },
        { id: 'badge-row', component: { Row: { children: ['badge-saved'], gap: 2 } } },
        { id: 'root-col', component: { Column: { children: ['title', 'subtitle', 'temp-slider', 'tokens-slider', 'model-select', 'stream-check', 'badge-row', 'save-btn'], gap: 5 } } },
      ],
    },
  },
  {
    version: 'v0.9',
    setRoot: { surfaceId: 'settings', componentId: 'root-col' },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'settings',
      path: '/config',
      value: { temperature: 70, maxTokens: 1024, model: 'gemini-2.0-flash', streaming: true },
    },
  },
];

export const DEMOS = [
  {
    id: 'restaurant',
    label: 'Restaurant Booking',
    description: 'Agent generates a reservation form with date picker, guest selector, and special requests.',
    messages: RESTAURANT_BOOKING_MESSAGES,
    surfaceId: 'booking',
    icon: '🍽️',
  },
  {
    id: 'contact',
    label: 'Contact Lookup',
    description: 'Agent renders a search form with filters and result list for finding colleagues.',
    messages: CONTACT_LOOKUP_MESSAGES,
    surfaceId: 'contact',
    icon: '👤',
  },
  {
    id: 'settings',
    label: 'Agent Settings',
    description: 'Agent generates a configuration panel with sliders, dropdowns, and toggles.',
    messages: AGENT_SETTINGS_MESSAGES,
    surfaceId: 'settings',
    icon: '⚙️',
  },
];
