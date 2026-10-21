$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$iconRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'desktop'
$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)
$outline = New-Object System.Drawing.Drawing2D.GraphicsPath
$outline.AddArc(4, 4, 56, 56, 180, 90)
$outline.AddArc(196, 4, 56, 56, 270, 90)
$outline.AddArc(196, 196, 56, 56, 0, 90)
$outline.AddArc(4, 196, 56, 56, 90, 90)
$outline.CloseFigure()
$background = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 10, 14, 21))
$accent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 64, 222, 158))
$graphics.FillPath($background, $outline)
$triangle = [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(88, 58),
  [System.Drawing.PointF]::new(193, 128),
  [System.Drawing.PointF]::new(88, 198)
)
$graphics.FillPolygon($accent, $triangle)
$pngPath = Join-Path $iconRoot 'icon.png'
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = Join-Path $iconRoot 'icon.ico'
$stream = [System.IO.File]::Create($icoPath)
$writer = New-Object System.IO.BinaryWriter $stream
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]1)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([uint16]1)
$writer.Write([uint16]32)
$writer.Write([uint32]$pngBytes.Length)
$writer.Write([uint32]22)
$writer.Write($pngBytes)
$writer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
$background.Dispose()
$accent.Dispose()
$outline.Dispose()
Write-Output '[OK] Created EveryVideo desktop icon.'
