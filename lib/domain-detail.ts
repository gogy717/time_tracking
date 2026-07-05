export type DomainDetailSession = {
  id: string;
  startTime: string;
  durationMinutes: number | null;
  note: string | null;
};

export type DomainDetailPayload = {
  domain: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    targetHours: number;
    targetDate: string | null;
  };
  initialTotalMinutes: number;
  weeklyAvgMinutes: number;
  initialSessions: DomainDetailSession[];
};
