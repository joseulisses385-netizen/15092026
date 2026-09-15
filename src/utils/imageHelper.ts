/**
 * Helper to process and compress images to clean data URLs suitable for localStorage storage
 */
export async function fileToOptimizedDataUrl(file: File, maxDimension = 1200, quality = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        return reject(new Error('Resultado vazio'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao carregar a imagem'));
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(result); // Fallback to raw reader output
          }

          ctx.drawImage(img, 0, 0, width, height);
          const isPng = file.type === 'image/png';
          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(mimeType, isPng ? undefined : quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(result); // Fallback
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
