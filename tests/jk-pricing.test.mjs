import assert from 'node:assert/strict';
import test from 'node:test';
import {jkTotalCents} from '../src/features/projects/jk-model.ts';
const cabinet=(price,quantity)=>({price_item_id:null,item:'Custom cabinet',description:'',hinge_direction:'',quantity,custom:true,price});
test('J&K draft total applies a 20 percent discount and $20 assembly charges',()=>{
 assert.equal(jkTotalCents({items:[cabinet(100,2),cabinet(250,1)],assemblyCount:3}),42000);
});
test('J&K draft rounds discounted unit prices to cents before multiplying quantities',()=>{
 assert.equal(jkTotalCents({items:[cabinet(0.03,3)],assemblyCount:2}),4006);
 assert.equal(jkTotalCents({items:[],assemblyCount:0}),0);
});
