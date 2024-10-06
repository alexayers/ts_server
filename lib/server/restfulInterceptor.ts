import {RestfulRequest, RestfulResponse} from "./restfulController";

export interface RestfulInterceptor {
    interceptor(restfulRequest: RestfulRequest) : Promise<boolean>
}

export interface RestfulResponseInterceptor {
    interceptor(restfulRequest: RestfulRequest, restfulResponse: RestfulResponse | null) : Promise<boolean>
}
