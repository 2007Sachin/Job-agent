"use client";

import { HomeScreen } from "@/components/home-screen";
import { useStore } from "@/lib/store";
import { useState } from "react";

export default function HomePage() {
  const { applications, outreach, profile, patchOutreach } = useStore();
  const [role, setRole] = useState(profile.targetRoles[0] || "");
  const [location, setLocation] = useState(profile.locations[0] || "");
  const today = new Date().toISOString().slice(0, 10);
  const due = outreach.filter((item) => item.followUpOn && item.followUpOn <= today && item.status !== "replied");
  const resumes = applications.filter((app) => app.tailoredResume.trim());

  return (
    <HomeScreen
      role={role}
      location={location}
      onRole={setRole}
      onLocation={setLocation}
      recent={applications.slice(0, 3)}
      due={due}
      resumes={resumes}
      applications={applications}
      onDone={(id) => patchOutreach(id, { followUpOn: null })}
    />
  );
}
