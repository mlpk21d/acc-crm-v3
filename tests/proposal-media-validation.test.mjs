import assert from 'node:assert/strict';
import test from 'node:test';
import {mediaSchema} from '../src/features/proposals/media-validation.ts';
const image={id:'00000000-0000-4000-8000-000000000001',title:'',fresh:false,room_id:'00000000-0000-4000-8000-000000000010',is_main:false};
test('proposal media allows no main image and an unassigned main image',()=>{
 assert.ok(mediaSchema.safeParse([]).success);
 assert.ok(mediaSchema.safeParse([image]).success);
 assert.ok(mediaSchema.safeParse([{...image,is_main:true,room_id:null}]).success);
 assert.ok(mediaSchema.safeParse([{...image,is_main:true}]).success);
});
test('proposal media allows multiple main images and requires rooms for other images',()=>{
 assert.equal(mediaSchema.safeParse([{...image,room_id:null}]).success,false);
 assert.ok(mediaSchema.safeParse([{...image,is_main:true,room_id:null},{...image,id:'00000000-0000-4000-8000-000000000002',is_main:true,room_id:null}]).success);
});
