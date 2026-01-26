// 'use client';

// import { addDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';
// import { errorEmitter } from '@/firebase/error-emitter';
// import { FirestorePermissionError } from '@/firebase/errors';

// export type DetectionLogData = {
//     type: 'Sybil' | 'Sensor Spoofing';
//     result: string;
//     confidence: number;
//     details: string;
// };

// /**
//  * Adds a new detection log to the Firestore database.
//  * @param db The Firestore instance.
//  * @param data The data for the detection log.
//  */
// export function addDetectionLog(db: Firestore | null, data: DetectionLogData) {
//     if (!db) {
//         console.error("Firestore instance is not available.");
//         return;
//     }
//     const logData = {
//         ...data,
//         detectedAt: serverTimestamp(),
//     };

//     const collectionRef = collection(db, 'detection_logs');
    
//     addDoc(collectionRef, logData)
//         .catch(async (serverError) => {
//             const permissionError = new FirestorePermissionError({
//                 path: collectionRef.path,
//                 operation: 'create',
//                 requestResourceData: logData,
//             });
//             errorEmitter.emit('permission-error', permissionError);
//         });
// }
