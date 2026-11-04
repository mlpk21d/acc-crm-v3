export type MosaicBox = {x:number;y:number;width:number;height:number};
/** First image is prominent; remaining images use the adjacent column/grid. */
export function mosaicBoxes(count:number,x:number,y:number,width:number,height:number):MosaicBox[] {
 if(!Number.isInteger(count)||count<1||count>5)throw new Error('Mosaic pages contain 1 to 5 images.');
 if(count===1)return [{x,y,width,height}];
 const gap=12;
 const large=(width-gap)*.62;
 const boxes=[{x,y,width:large,height}];
 const columns=count>=4?2:1;
 const rows=Math.ceil((count-1)/columns);
 const tileWidth=(width-large-gap-gap*(columns-1))/columns;
 const tileHeight=(height-gap*(rows-1))/rows;
 for(let i=0;i<count-1;i++)boxes.push({x:x+large+gap+(i%columns)*(tileWidth+gap),y:y+Math.floor(i/columns)*(tileHeight+gap),width:tileWidth,height:tileHeight});
 return boxes;
}
export function combinedStyles(door:string|null,drawer:string|null) {
 return [...new Set([door?.trim(),drawer?.trim()].filter(Boolean))].join('/')||'—';
}
export function groupRoomMedia<T extends {room_id:string|null}>(media:T[]):Map<string|null,T[]> {
 const groups=new Map<string|null,T[]>();
 for(const item of media){const group=groups.get(item.room_id)??[];group.push(item);groups.set(item.room_id,group);}
 return groups;
}
