$ErrorActionPreference = 'Stop'
$loginBody = @{ email = 'admin@jyjgestor.com'; password = 'Admin1234$' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }
Write-Host 'LOGIN OK'
Write-Host ''

$endpoints = @(
    @{ n = 'ventas-diarias (sin fechas)';           u = '/reportes/ventas-diarias' },
    @{ n = 'ventas-por-fecha (sin fechas)';         u = '/reportes/ventas-por-fecha' },
    @{ n = 'ventas-por-producto (sin fechas)';      u = '/reportes/ventas-por-producto' },
    @{ n = 'ventas-por-cliente (sin fechas)';       u = '/reportes/ventas-por-cliente' }
)
foreach ($e in $endpoints) {
    try {
        $r = Invoke-RestMethod -Uri ("http://localhost:3000/api" + $e.u) -Method GET -Headers $headers
        $json = $r | ConvertTo-Json -Depth 5 -Compress
        Write-Host ("[$($e.n)] OK -> " + $json.Substring(0, [Math]::Min(250, $json.Length)))
    } catch {
        Write-Host ("[$($e.n)] FAIL -> " + $_.Exception.Response.StatusCode.value__ + " " + $_.ErrorDetails.Message)
    }
}

Write-Host ''
Write-Host '=== Con fechas (30 dias) ==='
$desde = (Get-Date).AddDays(-30).ToString('yyyy-MM-dd')
$hasta = (Get-Date).ToString('yyyy-MM-dd')
foreach ($e in $endpoints) {
    try {
        $r = Invoke-RestMethod -Uri ("http://localhost:3000/api" + $e.u + "?desde=$desde&hasta=$hasta") -Method GET -Headers $headers
        $json = $r | ConvertTo-Json -Depth 5 -Compress
        $data = $r.data
        $shape = if ($data -is [array]) { "array(len=$($data.Count))" } elseif ($data) { $data | ConvertTo-Json -Compress | Select-Object -First 1 } else { 'null' }
        Write-Host ("[$($e.n)] OK -> " + $shape)
    } catch {
        Write-Host ("[$($e.n)] FAIL -> " + $_.Exception.Response.StatusCode.value__ + " " + $_.ErrorDetails.Message)
    }
}
