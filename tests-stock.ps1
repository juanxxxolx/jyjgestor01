$ErrorActionPreference = 'Stop'
$loginBody = @{ email = "admin@jyjgestor.com"; password = 'Admin1234$' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }
Write-Host "LOGIN OK"

$tests = @(
    @{ n = "stock_dto_send_min(2<5) DEBE fallar(400)";          u = '/productos'; m = 'POST'; b = @{ nombre='A'; referencia='RA'; precio_venta=100; stock=2; stock_minimo=5 } },
    @{ n = "stock3<min8 DEBE fallar(400)";                      u = '/productos'; m = 'POST'; b = @{ nombre='B'; referencia='RB'; precio_venta=100; stock=3; stock_minimo=8 } },
    @{ n = "sin stock(0) sin min(0) DEBE pasar(201)";           u = '/productos'; m = 'POST'; b = @{ nombre='C'; referencia='RC'; precio_venta=100 } },
    @{ n = "stock5=min5 DEBE pasar(201)";                       u = '/productos'; m = 'POST'; b = @{ nombre='D'; referencia='RD'; precio_venta=100; stock=5; stock_minimo=5 } },
    @{ n = "stock10>min5 DEBE pasar(201)";                      u = '/productos'; m = 'POST'; b = @{ nombre='E'; referencia='RE'; precio_venta=100; stock=10; stock_minimo=5 } },
    @{ n = "stock0<min0 con stock_minimo=0 DEBE pasar(201)";    u = '/productos'; m = 'POST'; b = @{ nombre='F'; referencia='RF'; precio_venta=100; stock=0; stock_minimo=0 } }
)

foreach ($t in $tests) {
    $ts = [DateTime]::Now.Ticks
    $body = $t.b | ForEach-Object { $_ | Add-Member -NotePropertyName nombre_temporal -NotePropertyValue ("tmp") -PassThru } | Select-Object * -ExcludeProperty nombre_temporal
    $body = @{ nombre = "T$ts"; referencia = "REF$ts"; precio_venta = 100; stock = $t.b.stock; stock_minimo = $t.b.stock_minimo } | ConvertTo-Json
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/api$($t.u)" -Method POST -ContentType 'application/json' -Body $body -Headers $headers -UseBasicParsing
        Write-Host ("$(if($r.StatusCode -ge 400){'[REVISAR]'}else{'[OK]'}) $($t.n) -> HTTP $($r.StatusCode)")
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host ("[$(if($code -ge 400 -and $code -lt 500){'RECHAZADO-bien'}else{'ERROR-estado'})] $($t.n) -> HTTP $code")
    }
}
