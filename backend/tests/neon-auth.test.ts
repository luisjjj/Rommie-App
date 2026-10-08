import { describe, it, expect } from 'vitest';
import { extractBearer, getAuthConfig, verifyNeonToken } from '../src/middleware/auth.js';
import { toLifestyleMap } from '../src/schemas/requests.js';

describe('neon auth config', () => {
  it('derives the jwks url and issuer origin from the base url', () => {
    process.env.NEON_AUTH_BASE_URL = 'https://ep-x.neonauth.aws.neon.tech/neondb/auth';
    const c = getAuthConfig();
    expect(c.jwksUrl).toBe('https://ep-x.neonauth.aws.neon.tech/neondb/auth/.well-known/jwks.json');
    expect(c.issuer).toBe('https://ep-x.neonauth.aws.neon.tech');
  });

  it('fails closed when unconfigured', () => {
    delete process.env.NEON_AUTH_BASE_URL;
    expect(() => getAuthConfig()).toThrow();
  });
});

describe('bearer extraction', () => {
  it('accepts well-formed Bearer tokens', () => {
    expect(extractBearer('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('rejects missing or malformed headers', () => {
    expect(extractBearer(undefined)).toBeNull();
    expect(extractBearer('Token abc')).toBeNull();
    expect(extractBearer('Bearer ')).toBeNull();
    expect(extractBearer('Bearer    ')).toBeNull();
  });
});

describe('token verification', () => {
  it('rejects garbage tokens without network access', async () => {
    process.env.NEON_AUTH_BASE_URL = 'https://ep-x.neonauth.aws.neon.tech/neondb/auth';
    await expect(verifyNeonToken('not-a-token')).rejects.toThrow();
    await expect(verifyNeonToken('a.b')).rejects.toThrow();
  });
});

describe('lifestyle mapping', () => {
  it('exposes only preference fields, never row metadata', () => {
    expect(
      toLifestyleMap({
        id: '46e3e1c1-925c-4ff9-92cc-a47bf4dc3532',
        userId: '4f04e73c-60d1-41fd-8c8b-2d2d8dbec48',
        sleepSchedule: 'Early sleeper',
        cleanliness: null,
        updatedAt: new Date(),
      }),
    ).toEqual({ sleep_schedule: 'Early sleeper' });
  });

  it('returns undefined for missing or non-object input', () => {
    expect(toLifestyleMap(undefined)).toBeUndefined();
    expect(toLifestyleMap(null)).toBeUndefined();
    expect(toLifestyleMap('nope')).toBeUndefined();
  });
});
