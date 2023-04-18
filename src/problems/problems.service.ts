import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { LanguagesService } from 'src/languages/languages.service';
import { DockerSandBox } from './docker-sandbox';
import { CreateProblemDto } from './dtos/create-problem.dto';
import { SolveProblemDto } from './dtos/solve-problem.dto';
import { ProblemsRepo } from './repos/problems.repo';
import { Problem } from './schemas/problems.schema';

@Injectable()
export class ProblemsService {
  constructor(
    private _problemsRepo: ProblemsRepo,
    private _languagesService: LanguagesService,
  ) {}

  async create(createBody: CreateProblemDto) {
    const problem = await this._problemsRepo.create(createBody);

    return problem;
  }

  async solve(problemId: string, body: SolveProblemDto) {
    const { languageId, code } = body;

    const problem = await this._problemsRepo.findById(problemId);

    const response = await this.validateUserCode(problem, languageId, code);

    return response;
  }

  private async validateUserCode(
    problem: Problem,
    languageId: string,
    code: string,
  ) {
    const passedTestCases = [];

    const testCases = await Promise.all(
      problem.testCases.map(async (testCase) => {
        const stdin_data = testCase.input;

        if (!problem) {
          throw new NotFoundException('problem not found');
        }

        const language = await this._languagesService.findById(languageId);

        // const path = __dirname + '/'; //current working path
        const folder = 'temp/' + this.random(10); //folder in which the temporary folder will be saved
        const vm_name = 'virtual_machine'; //name of virtual machine that we want to execute
        const timeout_value = 60; //Timeout Value, In Seconds

        const sandbox = new DockerSandBox({
          timeout_value,
          path: '/home/arwa/Documents/my-projects/online-judge/src/problems/',
          folder,
          vm_name,
          compiler_name: language.compilerName,
          file_name: language.fileName,
          code,
          output_command: language.outputCommand,
          languageName: language.languageName,
          e_arguments: language.extraArguments,
          stdin_data,
        });

        const { data, time, errors } = await sandbox.run();

        const output = data
          .trim()
          .split('\n')
          .map(function (string) {
            return string.trim();
          });

        const expectedOutput = testCase.expectedOutput
          .trim()
          .split('\n')
          .map(function (string) {
            return string.trim();
          });

        const input = testCase.input
          .trim()
          .split('\n')
          .map(function (string) {
            return string.trim();
          });

        if (!expectedOutput.every((val, index) => val === output[index])) {
          passedTestCases.push(false);
        } else {
          passedTestCases.push(true);
        }

        return {
          input,
          output,
          expectedOutput,
          // code,
          languageId,
          errors,
          time,
        };
      }),
    );

    if (passedTestCases.some((val) => val === false)) {
      return {
        message: 'wrong answer: test case failed',
        testCases,
      };
    } else {
      return {
        message: 'Success',
        testCases,
      };
    }
  }

  private random(size: number) {
    //returns a crypto-safe random
    return randomBytes(size).toString('hex');
  }
}
