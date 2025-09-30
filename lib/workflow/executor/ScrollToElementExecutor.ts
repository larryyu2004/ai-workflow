import { ExecutionEnvironment } from "@/type/executor";
import { FillInputTask } from "../task/FillInput";
import { waitFor } from "@/lib/helper/waitFor";
import { ClickElementTask } from "../task/ClickElement";
import { ScrollToElementTask } from "../task/ScrollToElement";

export async function ScrollToElementExecutor(
  environment: ExecutionEnvironment<typeof ScrollToElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");
    if (!selector) {
      environment.log.error("input->selector not defined");
    }

    await environment.getPage()!.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error("element not found");
      }
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top });
    }, selector);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
