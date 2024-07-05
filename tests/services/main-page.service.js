import http from "k6/http";
import { AbstractService } from "./abstract-service.js";

/**
 * Represents the main page service.
 */
export class MainPageService extends AbstractService {
    constructor() {
        super("https://www.qytera.de", {});
    }

    /**
     * Gets the main page.
     * @returns {Object} An object representing the response from the main page.
     */
    getMainPage() {
        return http.get(this._requestUrl, { headers: this._requestHeaders });
    }
}
