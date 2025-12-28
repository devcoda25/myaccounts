$path = "c:\Users\dev_fx\Desktop\all the work\evzone-myaccounts-portal\src\pages\app\parental\Index.tsx"
$lines = Get-Content $path
$newLines = $lines[0..1685] + $lines[2968..($lines.Count-1)]
$newLines | Set-Content $path -Encoding UTF8
Write-Host "Cleanup complete."
