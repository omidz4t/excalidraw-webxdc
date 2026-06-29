import type { ReactNode } from "react";

const Null = () => null;

const PassChildren = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

export const DefaultSidebar = Object.assign(Null, {
  Trigger: Null,
  TabTriggers: PassChildren,
});

export default DefaultSidebar;