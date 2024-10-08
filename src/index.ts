import express, { NextFunction, Request, Response } from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

interface User {
  name: string;
  image: string;
  typing: boolean;
}

interface Room {
  users: User[];
  code: string;
}

const rooms: Record<string, Room> = {};

app.post("/api/generate-room", (req: Request, res: Response) => {
  const { roomId, name } = req.body;

  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: [
        { name, image: "/placeholder.svg?height=32&width=32", typing: false },
      ],
      code: "# Write your code here",
    };

    const token = jwt.sign({ roomId, name }, process.env.JWT_SECRET as string);

    res.status(200).json({
      message: "Room created successfully",
      token,
    });
  } else {
    res.status(403).json({
      message: "Room ID already exists",
    });
  }
});

app.post("/api/user-join", (req: Request, res: Response) => {
  const { roomId, name } = req.body;

  if (rooms[roomId]) {
    rooms[roomId].users.push({
      name,
      image: "/placeholder.svg?height=32&width=32",
      typing: false,
    });

    const token = jwt.sign({ roomId, name }, process.env.JWT_SECRET as string);

    res.json({
      message: `${name} joined room ${roomId}`,
      token,
    });
  } else {
    res.status(404).json({
      message: "Room not found",
    });
  }
});

app.post("/api/verify-token", (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token is missing" });
  }

  try {
    // @ts-ignore
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      name: string;
      roomId: string;
    };

    res.status(200).json({
      valid: true,
      name: decoded.name,
      roomId: decoded.roomId,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/rooms", (req: Request, res: Response) => {
  res.json(rooms);
});

io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);

    socket.to(roomId).emit("user-joined", `${name} joined the room`);

    socket.emit("reflect-code", rooms[roomId].code);

    io.to(roomId).emit("update-users", rooms[roomId].users);

    socket.on("change-code", (newCode) => {
      rooms[roomId].code = newCode;
      socket.to(roomId).emit("reflect-code", newCode);
    });

    socket.on(
      "user-typing",
      ({
        roomId,
        name,
        typing,
      }: {
        roomId: string;
        name: string;
        typing: boolean;
      }) => {
        if (rooms[roomId]) {
          rooms[roomId].users = rooms[roomId].users.map((user) =>
            user.name === name ? { ...user, typing } : user
          );

          io.to(roomId).emit("user-typing", { name, typing });
        }
      }
    );

    socket.on("run-code-output", (output: string) => {
      io.to(roomId).emit("reflect-output-code", output);
    });

    socket.on("disconnect", () => {
      if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(
          (user) => user.name !== name
        );
        socket.to(roomId).emit("update-users", rooms[roomId].users);
      }
      console.log("user disconnected: ", socket.id);
    });
  });
});

httpServer.listen(3000, () => {
  console.log(`listening on port: 3000`);
});
