import { ExecutionEnvironment } from "@/type/executor";
import { FillInputTask } from "../task/FillInput";
import { waitFor } from "@/lib/helper/waitFor";
import { ClickElementTask } from "../task/ClickElement";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";

export async function ExtractDataWithAIExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
): Promise<boolean> {
  try {
    const content = environment.getInput("Content");
    if (!content) {
      environment.log.error("input->content not defined");
    }

    const credentials = environment.getInput("Credentials");
    if (!credentials) {
      environment.log.error("input->credentials not defined");
    }

    const prompt = environment.getInput("Prompt");
    if (!prompt) {
      environment.log.error("input->prompt not defined");
    }

    // Get credentials from DB
    const credential = await prisma.credential.findUnique({
      where: { id: credentials },
    });
    if (!credential) {
      environment.log.error("credential not found");
      return false;
    }

    const plainCredentialValue = symmetricDecrypt(credential.value);
    if (!plainCredentialValue) {
      environment.log.error("cannot decrypt credential");
      return false;
    }

    const mockExtractedData = {
      usernameSelector: "#username",
      passwordSelector: "#password",
      loginSelector: "body > div.container > form > input.btn.btn-primary",
    };
    environment.setOutput("Extracted data", JSON.stringify(mockExtractedData));
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
