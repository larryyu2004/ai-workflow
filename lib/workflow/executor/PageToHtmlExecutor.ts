import { ExecutionEnvironment } from "@/type/executor";

import { PageToHtmlTask } from "../task/PageToHtml";

export async function PageToHtmlExecutor(
  environment: ExecutionEnvironment<typeof PageToHtmlTask>
): Promise<boolean> {
  try {
    const html = await environment.getPage()!.content()
    environment.setOutput("Html", html)
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
