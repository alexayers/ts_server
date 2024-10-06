import {Logger} from "../../../lib/logger/logger"
import {RestfulResponseInterceptor} from "../../../lib/server/restfulInterceptor";
import {RestfulRequest, RestfulResponse} from "../../../lib/server/restfulController";


export class DebugResponseInterceptor implements RestfulResponseInterceptor {

    interceptor(restfulRequest: RestfulRequest, restfulResponse: RestfulResponse): Promise<boolean> {

        Logger.debug("Intercepted by DebugResponseInterceptor");
        Logger.debug("----- Request ----");
        console.debug(restfulRequest);
        Logger.debug("----- Response ----");
        console.debug(restfulResponse);

        return Promise.resolve(true);
    }

}
