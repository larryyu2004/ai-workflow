import "server-only";
import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/type/workflow";
import { ExecutionPhase, Prisma } from "@prisma/client";
import { waitFor } from "../helper/waitFor";
import { AppNode } from "@/type/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executor/registry";
import { Environment, ExecutionEnvironment } from "@/type/executor";

export async function ExecuteWorkflow(executionId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    include: { workflow: true, phases: true },
  });
  if (!execution) {
    throw new Error("execution not found");
  }

  // Setup execution environment
  const environment: Environment = { phases: {} };

  // Initialize workflow execution
  await initializeWorkflowExecution(executionId, execution.workflowId);

  // Initialize phases statuses
  await initializePhasesStatuses(execution);

  let creditsConsumed = 0;
  let executionFailed = false;
  for (const phase of execution.phases) {
    // TODO:  consume credits
    // Execute phase
    const phaseExecution = await executeWorkflowPhase(phase, environment);
    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
  }

  //  Finalize execution
  await finalizeWorkflowExecution(
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed
  );
  //  TODO:  clean up environment
  revalidatePath("/workflows/runs");
}

async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string
) {
  await prisma.workflowExecution.update({
    where: {
      id: executionId,
    },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunId: executionId,
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
    },
  });
}

async function initializePhasesStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    },
  });

  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId,
      },
      data: {
        lastRunStatus: finalStatus,
      },
    })
    .catch((err) => {
      // ignore
      // this means that we have triggered other runs for this workflow
      // while an execution was runningl
    });
}

async function executeWorkflowPhase(
  phase: ExecutionPhase,
  environment: Environment
) {
  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;
  setupEnvironmentForPhase(node, environment);
  // Update phase status
  await prisma.executionPhase.update({
    where: { id: phase.id },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
    },
  });

  const creditsRequired = TaskRegistry[node.data.type].credits;
  console.log(
    `Executing phase ${phase.name} with ${creditsRequired} credits required`
  );

  // TODO: decrement user balance ( with required credits )

  const success = await executePhase(phase, node, environment);
  await finalizePhase(phase.id, success);
  return { success };
}

async function finalizePhase(phaseId: string, success: boolean) {
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;
  await prisma.executionPhase.update({
    where: {
      id: phaseId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
    },
  });
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  environment: Environment
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];
  if (!runFn) {
    return false;
  }

  const executionEnvironment: ExecutionEnvironment = createExecutionEnvironment(
    node,
    environment
  );
  return await runFn(executionEnvironment);
}

function setupEnvironmentForPhase(node: AppNode, environment: Environment) {
  environment.phases[node.id] = { inputs: {}, outputs: {} };
  const inputs = TaskRegistry[node.data.type].inputs;
  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    if (inputValue) {
      /*
      environment = {
        phases: {
          node.id: {
            inputs: {
              input.name: input value,
              input.name: input value
            }
            outputs: {
              output.name: output value,
              output.name: output value
            }
          }
        }
      }
       */
      environment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }
  }
}

function createExecutionEnvironment(node: AppNode, environment: Environment) {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name],
  };
}
