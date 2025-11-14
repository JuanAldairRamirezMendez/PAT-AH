#!/usr/bin/env pwsh
<#
  scripts/build-all.ps1
  Construye y opcionalmente sube las imágenes Docker de los microservicios.
  Uso:
    .\scripts\build-all.ps1 -tagSuffix "local"            # construir local
    .\scripts\build-all.ps1 -tagSuffix "v1.0.0" -registry "docker.io/tu-user" -push
#>

param(
  [string]$tagSuffix = "latest",
  [string]$registry = "",
  [switch]$push
)

$services = @(
  @{ name="auth"; path="Backend-Huancavelica-Alertas-Agricolas/services/auth-service"; dockerfile="Backend-Huancavelica-Alertas-Agricolas/services/auth-service/Dockerfile"; port=3001 },
  @{ name="users"; path="Backend-Huancavelica-Alertas-Agricolas/services/users-service"; dockerfile="Backend-Huancavelica-Alertas-Agricolas/services/users-service/Dockerfile"; port=3002 },
  @{ name="rest"; path="Backend-Huancavelica-Alertas-Agricolas/services/rest-service"; dockerfile="Backend-Huancavelica-Alertas-Agricolas/services/rest-service/Dockerfile"; port=3004 },
  @{ name="ai"; path="Backend-Huancavelica-Alertas-Agricolas/services/ai-service"; dockerfile="Backend-Huancavelica-Alertas-Agricolas/services/ai-service/Dockerfile"; port=3003 },
  @{ name="ingest"; path="Backend-Huancavelica-Alertas-Agricolas/services/ingest-service"; dockerfile="Backend-Huancavelica-Alertas-Agricolas/services/ingest-service/Dockerfile"; port=3020 }
)

foreach ($s in $services) {
  $imageName = if ($registry -ne "") { "$registry/pat-ah-$($s.name):$tagSuffix" } else { "pat-ah-$($s.name):$tagSuffix" }
  Write-Output "=== Building $($s.name) -> $imageName ==="
  docker build -f $s.dockerfile -t $imageName .
  if ($LASTEXITCODE -ne 0) { throw "Build failed for $($s.name)" }
  if ($push) {
    Write-Output "Pushing $imageName ..."
    docker push $imageName
    if ($LASTEXITCODE -ne 0) { throw "Push failed for $($s.name)" }
  }
}

Write-Output "All builds completed."
