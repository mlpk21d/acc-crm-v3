export const depositPercentages = [10,20,30,40,50,60,70,80,90] as const;
export const maxMediaBytes = 5 * 1024 * 1024;
export const maxImageBytes = 2 * 1024 * 1024;
export type ProposalProject = {id:string;name:string;contact:string;price:string};
export type ProposalMedia = {id:string;title:string;filename:string};
export type Proposal = {id:string;project_id:string;deposit_percentage:number;include_room_finishes:boolean;created_at:string;updated_at:string};
export function depositAmount(price:string, percentage:number):string {
 if(!/^\d+(\.\d{1,2})?$/.test(price)||!depositPercentages.includes(percentage as typeof depositPercentages[number])) throw new Error('Invalid proposal amount.');
 const [whole,fraction='']=price.split('.');
 const cents=BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
 const deposit=(cents*BigInt(percentage)+50n)/100n;
 return `${deposit/100n}.${String(deposit%100n).padStart(2,'0')}`;
}
export function money(value:string) {return Number(value).toLocaleString('en-US',{style:'currency',currency:'USD'});}
