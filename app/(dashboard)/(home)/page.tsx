import { GetPeriods } from "@/actions/analytics/getPeriods";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense>
        <PeriodSelectorWrapper />
      </Suspense>
    </div>
  );
};

async function PeriodSelectorWrapper() {
  const periods = await GetPeriods();
  return <pre>{JSON.stringify(periods, null, 4)}</pre>;
}
export default page;
