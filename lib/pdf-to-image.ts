export async function convertPdfToImages(file: File): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  
  // Dynamic import to prevent SSR/Build-time errors
  const pdfjs = await import('pdfjs-dist');
  
  // Switch to jsDelivr which is more reliable for ESM workers
  const PDF_WORKER_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const imageUrls: string[] = [];

  // We'll limit to first 10 pages for safety and speed
  const totalPages = Math.min(pdf.numPages, 10);

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High res for AI

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    // Convert to optimized JPEG
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    imageUrls.push(base64Image);
  }

  return imageUrls;
}
