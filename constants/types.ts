import { Timestamp } from 'firebase/firestore';

export interface UserType {
  userId: string;
  username?: string;
  profileUrl?: string;
  email?:string;
  gender?:string;
  [key: string]: any; // For any other properties
}

export interface MessageType {
  id: string;
  userId: string;
  text: string;
  senderProfileUrl?: string;
  senderName?: string;
  createdAt: Timestamp;
}