export type ParameterType = 'text' | 'number' | 'enum';

export interface EnumValue {
  value: string;
  label: string;
  description?: string;
}

export interface Parameter {
  type: ParameterType;
  placeholder?: string;
  enumValues?: EnumValue[];
  defaultValue?: string | number;
}

export interface Flag {
  id: string;
  flag: string;
  description: string;
  link?: string;
  selected?: boolean;
  parameter?: Parameter;
}

export interface Option {
  id: string;
  option: string;
  description: string;
  link?: string;
  selected?: boolean;
  parameter?: Parameter;
}

export interface Example {
  command: string;
  description: string;
  presets: {
    [flagOrOptionId: string]: {
      selected: boolean;
      value?: string | number;
    };
  };
}

export interface Command {
  id: string;
  name: string;
  description: string;
  link?: string;
  flags: Flag[];
  options: Option[];
  examples?: Example[];
}

export interface CommandData {
  commands: Command[];
}
