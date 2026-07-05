param(
  [string]$HfToken = $env:HF_TOKEN,
  [string]$HfSpace = "ORRESYDEVELOPER11/BITY",
  [string]$Branch = "main"
)

if (-not $HfToken) {
  Write-Host "ERROR: HF_TOKEN not set. Run: `$env:HF_TOKEN='hf_...'" -ForegroundColor Red
  exit 1
}

Write-Host "=== Pushing backend to Hugging Face Spaces ===" -ForegroundColor Cyan

$tmpDir = "$env:TEMP\hf-deploy"
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }

git clone "https://user:$HfToken@huggingface.co/spaces/$HfSpace" $tmpDir 2>&1
if (-not $?) { Write-Host "CLONE FAILED" -ForegroundColor Red; exit 1 }

Remove-Item "$tmpDir\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item ".\backend\*" $tmpDir -Recurse -Exclude "node_modules", ".env", "dist"
Remove-Item "$tmpDir\prisma\dev.db" -ErrorAction SilentlyContinue

 Push-Location $tmpDir
 git config user.email "deploy@local"
 git config user.name "Local Deploy"
 git add -A
 git commit --allow-empty -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
 git push --force 2>&1
 Pop-Location

Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "=== Backend deployed to https://huggingface.co/spaces/$HfSpace ===" -ForegroundColor Green
Write-Host "=== Frontend: just push to GitHub and Actions will deploy to Pages ===" -ForegroundColor Cyan
