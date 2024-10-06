import fs from "fs";
import {HttpServerConfiguration} from "../../../lib/server/httpServer";
import {Route} from "../../../lib/server/restfulController";
import {Logger} from "../../../lib/logger/logger";
import {ExampleController} from "../controllers/example";
import {Configuration} from "../../../lib/utils/configurationManager";
import {BackEndConfiguration} from "../utils/configurationUtils";


export class AppConfig implements HttpServerConfiguration {

    private readonly _port: number;
    private _timeOut: number = 10_000;
    private _version: string = "0.0.1";
    private readonly _environment: string;
    private _configuration: BackEndConfiguration;

    constructor(configuration: Configuration) {

        this._configuration = configuration as BackEndConfiguration;
        this._port = this._configuration.port;
        this._environment = this._configuration.name;
    }

    get environment() : string {
        return this._environment;
    }

    get port(): number {
        return this._port;
    }

    get timeOut(): number {
        return this._timeOut;
    }

    get version(): string {
        return this._version;
    }

    defineRoutes(): Array<Route> {
        let routes: Array<Route> = [];

        routes.push(...new ExampleController(this._configuration).routes());
    

        return routes;
    }

    async init(): Promise<void> {


        Logger.init(
            this._configuration.logging.method,
            `example-server.log`
        );

        Logger.info("example-server initialized")
        Logger.info("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    }
}