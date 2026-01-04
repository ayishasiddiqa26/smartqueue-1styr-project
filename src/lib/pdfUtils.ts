// Simple PDF page counter utility
export const getPDFPageCount = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function() {
      try {
        const typedArray = new Uint8Array(this.result as ArrayBuffer);
        const text = String.fromCharCode.apply(null, Array.from(typedArray));
        
        // Simple method to count pages by looking for /Count entries
        const pageCountMatch = text.match(/\/Count\s+(\d+)/);
        if (pageCountMatch) {
          resolve(parseInt(pageCountMatch[1], 10));
          return;
        }
        
        // Alternative method: count page objects
        const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
        if (pageMatches) {
          resolve(pageMatches.length);
          return;
        }
        
        // Fallback: estimate based on file size (rough approximation)
        const estimatedPages = Math.max(1, Math.ceil(file.size / 50000)); // ~50KB per page
        resolve(estimatedPages);
      } catch (error) {
        console.warn('Could not determine page count, defaulting to 1:', error);
        resolve(1);
      }
    };
    
    reader.onerror = () => {
      console.warn('Error reading file for page count, defaulting to 1');
      resolve(1);
    };
    
    reader.readAsArrayBuffer(file);
  });
};