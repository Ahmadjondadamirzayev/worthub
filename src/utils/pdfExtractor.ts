import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    // Use official cdnjs worker compatible with the pdfjs-dist version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF worker configuration error:', e);
  }
}

/**
 * Extracts plain text from a PDF File or ArrayBuffer.
 * Accurately reconstructs lines from top to bottom.
 * Preserves each line intact so that:
 * Line 1: German word + brackets/plurals/articles next to it
 * Line 2: Uzbek translation underneath it
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

    // Group items by line (vertical Y coordinate with 4px tolerance)
    const lineBuckets = new Map<number, Array<{ x: number; text: string }>>();

    for (const rawItem of textContent.items) {
      const item = rawItem as { str?: string; transform?: number[] };
      if (!item.str || !item.str.trim()) continue;

      const str = item.str.trim();
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      const y = Math.round(transform[5] / 4) * 4; // 4px vertical band
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

      // Assemble row items with appropriate spacing
      let line = '';
      for (let i = 0; i < rowItems.length; i++) {
        const curr = rowItems[i].text;
        if (i === 0) {
          line = curr;
        } else {
          const prev = rowItems[i - 1].text;
          // If curr is a punctuation mark like , . ) - or starts with closing bracket, don't put extra space
          if (/^[,.:;!?)\]\-]/.test(curr) || /^[(\[]/.test(prev)) {
            line += curr;
          } else {
            line += ' ' + curr;
          }
        }
      }

      line = line.trim();
      if (line) {
        resultText += line + '\n';
      }
    }
  }

  return resultText;
}
