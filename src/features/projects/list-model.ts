export const projectColumns = [
  ['project_name','Project Name'],['project_status','Current Status'],['next_step','Next Step'],
  ['order_by_date','Order By Date'],['official_start_date','Official Start Date'],['install_date','Install Date'],
  ['sample_signoff','Sample Signoff'],['drawing_approved','Drawing Approved'],['contact','Contact'],
  ['profit','Profit'],['total_cost','Total Cost'],['updated_at','Last Edited'],
] as const;
export type ProjectColumn = (typeof projectColumns)[number][0];
export const defaultHidden: ProjectColumn[] = ['sample_signoff','drawing_approved','updated_at'];
export type ProjectListFilters = {q:string;status:string;featured:boolean;page:number;sort:ProjectColumn;direction:'asc'|'desc'};
export const defaultFilters:ProjectListFilters={q:'',status:'',featured:false,page:1,sort:'updated_at',direction:'desc'};
export type ProjectListRow={id:string;project_name:string;project_status:string;status_label:string;status_color:string|null;next_step:string|null;order_by_date:string|null;official_start_date:string|null;install_date:string|null;sample_signoff:string|null;drawing_approved:boolean;contact:string|null;featured:boolean;updated_at:string;profit?:string;total_cost?:string};
export type ProjectListResult={rows:ProjectListRow[];total:number};
export function allowedColumns(admin:boolean){return projectColumns.filter(([key])=>admin||!['profit','total_cost'].includes(key));}
