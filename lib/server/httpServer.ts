import {createServer, IncomingMessage, ServerResponse} from 'http';
import {HttpMethod, RestfulRequest, RestfulResponse, Route} from "./restfulController";
import {Logger} from "../logger/logger";
import console from "console";

const SOFTWARE_VERSION: string = "0.0.1";

export interface HttpServerConfiguration {
    environment: string
    port: number
    timeOut: number
    version: string

    defineRoutes(): Array<Route>
    init(): Promise<void>
}

export class HttpServer {

    private _server;
    private _httpServerConfiguration: HttpServerConfiguration;
    private _getRoutes: Map<string, Route> = new Map<string, Route>();
    private _postRoutes: Map<string, Route> = new Map<string, Route>();
    private _patchRoutes: Map<string, Route> = new Map<string, Route>();
    private _putRoutes: Map<string, Route> = new Map<string, Route>();
    private _deleteRoutes: Map<string, Route> = new Map<string, Route>();

    private static headers = {
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json',
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Forwarded-For, Authorization, Trace",
        "Access-Control-Max-Age": 2592000, // 30 days
        "application": SOFTWARE_VERSION
    };

    constructor(httpServerConfiguration: HttpServerConfiguration) {

        this._httpServerConfiguration = httpServerConfiguration;
    }

    async start(): Promise<void> {

        await this._httpServerConfiguration.init();
        this.initRoutes();

        this._server = createServer(async (request: IncomingMessage, response: ServerResponse) => {

            if (request.url == null) {
                console.log("Something went horribly wrong 1");
                response.end();
                return;
            }

            if (request.method == undefined) {
                response.writeHead(200, HttpServer.headers);
                response.end('{"Error": "Your request is missing a header."}');
                response.end();
                return;
            }

            if (request.method == "OPTIONS") {
                response.writeHead(200, HttpServer.headers);
                response.end();
                return;
            }

            let route: {
                route: Route | undefined;
                pathParams: Map<string, any>;
                queryParams: Map<string, any>;
                body: any | undefined
            } | undefined = await this.findRoute(request);

            if (route && route.route) {

                let restfulRequest : RestfulRequest = {
                    pathParams: route.pathParams,
                    requestHeaders: this.extractHeaders(request.rawHeaders),
                    queryParams: route.queryParams,
                    body: route.body
                }

                if (route.route.authInterceptor) {
                    let isAuthorized: boolean = false;

                    try {
                        isAuthorized = await route.route.authInterceptor.interceptor(restfulRequest);
                    } catch (e) {
                        Logger.error(`${e}`);
                    }

                    if (!isAuthorized) {
                        response.writeHead(401, HttpServer.headers);
                        response.end(JSON.stringify({errorMsg: "This route requires a valid access token."}));
                        response.end();
                        return;
                    }
                }

                if (route.route.preRequestInterceptors) {
                    for (let i = 0; i < route.route.preRequestInterceptors.length; i++) {

                        try {
                            await route.route.preRequestInterceptors[i].interceptor(restfulRequest);
                        } catch (e) {
                            Logger.error(`${e}`);
                            response.writeHead(500, HttpServer.headers);
                            response.end(JSON.stringify({errorMsg: "Unexpected server error"}));
                            response.end();
                        }
                    }
                }

                if (route.route.callback) {
                    let restfulResponse: RestfulResponse | null = null;
                    try {
                        restfulResponse = await route.route.callback(restfulRequest);

                        if (route.route.postRequestInterceptors) {
                            for (let i = 0; i < route.route.postRequestInterceptors.length; i++) {

                                try {
                                    await route.route.postRequestInterceptors[i].interceptor(restfulRequest,
                                        restfulResponse);
                                } catch (e) {
                                    Logger.error(`${e}`);
                                    response.writeHead(500, HttpServer.headers);
                                    response.end(JSON.stringify({errorMsg: "Unexpected server error"}));
                                    response.end();
                                }
                            }
                        }

                    } catch (e) {
                        console.log(e);
                        response.writeHead(500, HttpServer.headers);
                        response.end(JSON.stringify({errorMsg: "Unexpected server error"}));
                        response.end();
                        return;
                    }

                    if (restfulResponse) {

                        if (restfulResponse.statusCode) {
                            response.writeHead(restfulResponse.statusCode, HttpServer.headers);
                        }

                        restfulResponse.statusCode = undefined;
                        response.end(JSON.stringify(restfulResponse.body));
                    } else {
                        response.writeHead(200, HttpServer.headers);
                        response.end();
                    }
                } else {
                    response.writeHead(404, {'Content-Type': 'application/json'});
                    response.end('{"Error": Requested route not found}');
                    return;
                }
            } else {
                response.writeHead(404, {'Content-Type': 'application/json'});
                response.end('{"Error": Requested route not found}');
                return;
            }


        });

        this._server.listen(this._httpServerConfiguration.port, (): void => {
            Logger.info(`Listening on ${this._httpServerConfiguration.port} in ${this._httpServerConfiguration.environment.toUpperCase()} mode.`);
        });
    }

    extractHeaders(rawHeaders: string []): Map<string, any> {

        let headerMap: Map<string, any> = new Map<string, any>();

        for (let i: number = 0; i < rawHeaders.length; i += 2) {
            headerMap.set(rawHeaders[i].toLowerCase(), rawHeaders[i + 1]);
        }

        return headerMap;
    }

