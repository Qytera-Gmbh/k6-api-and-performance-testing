import http from "k6/http";

/**
 * Represents an abstract service.
 */
export class AbstractService {
    /**
     * The base URL.
     * @type {string}
     * @protected
     */
    _requestUrl;

    /**
     * The request header.
     * @type {Object}
     * @protected
     */
    _requestHeaders;

    /**
     * Creates an instance of AbstractService.
     * @param {string} url - The base URL for the service.
     * @param {Object} headers - The request header for the service.
     */
    constructor(url, headers) {
        this._requestUrl = url;
        this._requestHeaders = headers;
    }

    /**
     * Performs a health check by sending an HTTP GET request to the specified URL.
     * @returns {Object} An object representing the response from the health check.
     */
    healthCheck(endpoint = "/health") {
        return http.get(`${this._requestUrl}${endpoint}`);
    }
}
