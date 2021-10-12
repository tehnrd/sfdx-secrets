import * as fs from 'fs';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { SfdxError } from '@salesforce/core';

import { HookFunction } from '../../types';

const log = console.log; // eslint-disable-line
const error = console.error; // eslint-disable-line

// Read and set environment variables from the project .env file
dotenv.config({ path: `${process.env.PWD}/.env` });

export const hook: HookFunction = (options) => {
  try {
    // Save the start time
    const startTime = new Date().getTime();

    log(chalk.blue('sfdx-secrets starting...'));

    if (options.result) {
      Object.keys(options.result).forEach((mdapiElementName) => {
        const mdapiElement = options.result?.[mdapiElementName];

        // Update the object in the org (the metadata that is being deployed)
        if (mdapiElement?.mdapiFilePath) {
          readAndProcessFile(mdapiElement.mdapiFilePath);
        }
      });
    }

    log(chalk.blue(`sfdx-secrets completed in ${new Date().getTime() - startTime}ms`));
  } catch (e) {
    error(e);
    throw new SfdxError('An unexpected error has occured.');
  }
};

function readAndProcessFile(metaPath: string): void {
  // Try to read the metadata file
  let metaFileStat;
  try {
    metaFileStat = fs.statSync(metaPath);
  } catch (e) {
    log('Unable to read: ' + metaPath);
  }

  // Replace the secret placeholders in the metadata file
  if (metaPath && metaFileStat) replaceSecretsInFile(metaPath);

  // Try to read the non -meta.xml file, this file may not always exist
  let fileStat;
  const filePath = metaPath.substring(0, metaPath.indexOf('-meta.xml'));
  if (filePath) {
    try {
      fileStat = fs.statSync(filePath);
    } catch (e) {
      log('Unable to read: ' + filePath);
    }

    // Replace the secret placeholders in the non -meta.xml file
    if (filePath && fileStat) replaceSecretsInFile(filePath);
  }
}

export function replaceSecretsInFile(filePath: string): void {
  // Define a regex that will match {{SECRET_TOKEN}}
  const mergeRegex = /{{[A-Za-z0-9_]+}}/gm;

  let file = fs.readFileSync(filePath, { encoding: 'utf-8' });

  // Find all token matches in the file
  const matches = file.matchAll(mergeRegex);

  // For each match, attempt to find the related env var value and replace the token placeholder
  for (const match of matches) {
    const mergeToken: string = match[0];

    // Strip the {{ }} characters
    const envVar = mergeToken.replaceAll('{', '').replaceAll('}', '').trim();

    // Get the value from environment variable
    const envVarValue = process.env[envVar];

    // Exit the process and abort deploy if environment variable can't be found
    if (!envVarValue) {
      throw new SfdxError(
        `Unable to determine value for env var ${envVar}. Please ensure it is defined in the current environment.`
      );
    }

    // Replace the token place holder in the file with the env var value and update the file on disk
    file = file.replaceAll(mergeToken, envVarValue);
    fs.writeFileSync(filePath, file);
  }
}
