import type { Timestamp } from "firebase/firestore";

export type VendorApplicationStatus = "pending" | "approved" | "rejected";

export type BusinessDocument = {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Timestamp;
};

export type VendorApplicationDoc = {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  businessName: string;
  phoneNumber: string;
  location: {
    city: string;
    state: string;
    address: string;
  };
  rcNumber?: string;
  tin?: string;
  
  // Document URLs from Storage
  documents: {
    cacCertificate?: BusinessDocument;
    rcDocument?: BusinessDocument;
    nafdacCertificate?: BusinessDocument;
    validId: BusinessDocument;
    farmPhotos?: BusinessDocument[];
  };

  businessDescription: string;
  productCategories: string[];
  status: VendorApplicationStatus;
  rejectionReason?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

