import express, { Express, Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import mediaRoutes from "./route/media.route";
import { doc, onSnapshot } from "@firebase/firestore";
import firebaseAdmin from "./config/firebase";

const app: Express = express();
app.use(express.json());

const server: http.Server = http.createServer(app);
const io: Server = new Server(server);

const db = firebaseAdmin.firestore();
const PORT: string | number = process.env.PORT || 3000;

app.use("/api/v1", mediaRoutes);

io.on("connection", (socket: Socket) => {
  socket.on(
    "getStreamOfColl",
    function (docPath: string, limit?: number, filters?: Record<string, any>) {
      let query = db.collection(
        docPath
      ) as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

      if (filters) {
        Object.entries(filters).forEach(([field, value]) => {
          query = query.where(field, "==", value);
        });
      }

      if (limit) {
        query = query.limit(limit);
      }

      query.onSnapshot((snapshot) => {
        const res = snapshot.docs.map((val) => val.data());
        io.emit("collection", res);
      });
    }
  );
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
