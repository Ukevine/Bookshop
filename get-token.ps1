$cid = "sb-bookshop-uwase!t712423"
$csec = 'b7052080-c515-4942-b356-0f9ca4f480ed$CBpBbgCxx5bWP1WSoD-WuGjzwG1N0M_Rv3BZvnUMJ8M='
$pwd = Read-Host "BTP Password" -AsSecureString
$pwdPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pwd))
$body = "grant_type=password&username=richard.musime@moyotech.net&password=$pwdPlain"
$auth = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${cid}:${csec}"))
$r = Invoke-RestMethod -Uri "https://bbaea2a7trial.authentication.us10.hana.ondemand.com/oauth/token" -Method POST -Body $body -Headers @{Authorization="Basic $auth"} -ContentType "application/x-www-form-urlencoded"
Set-Clipboard $r.access_token
Write-Host "Token copied to clipboard" -ForegroundColor Green