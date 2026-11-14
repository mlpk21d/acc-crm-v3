import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {groupRows,orderSchema,inches} from '../src/features/door-orders/model.ts';
import {parseKcd} from '../src/features/door-orders/parse.ts';
const row=(patch={})=>({id:randomUUID(),kind:'Door',width:'16 1/4',height:'30',quantity:2,numbers:'70',source:'source',reviewed:true,...patch});
test('grouping keeps type separate, sums pieces, and preserves unique cabinet references',()=>{
 const rows=groupRows([row({kind:'Drawer'}),row(),row({width:'16.25',numbers:'71',reviewed:false})]);
 assert.deepEqual(rows.map(r=>[r.kind,r.quantity,r.numbers,r.reviewed]),[['Door',4,'70, 71',false],['Drawer',2,'70',true]]);
});
test('dimensions and quantities are validated before persistence',()=>{
 assert.equal(inches('12 3/16'),12.1875);assert.ok(Number.isNaN(inches('1/0')));
 const order={name:'Order',rooms:[{id:randomUUID(),name:'Kitchen',style:'',species:'',rows:[row()]}],warnings:[]};
 assert.ok(orderSchema.safeParse(order).success);order.rooms[0].rows[0].width='0';assert.equal(orderSchema.safeParse(order).success,false);
});
const item=(text,x,y,font='bold')=>({text,x,y,font,height:10});
const drawing=(room,unit)=>({height:792,items:[item('Not To Scale',519,691,'regular'),item(`${room} - Wall 2`,250,688),item(unit,130,240),item('79',150,230,'regular')]});
const list=(text)=>[{height:792,items:[item(text,50,600)]}];
test('KCD cross-room size rows split quantities; dimension labels do not become units',()=>{
 const o=parseKcd([drawing('Kitchen','5'),drawing('Wet Bar','79')],list('1)5 1)79 2 24 7/8 x 12 11/16 FLAT'),'Order');
 assert.deepEqual(o.rooms.map(r=>[r.name,r.rows[0].quantity,r.rows[0].numbers]),[['Kitchen',1,'5'],['Wet Bar',1,'79']]);
 assert.ok(o.rooms.every(r=>!r.rows[0].reviewed));
});
test('conflicting or missing rooms are explicit, not guessed',()=>{
 const o=parseKcd([drawing('Kitchen','5'),drawing('Bath','5')],list('1)5 1)79 2 24 7/8 x 12 11/16 FLAT'),'Order');
 assert.equal(o.rooms[0].name,'Unassigned - review');assert.equal(o.warnings.length,3);
});
test('malformed and inconsistent KCD rows reject import without silent loss',()=>{
 assert.throws(()=>parseKcd([],list('1)5 2 24 x 12 FLAT'),'Order'),/Quantity/);
 assert.throws(()=>parseKcd([],list('1)5 invalid'),'Order'),/Could not read/);
 assert.throws(()=>parseKcd([],list('scanned page'),'Order'),/No KCD/);
});
test('tall FLAT fronts are suggested as doors and remain unreviewed',()=>{
 const o=parseKcd([drawing('Kitchen','1')],list('1)1 1 11 7/8 x 30 3/8 FLAT'),'Order');assert.equal(o.rooms[0].rows[0].kind,'Door');assert.equal(o.rooms[0].rows[0].reviewed,false);
});

test('Franklin sample preserves all 80 pieces in four drawing groups',async()=>{
 const {readFile}=await import('node:fs/promises');const fixture=JSON.parse(await readFile(new URL('./fixtures/kcd-franklin-text.json',import.meta.url),'utf8'));const order=parseKcd(fixture.drawings,fixture.list,'Franklin');
 assert.deepEqual(order.rooms.map(r=>[r.name,r.rows.reduce((s,row)=>s+row.quantity,0)]),[['Kitchen Perimeter',39],['Kitchen Island',16],['Primary Bath',17],['Wet Bar',8]]);
 assert.equal(order.warnings.length,1);assert.ok(orderSchema.safeParse(order).success);
});
test('supplier PDF repeats room details on continuation forms and prints unit numbers with dimensions', async () => {
 const {doorOrderPdf} = await import('../src/features/door-orders/pdf.ts');
 const {readPdf} = await import('../src/features/door-orders/read-pdf.ts');
 const doors = Array.from({length: 21}, (_, i) => row({height: String(44 - i), numbers: '70,71'}));
 const drawers = Array.from({length: 21}, (_, i) => row({kind: 'Drawer', height: String(24 - i), numbers: '82, 83'}));
 const pdf = await doorOrderPdf({name: 'Franklin', warnings: [], rooms: [
  {id: randomUUID(), name: 'Kitchen Perimeter', style: 'Shaker', species: 'White Oak', rows: [...doors, ...drawers]},
  {id: randomUUID(), name: 'Wet Bar', style: 'Slab', species: 'Maple', rows: [row({numbers: '91'})]},
 ]});
 const pages = (await readPdf(new Uint8Array(pdf))).map(page => page.items.map(item => item.text).join(' ').replace(/\s+/g, ' '));
 assert.equal(pages.length, 3);
 for (const [index, heights] of [[0, [44, 24]], [1, [24, 4]]]) {
  assert.match(pages[index], /Kitchen Perimeter/);
  assert.match(pages[index], /Shaker/);
  assert.match(pages[index], /White Oak/);
  assert.ok(pages[index].includes(`(70, 71) 16 1/4 x ${heights[0]}`));
  assert.ok(pages[index].includes(`(82, 83) 16 1/4 x ${heights[1]}`));
 }
 assert.match(pages[2], /Wet Bar/);
 assert.match(pages[2], /Slab/);
 assert.match(pages[2], /Maple/);
 assert.ok(pages[2].includes('(91) 16 1/4 x 30'));
 assert.doesNotMatch(pages[2], /Kitchen Perimeter/);
});
