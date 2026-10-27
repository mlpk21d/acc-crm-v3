import assert from 'node:assert/strict';
import test from 'node:test';
import {Client} from 'pg';

test('proposals enforce required projects and valid deposits, and persist ordered media',async()=>{
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
 const db=new Client({connectionString:process.env.DATABASE_URL});await db.connect();
 try{
  await db.query('BEGIN');
  const project=(await db.query("INSERT INTO public.projects(name,status) VALUES('Proposal integration test','planned') RETURNING id")).rows[0].id;
  const proposal=(await db.query('INSERT INTO public.proposals(project_id) VALUES($1) RETURNING *',[project])).rows[0];
  assert.equal(proposal.deposit_percentage,50);assert.equal(proposal.include_room_finishes,false);
  async function rejected(sql,params,code){await db.query('SAVEPOINT invalid_input');await assert.rejects(db.query(sql,params),error=>error.code===code);await db.query('ROLLBACK TO SAVEPOINT invalid_input');}
  await rejected('INSERT INTO public.proposals DEFAULT VALUES',[],'23502');
  await rejected("INSERT INTO public.proposals(project_id) VALUES('00000000-0000-4000-8000-000000000001')",[],'23503');
  await rejected('UPDATE public.proposals SET deposit_percentage=15 WHERE id=$1',[proposal.id],'23514');
  await rejected('DELETE FROM public.projects WHERE id=$1',[project],'23503');
  await db.query("INSERT INTO public.proposal_media(proposal_id,title,filename,mime_type,image_data,sort_order) VALUES($1,'Second','two.png','image/png',$2,1),($1,'First','one.png','image/png',$2,0)",[proposal.id,Buffer.from([1])]);
  assert.deepEqual((await db.query('SELECT title FROM public.proposal_media WHERE proposal_id=$1 ORDER BY sort_order,id',[proposal.id])).rows.map(row=>row.title),['First','Second']);
  await db.query('DELETE FROM public.proposals WHERE id=$1',[proposal.id]);
  assert.equal((await db.query('SELECT id FROM public.proposal_media WHERE proposal_id=$1',[proposal.id])).rowCount,0);
 }finally{await db.query('ROLLBACK');await db.end();}
});
