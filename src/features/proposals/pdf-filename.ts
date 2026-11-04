/** Download date follows the business timezone rather than the server timezone. */
export function proposalPdfFilename(projectName:string,date=new Date()){
 const name=projectName.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100).replace(/-$/,'')||'Project';
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const value=(type:string)=>parts.find(part=>part.type===type)!.value;
 return `${name}-Proposal-${value('year')}-${value('month')}-${value('day')}.pdf`;
}
