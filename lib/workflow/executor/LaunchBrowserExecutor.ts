import { waitFor } from "@/lib/helper/waitFor";
import { ExecutionEnvironment } from "@/type/executor";

import puppeteer from "puppeteer";
export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url")
    console.log("@@WEBSITE URL", websiteUrl);
    const browser = await puppeteer.launch({
      headless: false, // fo r testing
    });
    await waitFor(1000);
    await browser.close();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
