import sharp from 'sharp';

const maxInputPixels = 24_000_000;
const maxImageEdge = 2400;

/** Store a print-sized image in a format supported by the proposal PDF. */
export async function optimizeProposalImage(original:Buffer, filename:string) {
 try {
  const metadata=await sharp(original).metadata();
  const {format,width,height,orientation}=metadata;
  if(format!=='jpeg'&&format!=='png')throw new Error('Only PNG and JPEG images are supported.');
  if(width*height>maxInputPixels)throw new Error('Images must be at most 24 megapixels.');

  const compressed=await sharp(original,{limitInputPixels:maxInputPixels,failOn:'warning'}).autoOrient()
   .resize({width:maxImageEdge,height:maxImageEdge,fit:'inside',withoutEnlargement:true})
   .flatten({background:'#ffffff'})
   .jpeg({quality:85,chromaSubsampling:'4:4:4'})
   .toBuffer();
  if(Math.max(width,height)<=maxImageEdge&&(!orientation||orientation===1)&&original.length<=compressed.length){
   return {data:original,mime:format==='png'?'image/png':'image/jpeg',filename:filename.slice(0,255)||'render'};
  }
  const basename=filename.replace(/\.[^.]+$/,'').slice(0,251)||'render';
  return {data:compressed,mime:'image/jpeg',filename:`${basename}.jpg`};
 }catch(error){
  if(error instanceof Error&&(error.message==='Only PNG and JPEG images are supported.'||
   error.message==='Images must be at most 24 megapixels.'))throw error;
  throw new Error('Unable to read image. Choose a valid PNG or JPEG.');
 }
}
