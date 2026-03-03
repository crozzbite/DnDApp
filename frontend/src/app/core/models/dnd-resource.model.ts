export interface ResourceReference {
  index: string;
  name: string;
  url: string;
}

export interface Choice {
  description: string;
  choose: number;
  type: string;
  from: OptionSet;
}

export interface OptionSet {
  optionSetType: string;
  options: any[];
}
