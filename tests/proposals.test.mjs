import test from 'node:test';
import assert from 'node:assert/strict';
import {depositAmount,depositPercentages} from '../src/features/proposals/model.ts';
test('proposal deposit rounds fractional cents and accepts all offered percentages',()=>{
 assert.equal(depositAmount('12345.67',50),'6172.84');
 assert.equal(depositAmount('0.01',50),'0.01');
 assert.equal(depositAmount('0',50),'0.00');
 for(const percentage of depositPercentages)assert.equal(depositAmount('100.00',percentage),`${percentage}.00`);
});
test('proposal deposit rejects invalid currency and percentages',()=>{
 for(const value of ['-10','NaN','Infinity','1.234',''])assert.throws(()=>depositAmount(value,50));
 for(const value of [0,9,15,91,100,NaN])assert.throws(()=>depositAmount('100',value));
});
