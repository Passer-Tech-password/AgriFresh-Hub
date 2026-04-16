import type { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "pending"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderType = "retail" | "bulk";

export type BulkInquiryStatus = "pending" | "negotiating" | "accepted" | "rejected" | "fulfilled";

export type OrderItem = {
  productId: string;
  name: string;
  unit: string;
  priceKobo: number;
  quantity: number;
  vendorId: string;
};

export type OrderDoc = {
  id?: string;
  userId: string;
  email?: string | null;
  status: OrderStatus;
  type: OrderType;
  currency: "NGN";
  amountKobo: number;
  items: OrderItem[];
  paystackReference?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Logistics & Tracking
  logisticsNotes?: string;
  requiresColdChain: boolean;
  currentTemp?: number; // Live tracking (e.g., 3.8)
  tempHistory?: { timestamp: Timestamp; temp: number }[];
  currentLocation?: { lat: number; lng: number; address: string };
  isUpfrontPayment: boolean;
  driver?: {
    name: string;
    photoUrl: string;
    phone: string;
  };
};

export type BulkInquiryDoc = {
  id?: string;
  userId: string;
  vendorId: string;
  productId: string;
  productName: string;
  requestedQty: number;
  requestedPricePerUnitKobo?: number; // If buyer suggests a price
  status: BulkInquiryStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveryDate?: Timestamp;
  negotiationHistory?: {
    senderId: string;
    message: string;
    timestamp: Timestamp;
    offeredPriceKobo?: number;
  }[];
};

