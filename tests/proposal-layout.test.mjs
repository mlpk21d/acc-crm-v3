import assert from 'node:assert/strict';
import test from 'node:test';
import {mosaicBoxes,combinedStyles,groupRoomMedia} from '../src/features/proposals/pdf-layout.ts';

test('landscape mosaics fit 1–5 images without overlaps and emphasize the first',()=>{
 for(let count=1;count<=5;count++){
  const boxes=mosaicBoxes(count,36,158,720,402);
  assert.equal(boxes.length,count);
  for(const [i,a] of boxes.entries()){
   assert.ok(a.x>=36&&a.y>=158&&a.x+a.width<=756.001&&a.y+a.height<=560.001);
   assert.ok(a.width>0&&a.height>24);
   if(i)assert.ok(boxes[0].width*boxes[0].height>a.width*a.height);
   for(const b of boxes.slice(i+1))assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);
  }
 }
 assert.throws(()=>mosaicBoxes(6,0,0,720,402));
});
test('room PDF styles combine only different door and drawer values',()=>{
 assert.equal(combinedStyles('Portrait','Slab'),'Portrait/Slab');
 assert.equal(combinedStyles('Portrait','Portrait'),'Portrait');
 assert.equal(combinedStyles(' Portrait ',null),'Portrait');
 assert.equal(combinedStyles(null,null),'—');
});
test('room groups retain image ordering and legacy unassigned images',()=>{
 const media=[{room_id:'kitchen',id:1},{room_id:'bath',id:2},{room_id:'kitchen',id:3},{room_id:null,id:4}];
 const groups=groupRoomMedia(media);
 assert.deepEqual(groups.get('kitchen').map(i=>i.id),[1,3]);
 assert.deepEqual(groups.get(null).map(i=>i.id),[4]);
});
