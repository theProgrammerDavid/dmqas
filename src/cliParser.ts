import minimist from 'minimist';
import { CliArgs } from './validations'

export const args = CliArgs.parse(minimist(process.argv.slice(2), {
    string: ["config"],
    boolean: ["headless"],
}))