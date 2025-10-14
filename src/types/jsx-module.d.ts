// src/types/jsx-module.d.ts
import React from "react";

declare module "*.jsx" {
  const Component: React.ComponentType<any>;
  export default Component;
}
