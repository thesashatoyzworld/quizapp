# uniq-server

Video uniqualizer API for the thesashatoyz.com cabinet. Runs on the Amsterdam VPS
(`/opt/uniq-server`, systemd `uniq-server`, Caddy on `uniq.thesashatoyz.com`), not on Vercel.
Encoding logic is Danya's `core.js` (Uniqalizator 1.0.0) with minimal server tweaks.

Plain Node 22, no npm deps. Tests: `node --test test/` (needs ffmpeg in PATH).

Deploy: `rsync -a --delete --exclude test ./ root@HOST:/opt/uniq-server/ && ssh root@HOST systemctl restart uniq-server`.
Config: `/etc/uniq.env` (see `deploy/uniq.env.example`). State: `/var/lib/uniq/{usage,history,jobs}.json`.
