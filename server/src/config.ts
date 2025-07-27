import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

/**
 * The base URL for the main server.
 * This URL is used to make requests to the backend server running locally.
 *
 * @constant
 * @type {string}
 */
export const mainUrl: string = "*";

/**
 * The hostname on which the server will listen.
 *
 * @remarks
 * Setting the hostname to "0.0.0.0" allows the server to accept connections on all IPv4 network interfaces.
 */
export const hostname: string = "0.0.0.0";

/**
 * The port number on which the server will listen for incoming connections.
 *
 * @constant
 * @type {number}
 * @default 8080
 */
export const port: number = 8082;

//? This is the URL for the WebSocket connection to CAPSY.
export const WS_HOST_CAPSY: string = "localhost";
export const WS_PORT_CAPSY: number = 81;
