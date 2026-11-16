#!/bin/sh
# Install or update the watcher on the VPS. Run from the repo on the Mac.
set -e
cd "$(dirname "$0")"
H=root@72.56.16.252
K="-i $HOME/.ssh/vps_timeweb"
ssh $K $H 'mkdir -p /opt/uniq-watch'
scp -q $K watch.mjs prompt.md README.md $H:/opt/uniq-watch/
scp -q $K uniq-watch.service uniq-watch.timer $H:/etc/systemd/system/
ssh $K $H 'systemctl daemon-reload && systemctl enable --now uniq-watch.timer && systemctl list-timers uniq-watch.timer --no-pager | head -3'
