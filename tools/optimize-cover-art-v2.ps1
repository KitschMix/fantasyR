# 게임 카드 아트 PNG → Progressive JPEG 변환 스크립트 (v2)
# q=78 + Progressive 인코딩으로 부분 로딩 빠르게
Add-Type -AssemblyName System.Drawing

$srcDir = "e:\Download\fantasy-kingdom-pc\fantasy-kingdom-pc\assets\main"
$targetW = 543
$quality = 78L

# JPEG 코덱 찾기
$jpegCodec = $null
foreach ($enc in [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()) {
    if ($enc.MimeType -eq "image/jpeg") { $jpegCodec = $enc; break }
}
if (-not $jpegCodec) { Write-Error "JPEG encoder not found"; exit 1 }

$encParams = New-Object System.Drawing.Imaging.EncoderParameters 2
$qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
# Progressive (multi-scan) JPEG: 처음에 저해상도 빠르게 표시 후 점진 개선
$progParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::RenderMethod, [int][System.Drawing.Imaging.EncoderValue]::RenderProgressive)
$encParams.Param[0] = $qualityParam
$encParams.Param[1] = $progParam

Get-ChildItem -Path $srcDir -Filter "*.png" | ForEach-Object {
    $srcPath = $_.FullName
    $dstPath = [System.IO.Path]::ChangeExtension($srcPath, ".jpg")
    $oldJpgExists = Test-Path $dstPath
    $oldSize = if ($oldJpgExists) { (Get-Item $dstPath).Length } else { 0 }

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
        Write-Host ("{0,-30} PNG {1,8:N0} → JPG {2,8:N0} ({3}KB)" -f $_.Name, $srcSize, $dstSize, [int]($dstSize/1024))
    }
    finally {
        if ($gfx) { $gfx.Dispose() }
        if ($bmp) { $bmp.Dispose() }
        if ($img) { $img.Dispose() }
    }
}
