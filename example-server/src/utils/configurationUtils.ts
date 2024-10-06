import {LoggingMethod} from "../../../lib/logger/logger";
import {Configuration} from "../../../lib/utils/configurationManager";
import {FileSystemDriver} from "../../../lib/services/fileSystemService";


export interface BackEndConfiguration extends Configuration {
    name: string
    port: number
    hostname: string
    https: string
    byPassValidation: true
    logging: {
        path: string
        method: LoggingMethod
    },
    memDb: {
        hostname: string
        port: number
    },
}
