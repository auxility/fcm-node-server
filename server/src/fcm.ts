import * as admin from "firebase-admin";
import MulticastMessage = admin.messaging.MulticastMessage;

const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

if (!FIREBASE_DATABASE_URL) {
    throw new Error(`FIREBASE_DATABASE_URL env variable has to be set!`)
}

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: FIREBASE_DATABASE_URL
});

/**
 *
 * @param tokens list of FCM tokens
 * @param message https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
 */
async function multicast(message: MulticastMessage) {

    const response = await admin.messaging().sendMulticast(message);

    if (response.failureCount > 0) {
        const failedTokens = Array<string>();
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(message.tokens[idx]);
            }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
    }
}

export {
    multicast
}