import chalk from "chalk";

interface iFlowResult {
    name: string;
    failReason?: string;
}

class ResultHandler {
    private passedFlows: iFlowResult[];
    private failedFlows: iFlowResult[];
    private completedflows: string[];

    constructor() {
        this.passedFlows = [];
        this.failedFlows = [];
        this.completedflows = [];
    }

    public flowPassed(flow: iFlowResult) {
        if (!this.completedflows.includes(flow.name)) {
            this.passedFlows.push(flow);
            this.completedflows.push(flow.name)
        }
    }

    public flowFailed(flow: iFlowResult) {
        if (!this.completedflows.includes(flow.name)) {
            this.failedFlows.push(flow);
            this.completedflows.push(flow.name)
        }
    }

    printResults() {
        console.log(chalk.bold('Test Results:\n'));

        console.log(this.passedFlows);
        console.log(this.failedFlows)

        if (this.passedFlows.length > 0) {
            console.log(chalk.green('Passed Flows:'));
            this.passedFlows.forEach(flow => {
                console.log(chalk.green(`✔ ${flow.name}`));
            });
            console.log();
        }

        if (this.failedFlows.length > 0) {
            console.log(chalk.red('Failed Flows:'));
            this.failedFlows.forEach(flow => {
                console.log(chalk.red(`✘ ${flow.name} - ${flow.failReason}`));
            });
        } else {
            console.log(chalk.green('No failed flows.'));
        }
    }
}


const resultHandler = new ResultHandler();
export default resultHandler;