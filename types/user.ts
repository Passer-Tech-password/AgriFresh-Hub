import type { Timestamp } from "firebase/firestore";

import type { UserRole } from "@/types/roles";

export type UserDoc = {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  role: UserRole;
  createdAt: Timestamp;
  proExpiry?: Timestamp | null;
  creditsBalance: number;
  lastProPromptDismissed?: Timestamp | null;
};

