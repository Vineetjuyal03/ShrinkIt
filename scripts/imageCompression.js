function convertToWebP(file, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            resolve(blob);
        }, "image/webp", quality);
        };
        img.src = URL.createObjectURL(file);
    });
}
function triggerDownload(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href); // Clean up
}  
async function handleImageCompression(imageFile) {
    const webpBlob = await convertToWebP(imageFile, 0.8); // 0.8 = 80% quality
    const fileName = imageFile.name.replace(/\.[^/.]+$/, "") + ".webp";
    triggerDownload(webpBlob, fileName);
}
  