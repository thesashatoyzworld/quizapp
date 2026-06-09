@echo off
cd /d "C:\Users\OTVAJE\Documents\ClaudeCode\Projects\TheSasha\quiz-app"
echo ==== RUN %DATE% %TIME% ==== >> broadcast-quiz-money.log
"C:\Program Files\nodejs\node.exe" broadcast-quiz-money.cjs >> broadcast-quiz-money.log 2>&1
echo ==== DONE %DATE% %TIME% ==== >> broadcast-quiz-money.log
