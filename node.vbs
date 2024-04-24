Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node main.js", 0, False
Set WshShell = Nothing
