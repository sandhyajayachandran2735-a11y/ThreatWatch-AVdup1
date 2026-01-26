// 'use client';

// import { addDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';
// import { errorEmitter } from '@/firebase/error-emitter';
// import { FirestorePermissionError } from '@/firebase/errors';

// type SybilAttackData = {
//     sybilNodeCount: number;
//     riskScore: number;
//     nodes: {
//         vehicleId: string;
//         confidence: string;
//     }[];
// };

// /**
//  * Adds a new Sybil attack log to the Firestore database.
//  * @param db The Firestore instance.
//  * @param data The data for the Sybil attack log.
//  */
// export function addSybilAttackLog(db: Firestore, data: SybilAttackData) {
//     const logData = {
//         ...data,
//         detectedAt: serverTimestamp(),
//     };

//     const collectionRef = collection(db, 'sybil_attacks');
    
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
