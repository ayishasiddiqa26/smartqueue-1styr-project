// Enhanced PDF page counter utility
export const getPDFPageCount = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function() {
      try {
        const arrayBuffer = this.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to string for pattern matching
        let pdfText = '';
        for (let i = 0; i < uint8Array.length; i++) {
          pdfText += String.fromCharCode(uint8Array[i]);
        }
        
        console.log('PDF file size:', file.size, 'bytes');
        console.log('PDF text length:', pdfText.length);
        
        // Method 1: Look for /Count in the Pages object (most reliable)
        const pagesObjectMatch = pdfText.match(/\/Type\s*\/Pages[^}]*\/Count\s+(\d+)/);
        if (pagesObjectMatch) {
          const count = parseInt(pagesObjectMatch[1], 10);
          console.log('Found page count via Pages object:', count);
          resolve(count);
          return;
        }
        
        // Method 2: Look for any /Count entry (fallback)
        const countMatches = pdfText.match(/\/Count\s+(\d+)/g);
        if (countMatches && countMatches.length > 0) {
          // Take the largest count found (usually the total pages)
          const counts = countMatches.map(match => {
            const num = match.match(/\/Count\s+(\d+)/);
            return num ? parseInt(num[1], 10) : 0;
          });
          const maxCount = Math.max(...counts);
          console.log('Found page count via Count entries:', maxCount, 'from', counts);
          if (maxCount > 0) {
            resolve(maxCount);
            return;
          }
        }
        
        // Method 3: Count individual page objects
        const pageObjectMatches = pdfText.match(/\/Type\s*\/Page(?!\s*s)\b/g);
        if (pageObjectMatches && pageObjectMatches.length > 0) {
          console.log('Found page count via Page objects:', pageObjectMatches.length);
          resolve(pageObjectMatches.length);
          return;
        }
        
        // Method 4: Look for page references
        const pageRefMatches = pdfText.match(/\d+\s+0\s+obj[^]*?\/Type\s*\/Page\b/g);
        if (pageRefMatches && pageRefMatches.length > 0) {
          console.log('Found page count via page references:', pageRefMatches.length);
          resolve(pageRefMatches.length);
          return;
        }
        
        // Method 5: Enhanced file size estimation with better heuristics
        let estimatedPages = 1;
        if (file.size > 100000) { // > 100KB
          // More sophisticated estimation based on file size
          if (file.size < 500000) { // < 500KB
            estimatedPages = Math.max(1, Math.ceil(file.size / 80000)); // ~80KB per page
          } else if (file.size < 2000000) { // < 2MB
            estimatedPages = Math.max(1, Math.ceil(file.size / 100000)); // ~100KB per page
          } else { // > 2MB
            estimatedPages = Math.max(1, Math.ceil(file.size / 150000)); // ~150KB per page
          }
        }
        
        console.log('Using file size estimation:', estimatedPages, 'pages for', file.size, 'bytes');
        resolve(estimatedPages);
        
      } catch (error) {
        console.warn('Error parsing PDF for page count:', error);
        // Final fallback based on file size
        const fallbackPages = Math.max(1, Math.ceil(file.size / 100000));
        console.log('Using fallback estimation:', fallbackPages);
        resolve(fallbackPages);
      }
    };
    
    reader.onerror = () => {
      console.warn('Error reading file for page count');
      // Fallback based on file size
      const fallbackPages = Math.max(1, Math.ceil(file.size / 100000));
      resolve(fallbackPages);
    };
    
    reader.readAsArrayBuffer(file);
  });
};