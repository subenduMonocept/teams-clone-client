export interface IMessage {
  _id: string;
  sender: {
    _id: string;
    email: string;
  };
  receiver?: string;
  group?: string;
  content: string;
  type: "text" | "file" | "call";
  fileUrl?: string;
  createdAt: string;
}

export interface IGroup {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  admins: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICallData {
  from: string;
  type: "video" | "audio";
  status: "ringing" | "accepted" | "rejected" | "ended";
}
