import type React from "react";

export type CreatorConfigContext = {
  configTab: string;
  enrollment: string;
  pubStatus: string;
  setEnrollment: React.Dispatch<React.SetStateAction<string>>;
  setPubStatus: React.Dispatch<React.SetStateAction<string>>;
  setVisibility: React.Dispatch<React.SetStateAction<string>>;
  visibility: string;
};
