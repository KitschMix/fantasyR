# 게임 카드 아트 PNG → JPEG 변환 스크립트
# 1086x1448 PNG (~2MB) → 543x724 JPEG (~100-200KB)
Add-Type -AssemblyName System.Drawing

$srcDir = "e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc\assets\main"
$targetW = 543
$quality = 82L

# JPEG 코덱 찾기
$jpegCodec = $null
foreach ($enc in [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()) {
    if ($enc.MimeType -eq "image/jpeg") { $jpegCodec = $enc; break }
}
if (-not $jpegCodec) { Write-Error "JPEG encoder not found"; exit 1 }

$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
$encParams.Param[0] = $qualityParam

Get-ChildItem -Path $srcDir -Filter "*.png" | ForEach-Object {
    $srcPath = $_.FullName
    $dstPath = [System.IO.Path]::ChangeExtension($srcPath, ".jpg")

    $img = $null
    $bmp = $null
    $gfx = $null
    try {
        $img = [System.Drawing.Image]::FromFile($srcPath)
        $newH = [int]($targetW * $img.Height / $img.Width)
        $bmp = New-Object System.Drawing.Bitmap $targetW, $newH
        $gfx = [System.Drawing.Graphics]::FromImage($bmp)
        $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $gfx.DrawImage($img, 0, 0, $targetW, $newH)

        $bmp.Save($dstPath, $jpegCodec, $encParams)

        $srcSize = (Get-Item $srcPath).Length
        $dstSize = (Get-Item $dstPath).Length
        $ratio = [math]::Round(($dstSize / $srcSize) * 100, 1)
        Write-Host ("{0,-30} {1,8:N0} → {2,8:N0} bytes  ({3,5}% 남음)" -f $_.Name, $srcSize, $dstSize, $ratio)
    }
    finally {
        if ($gfx) { $gfx.Dispose() }
        if ($bmp) { $bmp.Dispose() }
        if ($img) { $img.Dispose() }
    }
}
