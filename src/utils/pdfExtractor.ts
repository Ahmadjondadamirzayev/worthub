import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF worker configuration error:', e);
  }
}

/**
 * Extracts plain text and table rows from a PDF File or ArrayBuffer.
 * Reconstructs lines by sorting text items by vertical Y coordinate,
 * separating columns with tab characters for tabular layout preservation.
 */
export async function extractTextFromPdf(file: File | ArrayBuffer): Promise<string> {
  const data = file instanceof File ? await file.arrayBuffer() : file;

  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let resultText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items by line (quantized Y coordinate)
    const lineBuckets = new Map<number, Array<{ x: number; text: string }>>();

    for (const rawItem of textContent.items) {
      const item = rawItem as { str?: string; transform?: number[] };
      if (!item.str || !item.str.trim()) continue;

      const str = item.str.trim();
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      const y = Math.round(transform[5] / 5) * 5; // Group items within ~5px vertical band
      const x = Math.round(transform[4]);

      if (!lineBuckets.has(y)) {
        lineBuckets.set(y, []);
      }
      lineBuckets.get(y)!.push({ x, text: str });
    }

    // Sort lines from top of the page to bottom (descending Y)
    const sortedY = Array.from(lineBuckets.keys()).sort((a, b) => b - a);

    for (const y of sortedY) {
      const rowItems = lineBuckets.get(y)!.sort((a, b) => a.x - b.x);

      // Check if items represent tabular columns (e.g. Deutsch and O'zbekcha)
      if (rowItems.length >= 2) {
        const first = rowItems[0];
        const last = rowItems[rowItems.length - 1];
        if (last.x - first.x > 80) {
          const halfWay = (first.x + last.x) / 2;
          const leftCol = rowItems.filter(it => it.x < halfWay).map(it => it.text).join(' ');
          const rightCol = rowItems.filter(it => it.x >= halfWay).map(it => it.text).join(' ');
          if (leftCol && rightCol) {
            resultText += `${leftCol}\t${rightCol}\n`;
            continue;
          }
        }
      }

      // Default line assembly
      const lineStr = rowItems.map(it => it.text).join('\t');
      resultText += lineStr + '\n';
    }
  }

  return resultText;
}
