$ErrorActionPreference = 'Stop'
$loginBody = @{ email = 'admin@jyjgestor.com'; password = 'Admin1234$' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }
Write-Host 'LOGIN OK'

$desde = (Get-Date).AddMonths(-1).ToUniversalTime().ToString('o')   # ISO completo con Z
$hasta = (Get-Date).ToUniversalTime().ToString('o')

Write-Host "`ndesde=$desde"
Write-Host "hasta=$hasta`n"

$endpoints = @(
    @{ u = '/reportes/ventas-diarias';     n = 'ventas-diarias (ISO completo)' },
    @{ u = '/reportes/ventas-por-fecha';   n = 'ventas-por-fecha (ISO completo)' },
    @{ u = '/reportes/ventas-por-producto';n = 'ventas-por-producto (ISO completo)' },
    @{ u = '/reportes/ventas-por-cliente'; n = 'ventas-por-cliente (ISO completo)' }
)
foreach ($e in $endpoints) {
    $encoded = [uri]::EscapeDataString($desde)
    $encoded2 = [uri]::EscapeDataString($hasta)
    try {
        $r = Invoke-RestMethod -Uri ("http://localhost:3000/api" + $e.u + "?desde=$encoded&hasta=$encoded2") -Method GET -Headers $headers
        $json = $r | ConvertTo-Json -Depth 5 -Compress
        Write-Host "[$($e.n)] OK -> " + $json.Substring(0, [Math]::Min(180, $json.Length))
    } catch {
        Write-Host "[$($e.n)] FAIL -> " + $_.Exception.Response.StatusCode.value__ + " " + $_.ErrorDetails.Message
    }
}
