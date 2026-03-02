import TabLinks from "@/components/TabLinks";
import Gap from "@/components/ui/gap";
import React from "react";

export default function Dashboard() {
  return (
    <section>
      <div className="px-4">
        <p className="text-sm font-normal">Projects</p>
        <h2 className="font-inter text-2xl font-medium">Team Project</h2>
      </div>

      <Gap />
      <TabLinks />
    </section>
  );
}
