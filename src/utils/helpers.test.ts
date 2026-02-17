import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeRandomBytes } from './helpers';

describe('safeRandomBytes', () => {
  const originalCrypto = global.crypto;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Ensure crypto is available by default (jsdom provides it, but we want to be sure)
    if (!global.crypto) {
        vi.stubGlobal('crypto', {
            getRandomValues: (buffer: Uint8Array) => {
                for (let i = 0; i < buffer.length; i++) {
                    buffer[i] = Math.floor(Math.random() * 256);
                }
                return buffer;
            }
        });
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return a Uint8Array of the correct length', () => {
    const bytes = safeRandomBytes(16);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(16);
  });

  it('should throw an error if crypto is unavailable', () => {
    // Mock crypto to be undefined to simulate environment without crypto support
    vi.stubGlobal('crypto', undefined);
    // Also need to handle window.crypto if the function checks window explicitly
    vi.stubGlobal('window', { crypto: undefined });

    expect(() => safeRandomBytes(10)).toThrow(/Secure random number generation is not available/);
  });

  it('should throw an error if crypto.getRandomValues throws', () => {
    vi.stubGlobal('crypto', {
        getRandomValues: () => {
            throw new Error('QuotaExceededError');
        }
    });
    vi.stubGlobal('window', {
        crypto: {
            getRandomValues: () => {
                throw new Error('QuotaExceededError');
            }
        }
    });

    expect(() => safeRandomBytes(10)).toThrow(/Secure random number generation is not available/);
  });
});
