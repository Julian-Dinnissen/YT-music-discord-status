Dim filePath
filePath = "C:\Users\Julian\OneDrive - Quadraam\Documenten\Github\YT-music-discord-status\song.json"

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "npx json-server """ & filePath & """", 1, False

Set WshShell = Nothing
