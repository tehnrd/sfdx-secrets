import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

import { SfdxCommand } from '@salesforce/command';
import { SfdxError, Messages } from '@salesforce/core';

import chalk from 'chalk';

import { replaceSecretsInFile } from '../../hooks/predeploy/replaceSecrets';

const log = console.log; // eslint-disable-line
const error = console.error; // eslint-disable-line

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-secrets', 'messages');

export default class Replace extends SfdxCommand {
  public static examples = messages.getMessage('examples').split(os.EOL);

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public getFiles = (startDirectory: string): string[] => {
    const files: string[] = [];

    const getFilesRecursively = (directory: string): void => {
      const filesInDirectory = fs.readdirSync(directory);
      for (const file of filesInDirectory) {
        const absolute = path.join(directory, file);
        if (fs.statSync(absolute).isDirectory()) {
          getFilesRecursively(absolute);
        } else {
          files.push(absolute);
        }
      }
    };

    getFilesRecursively(startDirectory);

    return files;
  };

  public run(): Promise<void> {
    try {
      const startTime = new Date().getTime();

      log(chalk.blue('sfdx-secrets starting...'));

      this.project?.getPackageDirectories().forEach((e) => {
        const filePaths = this.getFiles(e.fullPath);

        for (const filePath of filePaths) {
          replaceSecretsInFile(filePath);
        }
      });

      log(chalk.blue(`sfdx-secrets completed in ${new Date().getTime() - startTime}ms`));
    } catch (e) {
      if (e instanceof SfdxError) {
        throw e;
      } else {
        error(e);
        throw new SfdxError('An unexpected error has occured.');
      }
    }

    return new Promise(function (resolve) {
      resolve();
    });
  }
}
