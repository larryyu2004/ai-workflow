import { waitFor } from "@/lib/helper/waitFor";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import Editor from "../_components/Editor";



async function page({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;
  const { userId } = auth();

  if (!userId) {
    return <div>unauthenticated</div>;
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  /*
  <Editor workflow={workflow} /> {
    <FlowEditor workflow={workflow} /> {
      <NodeComponent (props: NodeProps)/> {
        <NodeCard /> {
          <NodeHeader />
          <NodeInputs /> {
            <NodeParamField /> {
              <StringParam />
              <BrowserInstanceParam />
            }
          }
          <NodeOutputs />
        }
      }
    }
  }
  */
  return <Editor workflow={workflow} />;
}

export default page;
