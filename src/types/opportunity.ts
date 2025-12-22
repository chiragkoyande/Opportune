export type OpportunityType = 'hackathon' | 'internship' | 'contest';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  organization: string;
  description: string;
  deadline: Date;
  applyUrl: string;
  location?: string;
  prize?: string;
  tags: string[];
  source: string;
}
