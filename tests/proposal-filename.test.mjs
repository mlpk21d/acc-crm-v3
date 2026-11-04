import assert from 'node:assert/strict';
import test from 'node:test';
import {proposalPdfFilename} from '../src/features/proposals/pdf-filename.ts';
test('proposal downloads include safe project name and business download date',()=>{
 const date=new Date('2026-11-04T02:00:00Z');
 assert.equal(proposalPdfFilename('174 Ivy Lane',date),'174-Ivy-Lane-Proposal-2026-11-03.pdf');
 assert.equal(proposalPdfFilename(' Café / Kitchen "A" ',date),'Cafe-Kitchen-A-Proposal-2026-11-03.pdf');
 assert.equal(proposalPdfFilename('!!!',date),'Project-Proposal-2026-11-03.pdf');
 assert.equal(proposalPdfFilename('Test',new Date('2026-11-04T15:00:00Z')),'Test-Proposal-2026-11-04.pdf');
});
