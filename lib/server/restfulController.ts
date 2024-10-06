import {RestfulInterceptor, RestfulResponseInterceptor} from "./restfulInterceptor";
import {Configuration} from "../utils/configurationManager";


export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH
}

export interface RestfulResponse {
    statusCode: number | undefined
    body?: any
    errorMsg?: string
}

export interface RestfulRequest {
    pathParams: Map<string, any>
    queryParams: Map<string, any>
    requestHeaders: Map<string, any>
    securityContext?: any
    body: any
    incomingBuffer?: any
}

export interface RestfulController {

    routes(): Array<Route>
}

export interface Route {
    method: HttpMethod
    path: string
    callback: Function
    authInterceptor?: RestfulInterceptor
    preRequestInterceptors?: Array<RestfulInterceptor>
    postRequestInterceptors?: Array<RestfulResponseInterceptor>
}
