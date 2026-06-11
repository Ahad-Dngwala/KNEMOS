Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\guddi\.gemini\antigravity\brain\84301342-fc93-45c7-9233-bbea0ec80a36\knemos_icon_128_1781181868627.png'
$iconsDir = 'C:\Users\guddi\OneDrive\Desktop\Extension(1)\icons'

New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

$original = [System.Drawing.Image]::FromFile($srcPath)

$sizes = @(16, 32, 48, 128)

foreach ($sz in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($original, 0, 0, $sz, $sz)
    $g.Dispose()
    $fileName = "icon" + $sz + ".png"
    $outPath = [System.IO.Path]::Combine($iconsDir, $fileName)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host ("Saved " + $fileName)
}

$original.Dispose()
Write-Host "All icons done!"
