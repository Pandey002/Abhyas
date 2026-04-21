import * as pdfjs from 'pdfjs-dist';

// Standard CDN worker for version 4+
const PDF_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

export async function convertPdfToImages(file: File): Promise<string[]> {
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
