import { expect } from 'chai';
import { sendStatToKpitracks } from '../../src/stat/statUtil';

// The KPI Tracks key goes in the POST body and NEVER in a log line. Until 0.0.334 both log lines printed the body
// with `&ezkey=<the key>` appended, so the credential reached stdout on every send (#109's review).
describe('sendStatToKpitracks', () => {
  const SENTINEL_KEY = 'sentinel-ezkey-5f0c2a';
  const CONFIGURED_URL = 'https://stats.example.test/c';
  let savedKey: string | undefined;
  let savedUrl: string | undefined;
  let postedUrls: string[];
  let savedFetch: typeof globalThis.fetch;
  let savedLog: typeof console.log;
  let logged: string[];
  let postedBodies: string[];

  beforeEach(() => {
    savedKey = process.env.KPITRACKS_EZ_KEY;
    savedUrl = process.env.KPITRACKS_STAT_URL;
    postedUrls = [];
    savedFetch = globalThis.fetch;
    savedLog = console.log;
    logged = [];
    postedBodies = [];
    process.env.KPITRACKS_EZ_KEY = SENTINEL_KEY;
    process.env.KPITRACKS_STAT_URL = CONFIGURED_URL;
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
    if (savedUrl === undefined) {
      delete process.env.KPITRACKS_STAT_URL;
    } else {
      process.env.KPITRACKS_STAT_URL = savedUrl;
    }
  });

  async function send(fetchResult: 'resolve' | 'reject'): Promise<void> {
    globalThis.fetch = (async (url: unknown, init?: { body?: unknown }) => {
      postedUrls.push(String(url));
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

  // The destination is configuration, never a literal in the library: the browser bundle ships this code to every page, and a
  // built-in host name would travel with it (unframed.sh's source scan found one).
  it('posts to the configured URL', async () => {
    await send('resolve');

    expect(postedUrls).to.deep.equal([CONFIGURED_URL]);
  });

  it('sends nothing when KPITRACKS_STAT_URL is unset, even with a key', async () => {
    delete process.env.KPITRACKS_STAT_URL;

    await send('resolve');

    expect(postedUrls).to.deep.equal([]);
  });
});

// A key with no destination is a misconfiguration that drops every stat. It must not be silent (0.0.336's review, should-fix 1):
// one warning per process, naming the missing setting, never the key and never a built-in host.
describe('sendStatToKpitracks with a key but no KPITRACKS_STAT_URL', () => {
  const SENTINEL_KEY = 'sentinel-ezkey-9b1d4e';
  const MODULE_PATH = '../../src/stat/statUtil';
  let savedKey: string | undefined;
  let savedUrl: string | undefined;
  let savedFetch: typeof globalThis.fetch;
  let savedLog: typeof console.log;
  let logged: string[];
  let fetchCalls: number;

  // The warning is once per process, so each test loads a fresh copy of the module.
  function freshSendStatToKpitracks(): (body: string) => void {
    delete require.cache[require.resolve(MODULE_PATH)];
    return require(MODULE_PATH).sendStatToKpitracks;
  }

  beforeEach(() => {
    savedKey = process.env.KPITRACKS_EZ_KEY;
    savedUrl = process.env.KPITRACKS_STAT_URL;
    savedFetch = globalThis.fetch;
    savedLog = console.log;
    logged = [];
    fetchCalls = 0;
    delete process.env.KPITRACKS_STAT_URL;
    process.env.KPITRACKS_EZ_KEY = SENTINEL_KEY;
    globalThis.fetch = (async () => { fetchCalls += 1; return {} as Response; }) as typeof globalThis.fetch;
    console.log = (...args: unknown[]) => { logged.push(args.map(String).join(' ')); };
  });

  afterEach(() => {
    globalThis.fetch = savedFetch;
    console.log = savedLog;
    if (savedKey === undefined) { delete process.env.KPITRACKS_EZ_KEY; } else { process.env.KPITRACKS_EZ_KEY = savedKey; }
    if (savedUrl === undefined) { delete process.env.KPITRACKS_STAT_URL; } else { process.env.KPITRACKS_STAT_URL = savedUrl; }
  });

  it('warns that KPITRACKS_STAT_URL is missing, and sends nothing', () => {
    freshSendStatToKpitracks()('stat=signup&count=1');

    expect(fetchCalls).to.equal(0);
    expect(logged).to.have.length(1);
    expect(logged[0]).to.include('KPITRACKS_EZ_KEY is set but KPITRACKS_STAT_URL is not');
  });

  it('warns once per process, not once per stat', () => {
    const send = freshSendStatToKpitracks();

    send('stat=a&count=1');
    send('stat=b&count=1');
    send('stat=c&count=1');

    expect(logged).to.have.length(1);
  });

  it('never prints the key or a host name in the warning', () => {
    freshSendStatToKpitracks()('stat=signup&count=1');

    expect(logged.join('\n')).to.not.include(SENTINEL_KEY);
    expect(logged.join('\n')).to.not.match(/https?:\/\//);
  });

  it('is silent when no key is set: no key means stats are deliberately off', () => {
    delete process.env.KPITRACKS_EZ_KEY;

    freshSendStatToKpitracks()('stat=signup&count=1');

    expect(logged).to.deep.equal([]);
    expect(fetchCalls).to.equal(0);
  });

  it('does not warn when both the key and the URL are set', () => {
    process.env.KPITRACKS_STAT_URL = 'https://stats.example.test/c';

    freshSendStatToKpitracks()('stat=signup&count=1');

    expect(logged.join('\n')).to.not.include('is set but KPITRACKS_STAT_URL is not');
  });
});
