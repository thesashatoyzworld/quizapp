# uniq-watch

Bug watcher for the uniqualizer. Runs on the VPS (toyz-cloud-nl) next to uniq-server: `uniq-watch.timer`, every 10 min.

Signals: `uniq_feedback` events (form under /uniq) and `alert` / failed `sent` events in `/var/lib/uniq/log.jsonl`.
On a signal the watcher (root) makes a throwaway clone and runs headless `claude -p` with `prompt.md` as the
unprivileged user `uqclaude` (no GitHub key, no database, no write access to the service; token =
CLAUDE_CODE_OAUTH_TOKEN, Sasha's subscription). Claude fixes, tests and commits, or says it is not a bug.
If there are commits the watcher pushes `fix/uniq-auto-<id>` and sends Sasha the verdict in @testtoyzbot with
«Выкатить» / «Отклонить». The bot webhook records the tap (`uniq_fix_decision` event); the next tick squashes the
branch into master and pushes (Vercel deploys the cabinet) and, for `services/uniq-server` changes, copies the files
to `/opt/uniq-server` (backup in `bak-<id>/`), restarts and checks health; on a failed check it restores the backup.

Install / update (from a checkout on the Mac): `services/uniq-watch/deploy.sh`.
Files on the VPS: code `/opt/uniq-watch`, env `/etc/uniq-watch.env` (BOT_TOKEN, ADMIN_CHAT_ID, DIRECT_URL,
CLAUDE_CODE_OAUTH_TOKEN), state, logs and Claude transcripts `/var/lib/uqwatch/`, push clone `/var/lib/uqwatch/quizapp`.

    systemctl list-timers uniq-watch.timer
    journalctl -u uniq-watch -n 50
    cd /opt/uniq-watch && set -a && . /etc/uniq-watch.env && node watch.mjs --dry   # new signals, change nothing

Limits: one Claude run at a time, at most 6 a day, 45 min per run.
