# Generateur d'icones PWA et d'ecrans de demarrage (System.Drawing, sans dependance).
# Usage : powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
Add-Type -AssemblyName System.Drawing

$outDir = "public\icons"
if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$BrandTop = [System.Drawing.Color]::FromArgb(255, 55, 48, 163)   # #3730a3
$BrandBot  = [System.Drawing.Color]::FromArgb(255, 49, 46, 129)  # #312e81
$Gold      = [System.Drawing.Color]::FromArgb(255, 245, 158, 11) # #f59e0b
$White     = [System.Drawing.Color]::White
$GoldSoft  = [System.Drawing.Color]::FromArgb(46, 245, 158, 11)

function New-RoundedRectPath([float]$size, [float]$radius) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $p.AddArc(0, 0, $d, $d, 180, 90)
    $p.AddArc($size - $d, 0, $d, $d, 270, 90)
    $p.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $p.AddArc(0, $size - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

function New-HeartPath([float]$size) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.StartFigure()
    $p.AddBezier(0.50 * $size, 0.16 * $size, 0.04 * $size, 0.24 * $size, -0.04 * $size, 0.58 * $size, 0.15 * $size, 0.78 * $size)
    $p.AddBezier(0.15 * $size, 0.78 * $size, 0.27 * $size, 0.92 * $size, 0.43 * $size, 0.98 * $size, 0.50 * $size, 0.88 * $size)
    $p.AddBezier(0.50 * $size, 0.88 * $size, 0.57 * $size, 0.98 * $size, 0.73 * $size, 0.92 * $size, 0.85 * $size, 0.78 * $size)
    $p.AddBezier(0.85 * $size, 0.78 * $size, 1.04 * $size, 0.58 * $size, 0.96 * $size, 0.24 * $size, 0.50 * $size, 0.16 * $size)
    $p.CloseFigure()
    return $p
}

function New-CrossPath([float]$size) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.AddRectangle((New-Object System.Drawing.RectangleF((0.475 * $size), (0.0 * $size), (0.05 * $size), (0.34 * $size))))
    $p.AddRectangle((New-Object System.Drawing.RectangleF((0.32 * $size), (0.115 * $size), (0.36 * $size), (0.07 * $size))))
    return $p
}

function Add-Mark($g, [float]$size, [float]$centerX, [float]$centerY, [float]$markSize) {
    $heart = New-HeartPath $size
    $cross = New-CrossPath $size
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $s = $markSize / $size
    $m.Translate(($centerX - $markSize / 2), ($centerY - $markSize / 2))
    $m.Scale($s, $s)
    $heart.Transform($m)
    $cross.Transform($m)
    $g.FillPath((New-Object System.Drawing.SolidBrush($White)), $heart)
    $g.FillPath((New-Object System.Drawing.SolidBrush($Gold)), $cross)
}

function New-Canvas([int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    return @($bmp, $g)
}

function Save-Canvas($bmp, $g, [string]$path) {
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function New-BackgroundBrush($g, [int]$w, [int]$h) {
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    return New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $BrandTop, $BrandBot, 90.0)
}

# --- Icônes « any » (coins arrondis) ---
function New-Icon([int]$size, [string]$nom, [float]$scale, [bool]$arrondie) {
    $pair = New-Canvas $size $size
    $g = $pair[1]
    if ($arrondie) {
        $clip = New-RoundedRectPath $size ($size * 0.20)
        $g.SetClip($clip)
    }
    $g.FillRectangle((New-BackgroundBrush $g $size $size), (New-Object System.Drawing.Rectangle(0, 0, $size, $size)))
    Add-Mark $g $size ($size / 2) ($size / 2) ($size * $scale)
    Save-Canvas $pair[0] $g (Join-Path $outDir $nom)
    Write-Host "OK  $nom"
}

New-Icon 192 "icon-192.png" 0.78 $true
New-Icon 512 "icon-512.png" 0.78 $true
# maskable : fond plein bord à bord, contenu réduit au centre
New-Icon 192 "maskable-192.png" 0.60 $false
New-Icon 512 "maskable-512.png" 0.60 $false
# apple-touch-icon : fond plein bord à bord, iOS arrondit lui-même
New-Icon 180 "apple-touch-icon.png" 0.74 $false

# --- Écrans de démarrage (iOS / Androïd) ---
function New-Splash([int]$w, [int]$h) {
    $pair = New-Canvas $w $h
    $g = $pair[1]
    $g.FillRectangle((New-BackgroundBrush $g $w $h), (New-Object System.Drawing.Rectangle(0, 0, $w, $h)))

    $cx = $w / 2
    $cyBase = $h * 0.40
    $halo = $w * 0.42
    $g.FillEllipse((New-Object System.Drawing.SolidBrush($GoldSoft)), ($cx - $halo), ($cyBase - $halo), (2 * $halo), (2 * $halo))

    $markSize = $w * 0.34
    Add-Mark $g $markSize $cx $cyBase $markSize

    $title = [string][char]0x00C9 + "glise de Bunia"
    $tagline = "Gestion des offrandes et des projets"
    $fTitle = New-Object System.Drawing.Font("Segoe UI", [float]($w * 0.044), ([System.Drawing.FontStyle]::Bold), [System.Drawing.GraphicsUnit]::Pixel)
    $fTag = New-Object System.Drawing.Font("Segoe UI", [float]($w * 0.021), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

    $bTitle = New-Object System.Drawing.SolidBrush($White)
    $bTag = New-Object System.Drawing.SolidBrush($Gold)
    $bText = New-Object System.Drawing.SolidBrush($White)

    $sTitle = $g.MeasureString($title, $fTitle)
    $g.DrawString($title, $fTitle, $bTitle, ($cx - $sTitle.Width / 2), ($h * 0.55))

    $sTag = $g.MeasureString($tagline, $fTag)
    $g.DrawString($tagline, $fTag, $bTag, ($cx - $sTag.Width / 2), ($h * 0.55 + $sTitle.Height + $h * 0.02))

    Save-Canvas $pair[0] $g (Join-Path $outDir ("apple-splash-{0}x{1}.png" -f $w, $h))
    Write-Host "OK  apple-splash-${w}x${h}.png"
}

New-Splash 1290 2796
New-Splash 1179 2556
New-Splash 1170 2532
New-Splash 1668 2388
New-Splash 1620 2160

Write-Host "Terminé."