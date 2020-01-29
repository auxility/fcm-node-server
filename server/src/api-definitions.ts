/**
 * @swaggerDefinition
 * AddDeviceRequest:
 *   type: object
 *   required:
 *     - token
 *   properties:
 *     token:
 *       type: string
 *       description: FCM registration token
 *       example: avcdjsdgangjaolascQ#41ntq1tgdgm[qsrf
 */
import * as admin from "firebase-admin";
import MulticastMessage = admin.messaging.MulticastMessage;

export interface AddDeviceRequest {
    token: string
}

/**
 * @swaggerDefinition
 * BaseResponse:
 *   type: object
 *   required:
 *     - result
 *   properties:
 *     result:
 *       type: boolean
 *       description: operation result. True if record changed, False otherwise
 *       example: false
 */
export interface BaseResponse {
    result: boolean
}

/**
 * @swaggerDefinition
 * Message:
 *   type: object
 *   properties:
 *     notification:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Hello World!
 *         body:
 *           type: string
 *           example: From Firebase Cloud Messaging Node Server!
 *         image:
 *           type: strings
 *           example: https://via.placeholder.com/150
 *   description: For detailed documentation visit https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#resource:-message
 */
export interface Message extends MulticastMessage {

}