    async findRoute(request: IncomingMessage) {
        let pathParams: Map<string, any> = new Map<string, any>();
        let queryParams: Map<string, any> = new Map<string, any>();
        let body: any | undefined = undefined;

        switch (request.method) {
            case "GET":
                return this.resolvePath(request, this._getRoutes, pathParams, queryParams);
            case "POST":
                const contentType = request.headers['content-type'] || '';

                if (contentType.includes('multipart/form-data')) {

                    body = await this.handleFileUpload(request);
                } else if (contentType == "application/json" || contentType == "application/activity+json") {
                    body = await this.readRequestBody(request);
                } else {
                    Logger.error(`I can't handle ${contentType}`);
                }

                return this.resolvePath(request, this._postRoutes, pathParams, queryParams, body);
            case "PUT":
                body = await this.readRequestBody(request);
                return this.resolvePath(request, this._putRoutes, pathParams, queryParams, body);
            case "PATCH":
                body = await this.readRequestBody(request);
                return this.resolvePath(request, this._patchRoutes, pathParams, queryParams, body);
            case "DELETE":
                return this.resolvePath(request, this._deleteRoutes, pathParams, queryParams);
        }

        return undefined;
    }

    resolvePath(request: IncomingMessage,
                pathMap: Map<string, Route>,
                pathParams: Map<string, any>,
                queryParams: Map<string, any>,
                body: any = undefined) {

        let removeParameters = request.url?.split("?");

        if (removeParameters && removeParameters.length == 2) {
            queryParams = this.resolveQueryParams(removeParameters[1], queryParams);
        }

        //@ts-ignore
        let pathTokens: Array<string> = removeParameters[0].split("/");

        for (const key of pathMap.keys()) {
            let potentialPath: string[] = key.split("/");

            if (potentialPath.length == pathTokens.length) {

                let hits: number = 0;
                for (let i: number = 0; i < pathTokens.length; i++) {

                    if (potentialPath[i].startsWith("{") && potentialPath[i].endsWith("}")) {
                        pathParams.set(potentialPath[i].replace("{", "").replace("}", ""), pathTokens[i]);
                        hits++;
                    } else {

                        if (potentialPath[i] != pathTokens[i]) {
                            break;
                        } else {
                            hits++;
                        }
                    }
                }

                if (hits == potentialPath.length) {
                    return {route: pathMap.get(key), pathParams: pathParams, queryParams: queryParams, body: body};
                }
            }
        }

        return undefined;
    }

    initRoutes(): void {
        let routes: Array<Route> = this._httpServerConfiguration.defineRoutes();

        for (let i: number = 0; i < routes.length; i++) {

            let route: Route = routes[i];

            switch (route.method) {
                case HttpMethod.GET:

                    if (this._getRoutes.has(route.path)) {
                        throw new Error(`Duplicate GET route found ${route.path}`)
                    }

                    this._getRoutes.set(route.path, route);
                    Logger.debug(`Registered GET ${route.path}`);

                    break;
                case HttpMethod.POST:
                    if (this._postRoutes.has(route.path)) {
                        throw new Error(`Duplicate POST route found ${route.path}`)
                    }
                    this._postRoutes.set(route.path, route);
                    Logger.debug(`Registered POST ${route.path}`);

                    break;
                case HttpMethod.PUT:
                    if (this._putRoutes.has(route.path)) {
                        throw new Error(`Duplicate PUT route found ${route.path}`)
                    }
                    this._putRoutes.set(route.path, route);
                    Logger.debug(`Registered PUT ${route.path}`);
                    break;
                case HttpMethod.PATCH:
                    if (this._patchRoutes.has(route.path)) {
                        throw new Error(`Duplicate PATCH route found ${route.path}`)
                    }
                    this._patchRoutes.set(route.path, route);
                    Logger.debug(`Registered PATCH ${route.path}`);
                    break;
                case HttpMethod.DELETE:
                    if (this._deleteRoutes.has(route.path)) {
                        throw new Error(`Duplicate DELETE route found ${route.path}`)
                    }
                    this._deleteRoutes.set(route.path, route);
                    Logger.debug(`Registered DELETE ${route.path}`);
                    break;
            }
        }
    }

    private resolveQueryParams(queryString: string, queryParams: Map<string, any>): Map<string, any> {

        let queryStringTokens: string[] = queryString.split("&");

        for (let i: number = 0; i < queryStringTokens.length; i++) {

            let tokens: string [] = queryStringTokens[i].split("=");

            if (tokens.length == 2) {
                queryParams.set(tokens[0], tokens[1]);
            } else {
                queryParams.set(tokens[0], null);
            }
        }

        return queryParams;
    }

    readRequestBody = (req: IncomingMessage): Promise<any> => {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString(); // Convert Buffer to string
            });
            req.on('end', () => {
                if (body) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve("{}");
                    }
                } else {
                    resolve("{}");
                }
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
    };

    handleFileUpload(req) {
        return new Promise((resolve, reject) => {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
                const parts = body.split(`--${boundary}`);

                for (let part of parts) {
                    if (part.includes('filename')) {
                        try {

                            const [headers, body] = part.split('\r\n\r\n');
                            const imageBuffer = Buffer.from(body.split('\r\n')[0], 'binary');
                            const headerLines: string[] = headers.split('\r\n');
                            let filename: string = '';
                            let contentType: string  = '';

                            for (let line of headerLines) {
                                if (line.includes('filename')) {
                                    filename = line.split('; ')[2].split('=')[1].replace(/"/g, '');
                                } else if (line.startsWith('Content-Type:')) {
                                    contentType = line.split(': ')[1];
                                }
                            }

                            resolve({
                                filename: filename,
                                buffer: imageBuffer,
                                contentType: contentType
                            });
                        } catch (error) {
                            reject(error);
                        }
                        break;
                    }
                }
            });

            req.on('error', (error) => {
                reject(error);
            });
        });
    }

}
