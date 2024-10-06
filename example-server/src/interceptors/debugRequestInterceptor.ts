import {Logger} from "../../../lib/logger/logger"
import {RestfulInterceptor} from "../../../lib/server/restfulInterceptor";
import {RestfulRequest} from "../../../lib/server/restfulController";


export class DebugRequestInterceptor implements RestfulInterceptor {

    interceptor(restfulRequest: RestfulRequest): Promise<boolean> {

        Logger.debug("Intercepted by DebugRequestInterceptor");
        console.log(restfulRequest);

        return Promise.resolve(true);
    }

}
