import '@testing-library/jest-dom/vitest'

// Basic polyfills that some UI libs expect
Object.defineProperty(window, 'scrollTo', { value: () => { }, writable: true })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { }, // deprecated
    removeListener: () => { }, // deprecated
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => false,
  }),
})

class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}
global.ResizeObserver = ResizeObserverMock
