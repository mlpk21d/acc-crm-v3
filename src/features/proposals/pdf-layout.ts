export type MosaicBox = {x:number;y:number;width:number;height:number};
/** Horizontal gallery rows keep landscape renders wide rather than in tall columns. */
export function mosaicBoxes(count:number,x:number,y:number,width:number,height:number):MosaicBox[] {
 if(!Number.isInteger(count)||count<1||count>5)throw new Error('Mosaic pages contain 1 to 5 images.');
 if(count===1)return [{x,y,width,height}];
 const gap=16;
 if(count===2){
  const first=(width-gap)*.56;
  return [{x,y,width:first,height},{x:x+first+gap,y,width:width-first-gap,height}];
 }
 const topHeight=(height-gap)*.6;
 if(count===5){
  const first=(width-gap)*.62;
  const bottomWidth=(width-2*gap)/3;
  return [{x,y,width:first,height:topHeight},{x:x+first+gap,y,width:width-first-gap,height:topHeight},
   ...Array.from({length:3},(_,i)=>({x:x+i*(bottomWidth+gap),y:y+topHeight+gap,width:bottomWidth,height:height-topHeight-gap}))];
 }
 const bottomCount=count-1;
 const bottomWidth=(width-gap*(bottomCount-1))/bottomCount;
 return [{x,y,width,height:topHeight},...Array.from({length:bottomCount},(_,i)=>({x:x+i*(bottomWidth+gap),y:y+topHeight+gap,width:bottomWidth,height:height-topHeight-gap}))];
}
export function combinedStyles(door:string|null,drawer:string|null) {
 return [...new Set([door?.trim(),drawer?.trim()].filter(Boolean))].join('/')||'—';
}
export function groupRoomMedia<T extends {room_id:string|null}>(media:T[]):Map<string|null,T[]> {
 const groups=new Map<string|null,T[]>();
 for(const item of media){const group=groups.get(item.room_id)??[];group.push(item);groups.set(item.room_id,group);}
 return groups;
}


/** Balance columns by image proportions and close their edges with a small gutter. */
export function coverMasonryBoxes(aspectRatios: number[], area: MosaicBox): MosaicBox[] {
 if(aspectRatios.length<=1)return aspectRatios.map(()=>area);
 const gap=3;
 const columnCount=Math.min(5,Math.max(2,Math.ceil(Math.sqrt(aspectRatios.length))));
 const columns=Array.from({length:columnCount},()=>({tiles:[] as {index:number;weight:number}[],weight:0}));
 aspectRatios.forEach((ratio,index)=>{
  const weight=1/Math.max(.65,Math.min(2.4,ratio));
  const column=columns.reduce((shortest,current)=>current.weight<shortest.weight?current:shortest);
  column.tiles.push({index,weight});
  column.weight+=weight;
 });
 const availableWidth=area.width-gap*(columnCount-1);
 const innerGap=(count:number)=>gap*(count-1);
 const naturalHeight=(availableWidth+columns.reduce((sum,column)=>sum+innerGap(column.tiles.length)/column.weight,0))/
  columns.reduce((sum,column)=>sum+1/column.weight,0);
 const gridHeight=Math.min(area.height,naturalHeight);
 const boxes:MosaicBox[]=[];
 let x=area.x;
 for(const column of columns){
  const columnGap=innerGap(column.tiles.length);
  const width=(naturalHeight-columnGap)/column.weight;
  let y=area.y;
  for(const tile of column.tiles){
   const height=(gridHeight-columnGap)*tile.weight/column.weight;
   boxes[tile.index]={x,y,width,height};
   y+=height+gap;
  }
  x+=width+gap;
 }
 return boxes;
}
