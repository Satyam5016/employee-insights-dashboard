export const mergeImageSignature = (photoDataUrl, signatureCanvas) => {
  return new Promise((resolve, reject) => {
    if (!photoDataUrl || !signatureCanvas) {
      reject(new Error("Missing photo or signature data"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const mergedCanvas = document.createElement('canvas');
      const ctx = mergedCanvas.getContext('2d');

      mergedCanvas.width = img.width;
      mergedCanvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const sigWidth = mergedCanvas.width * 0.4;
      const sigHeight = (signatureCanvas.height / signatureCanvas.width) * sigWidth;
      
      const x = mergedCanvas.width - sigWidth - 20;
      const y = mergedCanvas.height - sigHeight - 20;

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(x - 10, y - 10, sigWidth + 20, sigHeight + 20);

      ctx.drawImage(signatureCanvas, x, y, sigWidth, sigHeight);

      resolve(mergedCanvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = photoDataUrl;
  });
};
