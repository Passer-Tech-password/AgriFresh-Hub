"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  CheckCircle2, 
  Upload, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Building2, 
  MapPin, 
  FileCheck, 
  Store,
  X,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/auth-store";
import { db, uploadFileWithProgress } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { VendorApplicationDoc, BusinessDocument } from "@/types/vendor-application";

const PRODUCT_CATEGORIES = [
  "Vegetables", "Fruits", "Livestock", "Poultry", "Fish & Seafood", 
  "Grains & Tubers", "Spices & Herbs", "Frozen Foods", "Oils & Fats", "Kitchen Utensils"
];

type FormStep = 1 | 2 | 3 | 4;

export default function VendorApplyPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  const role = useAuthStore((s) => s.role);

  const [step, setStep] = React.useState<FormStep>(1);
  const [busy, setBusy] = React.useState(false);
  const [uploadingField, setUploadingField] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // Form State
  const [formData, setFormData] = React.useState({
    businessName: "",
    phoneNumber: "",
    city: "Port Harcourt",
    state: "Rivers",
    address: "",
    rcNumber: "",
    tin: "",
    businessDescription: "",
    selectedCategories: [] as string[],
  });

  // Documents State
  const [docs, setDocs] = React.useState<{
    cacCertificate?: BusinessDocument;
    rcDocument?: BusinessDocument;
    nafdacCertificate?: BusinessDocument;
    validId?: BusinessDocument;
    farmPhotos: BusinessDocument[];
  }>({
    farmPhotos: [],
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setUploadingField(field);
    setUploadProgress(0);

    try {
      const path = `vendor-docs/${user.uid}/${field}_${Date.now()}_${file.name}`;
      const url = await uploadFileWithProgress(file, path, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      const docInfo: BusinessDocument = {
        name: file.name,
        url,
        type: file.type,
        size: file.size,
        uploadedAt: serverTimestamp() as any,
      };

      if (field === "farmPhotos") {
        setDocs(prev => ({ ...prev, farmPhotos: [...prev.farmPhotos, docInfo] }));
      } else {
        setDocs(prev => ({ ...prev, [field]: docInfo }));
      }
      
      toast.success(`${file.name} uploaded successfully.`);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingField(null);
      setUploadProgress(0);
    }
  };

  const removeDoc = (field: string, index?: number) => {
    if (field === "farmPhotos" && typeof index === "number") {
      setDocs(prev => ({
        ...prev,
        farmPhotos: prev.farmPhotos.filter((_, i) => i !== index)
      }));
    } else {
      setDocs(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter(c => c !== cat)
        : [...prev.selectedCategories, cat]
    }));
  };

  const handleSubmit = async () => {
    if (!user || !userDoc) return;
    
    // Final validation
    if (!docs.validId) {
      toast.error("Valid ID is required.");
      setStep(2);
      return;
    }

    setBusy(true);
    try {
      const application: VendorApplicationDoc = {
        uid: user.uid,
        fullName: userDoc.displayName || "Unknown",
        email: user.email || "",
        businessName: formData.businessName,
        phoneNumber: formData.phoneNumber,
        location: {
          city: formData.city,
          state: formData.state,
          address: formData.address,
        },
        rcNumber: formData.rcNumber || undefined,
        tin: formData.tin || undefined,
        documents: {
          cacCertificate: docs.cacCertificate,
          rcDocument: docs.rcDocument,
          nafdacCertificate: docs.nafdacCertificate,
          validId: docs.validId!,
          farmPhotos: docs.farmPhotos,
        },
        businessDescription: formData.businessDescription,
        productCategories: formData.selectedCategories,
        status: "pending",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await addDoc(collection(db, "vendorApplications"), application);
      toast.success("Application submitted for review!");
      router.replace("/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit application.");
    } finally {
      setBusy(false);
    }
  };

  const isStep1Valid = formData.businessName && formData.phoneNumber && formData.address;
  const isStep2Valid = !!docs.validId;
  const isStep3Valid = formData.businessDescription && formData.selectedCategories.length > 0;

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-12">
          {/* Header */}
          <header className="space-y-4 text-center lg:text-left animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/25 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-leaf shadow-[0_0_20px_rgba(74,222,128,0.65)]" />
              Vendor Onboarding
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Become a <span className="text-leaf">Verified Vendor</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
              Join Nigeria's premium agri-tech marketplace. Earn trust badges, reach more buyers, 
              and scale your farm business with our cold-chain infrastructure.
            </p>
          </header>

          {/* Progress Bar */}
          <div className="relative h-1 w-full rounded-full bg-forest/20 overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-leaf shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            {/* Main Form Content */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Step 1: Info */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Business Information</h2>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Business/Farm Name</Label>
                      <Input 
                        placeholder="e.g. Green Valley Farms" 
                        value={formData.businessName}
                        onChange={e => updateFormData({ businessName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Business Phone</Label>
                      <Input 
                        placeholder="+234..." 
                        value={formData.phoneNumber}
                        onChange={e => updateFormData({ phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">City</Label>
                      <Input value={formData.city} readOnly className="bg-white/5 opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">State</Label>
                      <Input value={formData.state} readOnly className="bg-white/5 opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2 sm:col-span-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Address</Label>
                      <Input 
                        placeholder="Farm/Warehouse address" 
                        value={formData.address}
                        onChange={e => updateFormData({ address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">RC Number (Optional)</Label>
                      <Input 
                        placeholder="For registered businesses" 
                        value={formData.rcNumber}
                        onChange={e => updateFormData({ rcNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">TIN (Optional)</Label>
                      <Input 
                        placeholder="Tax Identification Number" 
                        value={formData.tin}
                        onChange={e => updateFormData({ tin: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Business Documents</h2>
                  </div>

                  <p className="text-sm text-white/50">Please upload clear copies of your documents. Max 5MB per file.</p>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Valid ID - Required */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Valid ID (Required)*</Label>
                      <div className="relative group">
                        {docs.validId ? (
                          <div className="flex items-center justify-between rounded-2xl border border-leaf/30 bg-leaf/5 p-4 transition-all">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-leaf" />
                              <div className="text-sm text-white truncate max-w-[150px]">{docs.validId.name}</div>
                            </div>
                            <button onClick={() => removeDoc("validId")} className="text-white/30 hover:text-white transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className={cn(
                            "relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-forest/30 bg-black/20 py-8 transition-all hover:border-leaf/50 hover:bg-black/30",
                            uploadingField === "validId" && "opacity-50 pointer-events-none"
                          )}>
                            <Upload className="h-6 w-6 text-white/20" />
                            <div className="text-xs text-white/40">NIN, Voter's Card, or License</div>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={e => handleFileUpload(e, "validId")}
                              accept="image/*,application/pdf"
                            />
                            {uploadingField === "validId" && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl">
                                <Loader2 className="h-6 w-6 animate-spin text-leaf mb-2" />
                                <div className="text-[10px] font-bold text-leaf">{uploadProgress}%</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CAC Certificate */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">CAC Certificate</Label>
                      <div className="relative group">
                        {docs.cacCertificate ? (
                          <div className="flex items-center justify-between rounded-2xl border border-leaf/30 bg-leaf/5 p-4 transition-all">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-leaf" />
                              <div className="text-sm text-white truncate max-w-[150px]">{docs.cacCertificate.name}</div>
                            </div>
                            <button onClick={() => removeDoc("cacCertificate")} className="text-white/30 hover:text-white transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className={cn(
                            "relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-forest/30 bg-black/20 py-8 transition-all hover:border-leaf/50 hover:bg-black/30",
                            uploadingField === "cacCertificate" && "opacity-50 pointer-events-none"
                          )}>
                            <Upload className="h-6 w-6 text-white/20" />
                            <div className="text-xs text-white/40">Upload CAC doc</div>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={e => handleFileUpload(e, "cacCertificate")}
                              accept="image/*,application/pdf"
                            />
                            {uploadingField === "cacCertificate" && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl">
                                <Loader2 className="h-6 w-6 animate-spin text-leaf mb-2" />
                                <div className="text-[10px] font-bold text-leaf">{uploadProgress}%</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NAFDAC */}
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-white/40">NAFDAC Certificate</Label>
                      <div className="relative group">
                        {docs.nafdacCertificate ? (
                          <div className="flex items-center justify-between rounded-2xl border border-leaf/30 bg-leaf/5 p-4 transition-all">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-leaf" />
                              <div className="text-sm text-white truncate max-w-[150px]">{docs.nafdacCertificate.name}</div>
                            </div>
                            <button onClick={() => removeDoc("nafdacCertificate")} className="text-white/30 hover:text-white transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className={cn(
                            "relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-forest/30 bg-black/20 py-8 transition-all hover:border-leaf/50 hover:bg-black/30",
                            uploadingField === "nafdacCertificate" && "opacity-50 pointer-events-none"
                          )}>
                            <Upload className="h-6 w-6 text-white/20" />
                            <div className="text-xs text-white/40">Food/Drug regulatory doc</div>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={e => handleFileUpload(e, "nafdacCertificate")}
                              accept="image/*,application/pdf"
                            />
                            {uploadingField === "nafdacCertificate" && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl">
                                <Loader2 className="h-6 w-6 animate-spin text-leaf mb-2" />
                                <div className="text-[10px] font-bold text-leaf">{uploadProgress}%</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Product Info */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
                      <Store className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Product & Proof</h2>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-white/40">What do you sell?</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCT_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "rounded-xl border px-4 py-2 text-xs font-semibold transition-all",
                            formData.selectedCategories.includes(cat)
                              ? "border-leaf/40 bg-leaf/10 text-leaf"
                              : "border-forest/20 bg-black/20 text-white/50 hover:text-white"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Business Description</Label>
                    <textarea 
                      className="w-full min-h-[120px] rounded-2xl border border-forest/25 bg-black/15 p-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-leaf/50 focus:bg-black/25 focus:ring-2 focus:ring-leaf/20"
                      placeholder="Tell us about your farm, products, and capacity..."
                      value={formData.businessDescription}
                      onChange={e => updateFormData({ businessDescription: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Farm/Product Photos (Optional)</Label>
                    <div className="grid gap-4 sm:grid-cols-4">
                      {docs.farmPhotos.map((photo, i) => (
                        <div key={i} className="group relative aspect-square rounded-2xl border border-forest/10 overflow-hidden">
                          <img src={photo.url} className="h-full w-full object-cover" alt="Farm proof" />
                          <button 
                            onClick={() => removeDoc("farmPhotos", i)}
                            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {docs.farmPhotos.length < 4 && (
                        <div className={cn(
                          "relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-forest/30 bg-black/20 transition-all hover:border-leaf/50 hover:bg-black/30",
                          uploadingField === "farmPhotos" && "opacity-50 pointer-events-none"
                        )}>
                          <Upload className="h-5 w-5 text-white/20" />
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Add Photo</div>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={e => handleFileUpload(e, "farmPhotos")}
                            accept="image/*"
                          />
                          {uploadingField === "farmPhotos" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl">
                              <Loader2 className="h-5 w-5 animate-spin text-leaf" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Review & Submit</h2>
                  </div>

                  <div className="rounded-3xl border border-forest/20 bg-black/20 p-8 space-y-8 backdrop-blur">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Business</div>
                        <div className="text-white font-semibold">{formData.businessName}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Phone</div>
                        <div className="text-white">{formData.phoneNumber}</div>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Location</div>
                        <div className="text-white">{formData.address}, {formData.city}, {formData.state}</div>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Products</div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {formData.selectedCategories.map(c => (
                            <span key={c} className="rounded-lg bg-forest/30 px-2 py-0.5 text-[10px] font-bold text-leaf uppercase">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Documents Provided</div>
                      <div className="flex flex-wrap gap-3">
                        {docs.validId && <div className="flex items-center gap-2 rounded-xl border border-leaf/20 bg-leaf/5 px-3 py-1.5 text-xs text-leaf font-semibold"><CheckCircle2 className="h-3 w-3" /> Valid ID</div>}
                        {docs.cacCertificate && <div className="flex items-center gap-2 rounded-xl border border-leaf/20 bg-leaf/5 px-3 py-1.5 text-xs text-leaf font-semibold"><CheckCircle2 className="h-3 w-3" /> CAC</div>}
                        {docs.nafdacCertificate && <div className="flex items-center gap-2 rounded-xl border border-leaf/20 bg-leaf/5 px-3 py-1.5 text-xs text-leaf font-semibold"><CheckCircle2 className="h-3 w-3" /> NAFDAC</div>}
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 font-semibold">{docs.farmPhotos.length} Photos</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-forest/10">
                <Button 
                  variant="secondary" 
                  disabled={step === 1 || busy}
                  onClick={() => setStep(s => (s - 1) as FormStep)}
                  className="rounded-2xl"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {step < 4 ? (
                  <Button 
                    variant="primary" 
                    onClick={() => setStep(s => (s + 1) as FormStep)}
                    disabled={
                      (step === 1 && !isStep1Valid) ||
                      (step === 2 && !isStep2Valid) ||
                      (step === 3 && !isStep3Valid)
                    }
                    className="rounded-2xl shadow-lg"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg"
                    disabled={busy}
                    onClick={handleSubmit}
                    className="group relative overflow-hidden rounded-2xl shadow-xl px-10"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {busy ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Submit for Admin Review
                          <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  </Button>
                )}
              </div>
            </div>

            {/* Side Info */}
            <aside className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
              <section className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur space-y-4">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Why Verify?</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">Earn Trust Badges</div>
                      <div className="text-[10px] text-white/50 leading-relaxed">Verified vendors get 3x more bulk order inquiries.</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">Market Visibility</div>
                      <div className="text-[10px] text-white/50 leading-relaxed">Top placement in the marketplace results.</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur space-y-4">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Help & Support</h3>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Need help with RC or TIN registration? Our vendor support team is available via WhatsApp or email.
                </p>
                <Link href="/support" className="inline-block text-[10px] font-bold text-leaf hover:underline">
                  Contact Support →
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
