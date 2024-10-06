#!/usr/bin/env ts-node
import {AppConfig} from "./appConfig";
import {HttpServer} from "../../../lib/server/httpServer";

import dev from "../../cfg/dev.example.json";
import {ConfigurationManager} from "../../../lib/utils/configurationManager";


// Note: This being done because JSON.stringify blows up when trying to convert BigInt during serialization.

// eslint-disable-next-line @typescript-eslint/no-redeclare
interface BigInt {
    /** Convert to BigInt to string form in JSON.stringify */
    toJSON: () => string;
}

//@ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};

(async (): Promise<void> => {
    try {
        ConfigurationManager.init(dev);
        let httpServer : HttpServer = new HttpServer(new AppConfig(ConfigurationManager.getConfiguration()));
        await httpServer.start();
    } catch (e) {
        console.error(e);
    }
})();