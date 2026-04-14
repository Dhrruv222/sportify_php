$base='https://server-production-6ed3.up.railway.app'

function Test-Endpoint {
  param(
    [string]$Method,
    [string]$Path,
    [int[]]$Expected,
    [string]$Body=$null,
    [switch]$Skip
  )

  if ($Skip) {
    return [pscustomobject]@{ Method=$Method; Path=$Path; Status='SKIP'; Expected=($Expected -join ','); Pass=$true; Note='Skipped to avoid external OAuth redirect flow' }
  }

  $url = "$base$Path"
  $code = -1
  try {
    if ($Body) {
      $resp = Invoke-WebRequest -Uri $url -Method $Method -Body $Body -ContentType 'application/json' -SkipHttpErrorCheck
    } else {
      $resp = Invoke-WebRequest -Uri $url -Method $Method -SkipHttpErrorCheck
    }
    $code = [int]$resp.StatusCode
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $code = [int]$_.Exception.Response.StatusCode
    }
  }

  return [pscustomobject]@{ Method=$Method; Path=$Path; Status=$code; Expected=($Expected -join ','); Pass=($Expected -contains $code); Note='' }
}

$tests = @(
  @{Method='GET'; Path='/api/health'; Expected=@(200)},
  @{Method='GET'; Path='/api/health/ready'; Expected=@(200,503)},
  @{Method='POST'; Path='/api/v1/auth/login'; Expected=@(400,401); Body='{}'},
  @{Method='POST'; Path='/api/v1/auth/register'; Expected=@(400); Body='{}'},
  @{Method='POST'; Path='/api/v1/auth/refresh'; Expected=@(401,403); Body='{}'},
  @{Method='POST'; Path='/api/v1/auth/logout'; Expected=@(200,401,403); Body='{}'},
  @{Method='GET'; Path='/api/v1/auth/oauth/google'; Expected=@(302); Skip=$true},

  @{Method='GET'; Path='/api/v1/fitpass/plans'; Expected=@(200)},
  @{Method='POST'; Path='/api/v1/fitpass/subscribe'; Expected=@(400,401); Body='{}'},
  @{Method='GET'; Path='/api/v1/fitpass/me/qr'; Expected=@(401)},
  @{Method='POST'; Path='/api/v1/fitpass/checkin'; Expected=@(400); Body='{}'},

  @{Method='GET'; Path='/api/v1/company/employees'; Expected=@(401,403)},
  @{Method='POST'; Path='/api/v1/company/employees'; Expected=@(401,403,400); Body='{}'},
  @{Method='GET'; Path='/api/v1/company/stats'; Expected=@(401,403)},

  @{Method='GET'; Path='/api/v1/news'; Expected=@(200)},
  @{Method='POST'; Path='/api/v1/news'; Expected=@(400); Body='{}'},
  @{Method='GET'; Path='/api/v1/news/not-a-uuid'; Expected=@(400,404)},
  @{Method='POST'; Path='/api/v1/news/internal/queue/retry'; Expected=@(401); Body='{}'},
  @{Method='POST'; Path='/api/v1/news/internal/enqueue'; Expected=@(401,400); Body='{"locale":"en","limit":1}'},
  @{Method='GET'; Path='/api/v1/news/internal/queue/status'; Expected=@(401)},

  @{Method='GET'; Path='/api/v1/users/account'; Expected=@(401)},
  @{Method='GET'; Path='/api/v1/profile'; Expected=@(401)},
  @{Method='GET'; Path='/api/v1/social/feed'; Expected=@(401)},
  @{Method='GET'; Path='/api/v1/players/search'; Expected=@(401)},
  @{Method='GET'; Path='/api/v1/messages/conversations'; Expected=@(401)}
)

$results = foreach ($t in $tests) {
  Test-Endpoint -Method $t.Method -Path $t.Path -Expected $t.Expected -Body $t.Body -Skip:([bool]$t.Skip)
}

$pass = ($results | Where-Object { $_.Pass }).Count
$total = $results.Count
$fail = $total - $pass

$report = @()
$report += "Railway Endpoint Smoke Report"
$report += "Generated: $(Get-Date -Format o)"
$report += "Base: $base"
$report += ""
$report += ($results | Format-Table -AutoSize | Out-String -Width 220)
$report += ""
$report += "SUMMARY: $pass/$total passed, $fail failed"

$reportPath = "../scripts/railway-endpoint-smoke-report.txt"
$report | Set-Content -Path $reportPath -Encoding UTF8
Write-Output "Wrote $reportPath"
