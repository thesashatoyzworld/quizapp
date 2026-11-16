# uniq-watch

Bug watcher for the uniqualizer. Runs on Sasha's Mac (launchd, every 10 min, skips while the Mac sleeps).

Signals: `uniq_feedback` events (form under /uniq) and `alert` / failed `sent` events in `/var/lib/uniq/log.jsonl` on the VPS.
On a signal it runs headless `claude -p` (subscription, $0) in a fresh worktree from origin/master with `prompt.md`;
Claude fixes, tests and opens a PR, or says it is not a bug. Sasha gets the verdict in @testtoyzbot with
«Выкатить» / «Отклонить». The bot webhook records the tap (`uniq_fix_decision` event), the next tick merges the PR and,
for `services/uniq-server` changes, copies the files to `/opt/uniq-server` (backup in `bak-<id>/`), restarts and checks
health; on a failed check it restores the backup. Cabinet changes deploy through Vercel on merge.

Runtime checkout: `~/Documents/ClaudeCode/Projects/TheSasha/quiz-app-watch` (detached origin/master; update with
`git -C … fetch && git -C … checkout --detach origin/master`). Deps and env come from `TheSasha/quiz-app`
(node_modules, `.env.local`: DIRECT_URL, BOT_TOKEN, ADMIN_CHAT_ID). State, logs and Claude transcripts: `~/.uniq-watch/`.

    cp com.sashatoyz.uniq-watch.plist ~/Library/LaunchAgents/
    launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.sashatoyz.uniq-watch.plist
    node watch.mjs --dry      # print new signals, change nothing
    tail -f ~/.uniq-watch/watch.log

Limits: one Claude run at a time, at most 6 a day, 45 min per run.
