export type HumanMessage = {
  role: "doctor" | "user";
  content: string;
  suggestions?: string[];
};
