@echo off
cd /d "C:\Users\OTVAJE\Documents\ClaudeCode\Projects\TheSasha\quiz-app"
echo ==== REPORT %DATE% %TIME% ==== >> broadcast-quiz-money.log
"C:\Program Files\nodejs\node.exe" report-broadcast-utm.cjs >> broadcast-quiz-money.log 2>&1
