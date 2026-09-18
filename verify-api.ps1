$ErrorActionPreference = 'Stop'
try {
    $loginBody = @{ email = "admin@jyjgestor.com"; password = 'Admin1234$' } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
    $headers = @{ Authorization = "Bearer $($login.token)" }
    Write-Host "LOGIN OK"

    function Test-Url($name, $url) {
        try {
            $r = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
            Write-Host "$name OK -> count=$($r.data.Count)"
        } catch {
            Write-Host "$name FAIL -> $($_.ErrorDetails.Message)"
        }
    }

    Test-Url "productos           " 'http://localhost:3000/api/productos?page=1&limit=200'
    Test-Url "clientes            " 'http://localhost:3000/api/clientes?page=1&limit=200'
    Test-Url "movimientos         " 'http://localhost:3000/api/movimientos?page=1&limit=200'
    Test-Url "movimientos prod=1  " 'http://localhost:3000/api/movimientos?producto=1&page=1&limit=200'
    Test-Url "bajo-stock          " 'http://localhost:3000/api/productos/bajo-stock'
} catch {
    Write-Host "LOGIN FAIL: $($_.Exception.Message)"
}
