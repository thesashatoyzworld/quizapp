// Anthropic client of the optimizer. 23.11 (Sasha: «чтоб я на тестах не тратил АПИ»): with OPT_VIA_CLI set (a local dev server on
// Sasha's Mac, opened from the bot through a tunnel) every call goes through the local claude CLI on the subscription instead of the
// paid API. Only the text calls the optimizer makes are covered: create() and stream().finalMessage(); the stats screenshots (vision)
// stay on the API. Server only.
import Anthropic from '@anthropic-ai/sdk';

type Params = { model: string; system?: string | { type: string; text: string }[]; messages: { role: string; content: string | { type: string; text?: string }[] }[] };

const textOf = (c: Params['messages'][number]['content']) => (typeof c === 'string' ? c : c.map((b) => (b.type === 'text' ? b.text || '' : '')).join('\n\n'));

async function viaCli(p: Params): Promise<Anthropic.Message> {
  const { spawn } = await import('node:child_process');
  const { mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const cwd = mkdtempSync(join(tmpdir(), 'optllm-'));
  // 21.11: dotenv puts ANTHROPIC_API_KEY into the env and the CLI then bills the paid API; it must never inherit it
  const env = { ...process.env }; delete env.ANTHROPIC_API_KEY; delete env.ANTHROPIC_AUTH_TOKEN;
  const system = typeof p.system === 'string' ? p.system : (p.system || []).map((b) => b.text).join('\n\n');
  const prompt = p.messages.map((m) => textOf(m.content)).join('\n\n');
  const args = ['-p', '--tools', '', '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence', '--model', p.model];
  if (system) args.push('--system-prompt', system);
  const text = await new Promise<string>((ok, bad) => {
    const ch = spawn(process.env.CLAUDE_BIN || 'claude', args, { cwd, env });
    let out = ''; let err = '';
    ch.stdout.on('data', (d) => { out += d; });
    ch.stderr.on('data', (d) => { err += d; });
    ch.on('error', bad);
    ch.on('close', (code) => (code === 0 ? ok(out) : bad(new Error(`claude cli ${code}: ${err.slice(0, 300)}`))));
    ch.stdin.end(prompt);
  });
  return {
    id: 'cli', type: 'message', role: 'assistant', model: p.model, stop_reason: 'end_turn', stop_sequence: null,
    content: [{ type: 'text', text, citations: null }],
    usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
  } as unknown as Anthropic.Message;
}

/** The same shape the optimizer uses: messages.create(params, opts) and messages.stream(params).finalMessage() / .once(). */
function cliClient(): Anthropic {
  return {
    messages: {
      create: (p: Params) => viaCli(p),
      stream: (p: Params) => {
        const done = viaCli(p);
        return {
          once(ev: string, cb: () => void) { if (ev === 'streamEvent') setTimeout(cb, 0); return this; },
          on() { return this; },
          finalMessage: () => done,
        };
      },
    },
  } as unknown as Anthropic;
}

export function llm(): Anthropic {
  return process.env.OPT_VIA_CLI ? cliClient() : new Anthropic();
}
