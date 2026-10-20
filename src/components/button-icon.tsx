import type { SVGProps, ReactNode } from "react";

export type ButtonIconKind="add"|"save"|"edit"|"delete"|"close"|"search"|"filter"|"up"|"down"|"check"|"login"|"logout"|"settings"|"link"|"back"|"menu"|"default";
const paths:Record<ButtonIconKind,ReactNode>={
 add:<path d="M12 5v14M5 12h14"/>,
 save:<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M7 3v6h10V3M7 21v-9h10v9"/></>,
 edit:<><path d="M12 20h9"/><path d="m16 4 4 4-11 11-5 1 1-5L16 4Z"/></>,
 delete:<><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/><path d="M10 10v7M14 10v7"/></>,
 close:<path d="M18 6 6 18M6 6l12 12"/>,
 search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
 filter:<><path d="M4 7h16M7 12h10M10 17h4"/></>,
 up:<path d="m6 15 6-6 6 6"/>,
 down:<path d="m6 9 6 6 6-6"/>,
 check:<path d="m5 12 4 4L19 6"/>,
 login:<><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
 logout:<><path d="m9 17-5-5 5-5M4 12h12"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></>,
 link:<><path d="M10 13a5 5 0 0 0 7 .3l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7-.3l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></>,
 back:<path d="m15 18-6-6 6-6"/>,
 menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
 default:<circle cx="12" cy="12" r="7"/>
};
export function ButtonIcon({kind="default",...props}:{kind?:ButtonIconKind}&SVGProps<SVGSVGElement>){
 return <svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"-0.17em",flexShrink:0,marginInlineStart:"0.35em",...props.style}} {...props}>{paths[kind]}</svg>;
}
