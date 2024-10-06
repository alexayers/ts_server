import * as process from "process";

export interface Configuration {
    name: string
    port: number
    https: string
    hostname: string
}

export class ConfigurationManager {

    static _dev : any;
    static _prod: any;

    static init(dev: any, prod?: any): void {
        ConfigurationManager._dev = dev;
        ConfigurationManager._prod = prod;
    }

    static getConfiguration(): any {

        let commandTokens: string[] = [];
        let isProduction: boolean = false;

        if (process.env.npm_lifecycle_script) {
            commandTokens = process.env.npm_lifecycle_script.split(" ");
            if (commandTokens.length == 3 && commandTokens[2] == "env:prod") {
                isProduction = true;
            }
        } else if (process.argv) {
            if (process.argv[2] == "env:prod") {
                isProduction = true;
            }
        }

        if (isProduction) {
            return ConfigurationManager._prod as any;
        } else {
            return ConfigurationManager._dev as any;
        }

    }

}
