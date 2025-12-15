import { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';

type ScanImageData = {
  uri: string;
  base64: string;
} | null;

export const [ScanImageProvider, useScanImage] = createContextHook(() => {
  const [imageData, setImageData] = useState<ScanImageData>(null);

  const setImage = useCallback((uri: string, base64: string) => {
    console.log('ScanImageContext: Setting image data');
    setImageData({ uri, base64 });
  }, []);

  const clearImage = useCallback(() => {
    console.log('ScanImageContext: Clearing image data');
    setImageData(null);
  }, []);

  return {
    imageData,
    setImage,
    clearImage,
  };
});
