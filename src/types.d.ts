import { Hook, Command } from '@oclif/config';

export type HookFunction = (this: Hook.Context, options: HookOptions) => void;

export type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: PreDeployResult;
};

export type PreDeployResult = {
  [aggregateName: string]: {
    mdapiFilePath: string;
    workspaceElements: Array<{
      fullName: string;
      metadataName: string;
      sourcePath: string;
      state: string;
      deleteSupported: boolean;
    }>;
  };
};
