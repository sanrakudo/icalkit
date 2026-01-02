import { describe, it, expect } from 'vitest';
import { version } from './index.js';

describe('iCalKit Library', () => {
  it('exports version', () => {
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

  it('version follows semver format', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
