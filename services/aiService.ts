// We access the global variables loaded via script tags in index.html
// to avoid bundling issues with tfjs in this specific constraint environment.
declare global {
  interface Window {
    cocoSsd: any;
    tf: any;
  }
}

let model: any = null;

export const loadModel = async (): Promise<void> => {
  if (model) return;
  
  try {
    console.log('Loading COCO-SSD model...');
    // Wait for window.cocoSsd to be available if scripts are still loading
    if (!window.cocoSsd) {
       await new Promise<void>((resolve, reject) => {
         let retries = 0;
         const check = setInterval(() => {
           if (window.cocoSsd) {
             clearInterval(check);
             resolve();
           }
           retries++;
           if(retries > 50) { // 5 seconds timeout
             clearInterval(check);
             reject(new Error("TensorFlow script not loaded"));
           }
         }, 100);
       });
    }
    model = await window.cocoSsd.load();
    console.log('Model loaded successfully');
  } catch (err) {
    console.error('Failed to load model', err);
    throw err;
  }
};

export const detectObjects = async (imageElement: HTMLImageElement): Promise<string[]> => {
  if (!model) {
    await loadModel();
  }
  
  try {
    const predictions = await model.detect(imageElement);
    console.log('Predictions:', predictions);
    return predictions.map((p: any) => p.class);
  } catch (err) {
    console.error('Detection failed', err);
    return [];
  }
};