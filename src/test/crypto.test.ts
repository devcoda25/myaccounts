import { describe, it, expect } from 'vitest';

describe('Crypto Environment', () => {
  it('should have crypto available', () => {
    const hasWindowCrypto = typeof window !== 'undefined' && !!window.crypto;
    const hasGlobalCrypto = typeof global !== 'undefined' && !!global.crypto;

    console.log('Has window.crypto:', hasWindowCrypto);
    console.log('Has global.crypto:', hasGlobalCrypto);

    expect(hasWindowCrypto || hasGlobalCrypto).toBe(true);
  });
});
