// src/types/custom.d.ts
declare module "*.postcss" {
    const content: string;  // Adjust this if you want more specific typing
    export default content;
}

declare module "*.svg?react" {
    import { SVGProps } from "react";
    const content: React.FunctionComponent<SVGProps<SVGSVGElement>>;
    export default content;
}