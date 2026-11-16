#!/bin/sh
# Install or update the budget screenshot recognizer on the VPS. Run from the repo on the Mac.
# Env file /etc/budget-shots.env is created by hand (CABINET_URL, CRON_SECRET, CLAUDE_CODE_OAUTH_TOKEN).
set -e
cd "$(dirname "$0")"
H=root@72.56.16.252
K="-i $HOME/.ssh/vps_timeweb"
ssh $K $H 'mkdir -p /opt/budget-shots'
scp -q $K run.mjs $H:/opt/budget-shots/
scp -q $K budget-shots.service budget-shots.timer $H:/etc/systemd/system/
ssh $K $H 'systemctl daemon-reload && systemctl enable --now budget-shots.timer && systemctl list-timers budget-shots.timer --no-pager | head -3'
