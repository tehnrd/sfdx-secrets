/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as path from 'path';
import * as fs from 'fs';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';

const ENV_VAR_NAME = 'SECRET_KEY_TEST_SFDX_SECRETS';
const ENV_VAR_VALUE = 'mysupersecrtkey';

describe('execCmd', () => {
  let testSession: TestSession;

  beforeEach(async () => {
    testSession = await TestSession.create({
      project: {
        sourceDir: path.join(process.cwd(), '/test/testProject'),
      },
    });
  });

  it('replaces secret placeholder', () => {
    process.env[ENV_VAR_NAME] = ENV_VAR_VALUE;

    const fileBefore = fs.readFileSync(
      path.join(process.cwd(), '/force-app/main/default/customMetadata/Settings.Org.md-meta.xml'),
      { encoding: 'utf-8' }
    );

    expect(fileBefore).toContain(`<value xsi:type="xsd:string">{{${ENV_VAR_NAME}}}</value>`);

    execCmd('secrets:replace', { ensureExitCode: 0 });

    const fileAfter = fs.readFileSync(
      path.join(process.cwd(), '/force-app/main/default/customMetadata/Settings.Org.md-meta.xml'),
      { encoding: 'utf-8' }
    );

    expect(fileAfter).toContain(`<value xsi:type="xsd:string">${ENV_VAR_VALUE}</value>`);
  });

  it('no env var secret defined', () => {
    delete process.env[ENV_VAR_NAME];

    const rv = execCmd('secrets:replace', { ensureExitCode: 1 });

    expect(rv.shellOutput.stderr).toContain(`Unable to determine value for env var ${ENV_VAR_NAME}`);
  });

  afterEach(async () => {
    await testSession.clean();
  });
});
