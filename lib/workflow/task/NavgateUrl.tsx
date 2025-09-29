import { TaskParamType, TaskType } from "@/type/task";
import { WorkflowTask } from "@/type/workflow";
import { Link2Icon, LucideProps } from "lucide-react";

export const NavgateUrlTask = {
  type: TaskType.NAVGATE_URL,
  label: "Navgate Url",
  icon: (props: LucideProps) => (
    <Link2Icon className="stroke-orange-400" {...props} />
  ),
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "URL",
      type: TaskParamType.STRING,
      required: true,
    },
  ] as const,
  outputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ] as const,
} satisfies WorkflowTask;
