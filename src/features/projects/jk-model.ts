export type JkSelection={price_item_id:string|null;item:string;description:string;hinge_direction:""|"L"|"R";quantity:number;custom:boolean;price:number};
export type JkDraft={items:JkSelection[];assemblyCount:number};
export function jkTotalCents(config:JkDraft){
 return config.items.reduce((sum,item)=>sum+Math.round(item.price*100)*item.quantity,0)+config.assemblyCount*2000;
}
