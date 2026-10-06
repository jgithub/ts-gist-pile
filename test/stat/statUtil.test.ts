import { expect } from 'chai';
import { sendStatToKpitracks } from '../../src/stat/statUtil';

// The KPI Tracks key goes in the POST body and NEVER in a log line. Until 0.0.334 both log lines printed the body
// with `&ezkey=<the key>` appended, so the credential reached stdout on every send (#109's review).
describe('sendStatToKpitracks', () => {
  const SENTINEL_KEY = 'sentinel-ezkey-5f0c2a';
  let savedKey: string | undefined;
  let savedFetch: typeof globalThis.fetch;
  let savedLog: typeof console.log;
  let logged: string[];
  let postedBodies: string[];

  beforeEach(() => {
    savedKey = process.env.KPITRACKS_EZ_KEY;
    savedFetch = globalThis.fetch;
    savedLog = console.log;
    logged = [];
    postedBodies = [];
    process.env.KPITRACKS_EZ_KEY = SENTINEL_KEY;
    console.log = (...args: unknown[]) => { logged.push(args.map(String).join(' ')); };
  });

  afterEach(() => {
    console.log = savedLog;
    globalThis.fetch = savedFetch;
    if (savedKey === undefined) {
      delete process.env.KPITRACKS_EZ_KEY;
    } else {
      process.env.KPITRACKS_EZ_KEY = savedKey;
    }
  });

  async function send(fetchResult: 'resolve' | 'reject'): Promise<void> {
    globalThis.fetch = (async (_url: unknown, init?: { body?: unknown }) => {
      postedBodies.push(String(init?.body));
      if (fetchResult === 'reject') {
        throw new Error('network down');
      }
      return { ok: true } as Response;
    }) as typeof globalThis.fetch;
    sendStatToKpitracks('stat=signup&count=1');
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('posts the key, and logs the body without it', async () => {
    await send('resolve');

    expect(postedBodies).to.deep.equal([`stat=signup&count=1&ezkey=${SENTINEL_KEY}`]);
    expect(logged.join('\n')).to.include("requestBodyString = 'stat=signup&count=1' (ezkey not printed)");
    expect(logged.join('\n')).to.not.include(SENTINEL_KEY);
  });

  it('logs a failed send without the key', async () => {
    await send('reject');

    expect(logged.join('\n')).to.include('Failed to send stat.  requestBodyString = stat=signup&count=1,');
    expect(logged.join('\n')).to.not.include(SENTINEL_KEY);
  });
});
