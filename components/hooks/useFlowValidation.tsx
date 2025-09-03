import { useContext } from "react";
import { FlowValidationContext } from "../context/FlowValidationContext";

export default function () {
  const context = useContext(FlowValidationContext);
  if (!context) {
    throw new Error(
      "useFlowValidation must be used within a FlowValidationContext"
    );
  }
  return context;
}
