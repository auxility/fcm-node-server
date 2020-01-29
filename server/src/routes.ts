import {Application, Request, Response} from "express";
import {Callback, RedisClient} from "redis";

import {promisify} from "util";
import {multicast} from "./fcm";
import {AddDeviceRequest, BaseResponse} from "./api-definitions";


export type RoutesInput = {
    app: Application;
    redis: RedisClient;
};

export interface PromisifiedOverloadedKeyCommand<T, R> {
    (...args: Array<string | T>): Promise<R>;
}

type PromisifiedCommand = PromisifiedOverloadedKeyCommand<string, any>

export default ({app, redis}: RoutesInput) => {
    const sadd: PromisifiedCommand = promisify(redis.sadd).bind(redis);
    const smembers: PromisifiedCommand = promisify(redis.smembers).bind(redis);
    const srem: PromisifiedCommand = promisify(redis.srem).bind(redis);

    app.get('/', async (req: Request, res: Response) => {
        return res.json({
            success: true,
            version: process.env.npm_package_version,
            redis_connected: redis.connected
        });
    });

    /**
     *  @swaggerPath
     *  /users/{id}/devices:
     *    post:
     *      summary: add new device
     *      operationId: registerDevice
     *      tags:
     *        - receiver
     *      parameters:
     *        - in: path
     *          name: id
     *          description: user id
     *          required: true
     *          schema:
     *            type: string
     *            example: 123456789
     *        - in: body
     *          name: body
     *          schema:
     *            $ref: '#/definitions/AddDeviceRequest'
     *      responses:
     *        '200':
     *          schema:
     *            $ref: '#/definitions/BaseResponse'
     */
    app.post('/users/:id/devices', async (req: Request, res: Response) => {
        // TODO: limit to 100 devices per user (FCM multicast limitation)
        const {token} = req.body as AddDeviceRequest;
        const userId = req.params.id;
        const reply = await sadd(userId, token);
        return res.json(<BaseResponse>{result: !!reply});
    });

    /**
     *  @swaggerPath
     *  /users/{id}/devices/{token}:
     *    delete:
     *      summary: delete device
     *      operationId: deleteDevice
     *      tags:
     *        - receiver
     *      parameters:
     *        - in: path
     *          name: id
     *          description: user id
     *          required: true
     *          schema:
     *            type: string
     *            example: 123456789
     *        - in: path
     *          name: token
     *          description: fcm token
     *          required: true
     *          schema:
     *            type: string
     *            example: avcdjsdgangjaolascQ#41ntq1tgdgm[qsrf
     *      responses:
     *        '200':
     *          schema:
     *            $ref: '#/definitions/BaseResponse'
     */
    app.delete('/users/:id/devices/:token', async (req: Request, res: Response) => {
        const token = req.params.token;
        const userId = req.params.id;
        const reply = await srem(userId, token);
        return res.json(<BaseResponse>{result: !!reply});
    });

    /**
     *  @swaggerPath
     *  /users/{id}/messages:
     *    post:
     *      summary: send message
     *      operationId: sendMessage
     *      tags:
     *        - sender
     *      parameters:
     *        - in: path
     *          name: id
     *          description: user id
     *          required: true
     *          schema:
     *            type: string
     *            example: 123456789
     *        - in: body
     *          name: body
     *          schema:
     *            $ref: '#/definitions/Message'
     *      responses:
     *        '200':
     *          schema:
     *            $ref: '#/definitions/BaseResponse'
     */
    app.post('/users/:id/messages', async (req: Request, res: Response) => {
        const userId = req.params.id;
        const tokens = await smembers(userId);
        if (!tokens.length) {
            const err = Error('No registered devices') as any;
            err.code = 430;
            throw err;
        }
        await multicast({...req.body, tokens});
        return res.json(tokens);
    });
}