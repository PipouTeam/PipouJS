// Polyfills pour jsdom (Vuetify en a besoin)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
