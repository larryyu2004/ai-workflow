import { ExecutionEnvironment } from "@/type/executor";
import { NavgateUrlTask } from "../task/NavgateUrl";

export async function NavgateUrlExecutor(
  environment: ExecutionEnvironment<typeof NavgateUrlTask>
): Promise<boolean> {
  try {
    const url = environment.getInput("URL");
    if (!url) {
      environment.log.error("input->url not defined");
    }

    await environment.getPage()!.goto(url);
    environment.log.info(`visited ${url}`);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
