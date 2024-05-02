import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";
import cors from "cors";
import firebaseAdmin from "./config/firebase.js";
import mediaRoutes from "./route/media.route.js";

const app = express();
const db = firebaseAdmin.firestore();
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with the client URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
const PORT = process.env.PORT || 3000;

app.use("/api/v1", mediaRoutes);
io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
io.on("error", (error) => {
  console.log("Socket Error: ", error);
});
io.on("connection", function (socket) {
  console.log("connected");
  socket.on("getStreamOfColl", function ({ docPath, limit, filters }) {
    console.log(docPath, "limit", "");
    let query = db.collection(docPath);

    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        query = query.where(field, "==", value);
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    query.onSnapshot(function (snapshot) {
      const res = snapshot.docs.map(function (val) {
        console.log("res: ", val.data());
        return val.data();
      });
      io.emit("collection", res);
    });
  });
});
httpServer.listen(4000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
