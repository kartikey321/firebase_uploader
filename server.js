import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import firebaseAdmin from "./config/firebase.js";
import mediaRoutes from "./route/media.route.js";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const app = express();
const db = firebaseAdmin.firestore();
app.use(express.json());
app.use(cors());

// Load the proto file
const packageDefinition = protoLoader.loadSync("firebase_service.proto");
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const firestoreService = protoDescriptor.firestoreservice;

const applyFilters = (query, filtersJson) => {
  const filters = JSON.parse(filtersJson);
  filters.forEach(filter => {
    const firestoreOperator = getFirestoreOperator(filter.filterType);
    query = query.where(filter.fieldName, firestoreOperator, filter.value);
  });
  return query;
};

const getFirestoreOperator = (filterTypeIndex) => {
  const operators = ['==', '!=', '<', '<=', '>', '>=', 'array-contains', 'array-contains-any', 'in', 'not-in'];
  return operators[filterTypeIndex];
};

// gRPC service implementation
const streamCollection = (call) => {
  console.log('Received full request:', call.request);

  const { collectionPath, filters, limit } = call.request;


  if (!collectionPath || typeof collectionPath !== 'string' || collectionPath.trim() === '') {
    call.emit('error', new Error('Invalid collection path'));
    return;
  }
  let query;
  try{
     query = db.collection(collectionPath);
  }catch(e){
    console.error('Error parsing collectionPath:', e);
    call.emit('error', new Error('Invalid filters format'));
    return;
  }


  if (filters && filters !== '[]') {
    try {
      query = applyFilters(query, filters);
    } catch (error) {
      console.error('Error parsing filters:', error);
      call.emit('error', new Error('Invalid filters format'));
      return;
    }
  }

  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const unsubscribe = query.onSnapshot(snapshot => {
    const collectionData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    call.write({
      collectionSnapshot: JSON.stringify(collectionData)
    });
  }, error => {
    console.error('Snapshot listener error:', error);
    call.emit('error', error);
  });

  call.on('cancelled', () => unsubscribe());
};

// Create gRPC server
const grpcServer = new grpc.Server();
grpcServer.addService(firestoreService.FirestoreService.service, {
  streamCollection,
});

// Your existing routes
app.use("/media", mediaRoutes);

const httpServer = createServer(app);

const NEWPORT = process.env.PORT || 8080;

httpServer.listen(NEWPORT, () => {
  console.log(`HTTP server running on port ${NEWPORT}`);

  // Attach gRPC server to the same port
  grpcServer.bindAsync(
    `0.0.0.0:${NEWPORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind gRPC server:", err);
        return;
      }

      console.log(`gRPC server running on port ${NEWPORT}`);
    }
  );
});
