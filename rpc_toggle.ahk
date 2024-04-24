!NumpadMult::
if NodeScriptIsRunning()
{
    Run, C:\Users\Julian\OneDrive - Quadraam\Documenten\Github\YT-music-discord-status\stop_node.vbs, , Hide
}
else
{
    Run, C:\Users\Julian\OneDrive - Quadraam\Documenten\Github\YT-music-discord-status\node.vbs, , Hide
}
return

NodeScriptIsRunning()
{
    Process, Exist, node.exe
    return (ErrorLevel != 0)
}
