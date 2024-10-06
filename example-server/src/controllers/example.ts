
import {Configuration} from "../../../lib/utils/configurationManager";
import {
    HttpMethod,
    RestfulController,
    RestfulRequest,
    RestfulResponse,
    Route
} from "../../../lib/server/restfulController";
import {DebugRequestInterceptor} from "../interceptors/debugRequestInterceptor";
import {DebugResponseInterceptor} from "../interceptors/debugResponseInterceptor";

export class ExampleController implements RestfulController {
    

    constructor(configuration: Configuration) {
       
    }

    async getExample(request: RestfulRequest, response: RestfulResponse): Promise<RestfulResponse> {
       return {
            statusCode: 200,
              body: {
                message: "Hello World!"
              }
       }
    }

    routes(): Array<Route> {
        

         return [{
            method: HttpMethod.GET,
            path: "/example",
            preRequestInterceptors: [new DebugRequestInterceptor()],
            postRequestInterceptors: [new DebugResponseInterceptor()],
            callback: this.getExample}
         ]
    }
    
}