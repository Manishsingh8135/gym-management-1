"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Phone,
  MapPin,
  HeartPulse,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { membersApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const memberSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  
  // Emergency Contact
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  
  // Health Info
  bloodGroup: z.string().optional(),
  medicalConditions: z.string().optional(),
  
  // Branch
  branchId: z.string().min(1, "Please select a branch"),
});

type MemberFormData = z.infer<typeof memberSchema>;

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Contact Details", icon: Phone },
  { id: 3, name: "Address", icon: MapPin },
  { id: 4, name: "Health Info", icon: HeartPulse },
];

export default function AddMemberPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      branchId: "main-branch", // Default branch
    },
  });

  const createMember = useMutation({
    mutationFn: async (data: MemberFormData) => {
      const response = await membersApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member created successfully!");
      router.push("/members");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Failed to create member";
      toast.error(message);
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate as any);
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof MemberFormData)[] => {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "email", "phone", "dateOfBirth", "gender"];
      case 2:
        return ["emergencyName", "emergencyPhone", "emergencyRelation"];
      case 3:
        return ["address", "city", "state", "zipCode"];
      case 4:
        return ["bloodGroup", "medicalConditions", "branchId"];
      default:
        return [];
    }
  };

  const onSubmit = (data: MemberFormData) => {
    createMember.mutate(data);
  };

  const gender = watch("gender");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-[#b3b3b3] hover:text-white hover:bg-[#282828]"
        >
          <Link href="/members">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Member</h1>
          <p className="text-[#b3b3b3]">Create a new gym member profile</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                currentStep === step.id
                  ? "bg-[#1db954] text-black"
                  : currentStep > step.id
                  ? "bg-[#1db954]/20 text-[#1db954]"
                  : "bg-[#282828] text-[#b3b3b3]"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-1 mx-2 rounded",
                  currentStep > step.id ? "bg-[#1db954]" : "bg-[#282828]"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white">
          Step {currentStep}: {steps[currentStep - 1].name}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-[#181818] border-none max-w-2xl mx-auto">
          <CardContent className="p-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="John"
                      className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Doe"
                      className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="9876543210"
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                      className="bg-[#282828] border-[#404040] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Gender</Label>
                    <Select value={gender} onValueChange={(value) => setValue("gender", value as any)}>
                      <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#282828] border-[#404040]">
                        <SelectItem value="MALE" className="text-white">Male</SelectItem>
                        <SelectItem value="FEMALE" className="text-white">Female</SelectItem>
                        <SelectItem value="OTHER" className="text-white">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Emergency Contact */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-[#b3b3b3] text-sm mb-4">
                  Emergency contact information (optional but recommended)
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyName" className="text-white">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    {...register("emergencyName")}
                    placeholder="Jane Doe"
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="text-white">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    {...register("emergencyPhone")}
                    placeholder="9876543211"
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyRelation" className="text-white">Relationship</Label>
                  <Select onValueChange={(value) => setValue("emergencyRelation", value)}>
                    <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#282828] border-[#404040]">
                      <SelectItem value="Spouse" className="text-white">Spouse</SelectItem>
                      <SelectItem value="Parent" className="text-white">Parent</SelectItem>
                      <SelectItem value="Sibling" className="text-white">Sibling</SelectItem>
                      <SelectItem value="Friend" className="text-white">Friend</SelectItem>
                      <SelectItem value="Other" className="text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Street Address</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="123 Main Street, Apartment 4B"
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b] min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Mumbai"
                      className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white">State</Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="Maharashtra"
                      className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-white">ZIP / Postal Code</Label>
                  <Input
                    id="zipCode"
                    {...register("zipCode")}
                    placeholder="400001"
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b]"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Health Info */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Blood Group</Label>
                  <Select onValueChange={(value) => setValue("bloodGroup", value)}>
                    <SelectTrigger className="bg-[#282828] border-[#404040] text-white">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#282828] border-[#404040]">
                      <SelectItem value="A+" className="text-white">A+</SelectItem>
                      <SelectItem value="A-" className="text-white">A-</SelectItem>
                      <SelectItem value="B+" className="text-white">B+</SelectItem>
                      <SelectItem value="B-" className="text-white">B-</SelectItem>
                      <SelectItem value="AB+" className="text-white">AB+</SelectItem>
                      <SelectItem value="AB-" className="text-white">AB-</SelectItem>
                      <SelectItem value="O+" className="text-white">O+</SelectItem>
                      <SelectItem value="O-" className="text-white">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions" className="text-white">
                    Medical Conditions / Allergies
                  </Label>
                  <Textarea
                    id="medicalConditions"
                    {...register("medicalConditions")}
                    placeholder="Any medical conditions, allergies, or health concerns we should know about..."
                    className="bg-[#282828] border-[#404040] text-white placeholder:text-[#6b6b6b] min-h-[100px]"
                  />
                </div>

                <input type="hidden" {...register("branchId")} />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-[#282828] bg-transparent text-white hover:bg-[#282828]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#1db954] text-black hover:bg-[#1ed760]"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMember.isPending}
                  className="bg-[#1db954] text-black hover:bg-[#1ed760]"
                >
                  {createMember.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Member
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
