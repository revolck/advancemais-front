import packageJson from "../../package.json";

/**
 * Constantes da aplicação
 * 
 * Este arquivo exporta constantes que podem ser usadas tanto no server-side
 * quanto no client-side do Next.js
 */

/**
 * Versão da aplicação obtida do package.json
 */
export const APP_VERSION = packageJson.version;

/**
 * Nome da aplicação
 */
export const APP_NAME = packageJson.name;


