$ErrorActionPreference = 'Stop'
$loginBody = @{ email = 'admin@jyjgestor.com'; password = 'Admin1234$' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }
Write-Host 'LOGIN OK'

# Simular EXACTAMENTE lo que manda el frontend Reportes/index.tsx: dayjs(...).toISOString()
$desde = [DateTime]::Now.AddMinutes(-2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$hasta = [DateTime]::Now.AddMinutes(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
Write-Host "desde=$desde"
Write-Host "hasta=$hasta`n"

$uriBase = 'http://localhost:3000/api/reportes'
$tabs = @(
    @{ n = 'ventas-diarias    '; u = '/ventas-diarias' },
    @{ n = 'ventas-por-fecha  '; u = '/ventas-por-fecha' },
    @{ n = 'ventas-por-cliente'; u = '/ventas-por-cliente' },
    @{ n = 'ventas-por-producto'; u = '/ventas-por-producto' }
)
foreach ($t in $tabs) {
    try {
        $r = Invoke-RestMethod -Uri "$uriBase$($t.u)?desde=$desde&hasta=$hasta" -Method GET -Headers $headers
        $json = $r | ConvertTo-Json -Depth 5 -Compress
        Write-Host "  [$($t.n)] OK -> " + $json.Substring(0, [Math]::Min(120, $json.Length))
    } catch {
        Write-Host "  [$($t.n)] FAIL -> HTTP " + $_.Exception.Response.StatusCode.value__ + " :: " + $_.ErrorDetails.Message
    }
}
