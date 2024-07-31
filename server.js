import express from "express";
import { createServer } from "node:http";


import cors from "cors";
import firebaseAdmin from "./config/firebase.js";
import mediaRoutes from "./route/media.route.js";


const app = express();
const db = firebaseAdmin.firestore();
const httpServer = createServer(app);
app.use(express.json());
app.use(cors());
console.log("processing request");
app.use("/api/v1", mediaRoutes);
const NEWPORT = process.env.PORT || 4000;
httpServer.listen(NEWPORT, () =>
  console.log(`Server is running on port ${NEWPORT}`)
);


/*
import express from "express";
import http2 from "http2";
import fs from "fs";
import cors from "cors";
import firebaseAdmin from "./config/firebase.js";
import mediaRoutes from "./route/media.route.js";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const app = express();
const db = firebaseAdmin.firestore();
app.use(express.json());
app.use(cors());
console.log("processing request");
app.use("/api/v1", mediaRoutes);
// Load the proto file
const packageDefinition = protoLoader.loadSync("firebase_service.proto");
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const firestoreService = protoDescriptor.firestoreservice;

const applyFilters = (query, filtersJson) => {
  const filters = JSON.parse(filtersJson);
  filters.forEach((filter) => {
    const firestoreOperator = getFirestoreOperator(filter.filterType);
    query = query.where(filter.fieldName, firestoreOperator, filter.value);
  });
  return query;
};

const getFirestoreOperator = (filterTypeIndex) => {
  const operators = [
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
    "array-contains",
    "array-contains-any",
    "in",
    "not-in",
  ];
  return operators[filterTypeIndex];
};

// gRPC service implementation
const streamCollection = (call) => {
  console.log("Received full request:", call.request);

  const { collectionPath, filters, limit } = call.request;

  if (
    !collectionPath ||
    typeof collectionPath !== "string" ||
    collectionPath.trim() === ""
  ) {
    call.emit("error", new Error("Invalid collection path"));
    return;
  }
  let query;
  try {
    query = db.collection(collectionPath);
  } catch (e) {
    console.error("Error parsing collectionPath:", e);
    call.emit("error", new Error("Invalid filters format"));
    return;
  }

  if (filters && filters !== "[]") {
    try {
      query = applyFilters(query, filters);
    } catch (error) {
      console.error("Error parsing filters:", error);
      call.emit("error", new Error("Invalid filters format"));
      return;
    }
  }

  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const unsubscribe = query.onSnapshot(
    (snapshot) => {
      const collectionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      call.write({
        collectionSnapshot: JSON.stringify(collectionData),
      });
    },
    (error) => {
      console.error("Snapshot listener error:", error);
      call.emit("error", error);
    }
  );

  call.on("cancelled", () => unsubscribe());
};

// Create gRPC server
const grpcServer = new grpc.Server();
grpcServer.addService(firestoreService.FirestoreService.service, {
  streamCollection,
});

// Your existing routes

const HTTP2_PORT = process.env.HTTP2_PORT || 8080;
const GRPC_PORT = process.env.GRPC_PORT || 8081;

// Create HTTP/2 server
const http2Server = http2.createServer();

http2Server.on("stream", (stream, headers) => {
  app(stream, stream);
});

// Start the servers
http2Server.listen(HTTP2_PORT, () => {
  console.log(`HTTP/2 Server running on port ${HTTP2_PORT}`);

  // Start the gRPC server
  grpcServer.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to bind gRPC server:", err);
        return;
      }

      grpcServer.start();
      console.log(`gRPC server running on port ${GRPC_PORT}`);
    }
  );
});

*/