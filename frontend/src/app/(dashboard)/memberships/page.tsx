"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { plansApi } from "@/lib/api";

interface PlanDuration {
  id: string;
  durationMonths: number;
  price: number;
  discountPercent: number;
  registrationFee: number;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  color?: string;
  includesClasses: boolean;
  includesPT: boolean;
  classCredits?: number;
  ptSessions?: number;
  durations: PlanDuration[];
  _count: {
    memberships: number;
  };
}

export default function MembershipsPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await plansApi.getAll({ includeInactive: true });
      return response.data.data as Plan[];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDurationLabel = (months: number) => {
    if (months === 1) return "1 Month";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Membership Plans</h1>
          <p className="text-[#b3b3b3]">
            Manage your gym's membership plans and pricing
          </p>
        </div>
        <Button className="bg-[#1db954] text-black hover:bg-[#1ed760]">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-[#181818] border-none">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-[#282828]" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-32 bg-[#282828]" />
                <Skeleton className="h-4 w-full bg-[#282828]" />
                <Skeleton className="h-4 w-3/4 bg-[#282828]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const lowestPrice = plan.durations.length > 0
              ? Math.min(...plan.durations.map((d) => d.price))
              : 0;

            return (
              <Card
                key={plan.id}
                className={`bg-[#181818] border-none relative overflow-hidden ${
                  !plan.isActive ? "opacity-60" : ""
                }`}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#1db954] text-black">Popular</Badge>
                  </div>
                )}

                {/* Inactive badge */}
                {!plan.isActive && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {plan.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: plan.color }}
                      />
                    )}
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  </div>
                  {plan.description && (
                    <p className="text-[#b3b3b3] text-sm mt-1">{plan.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Starting Price */}
                  <div>
                    <p className="text-[#b3b3b3] text-sm">Starting from</p>
                    <p className="text-3xl font-bold text-white">
                      {formatPrice(lowestPrice)}
                      <span className="text-base font-normal text-[#b3b3b3]">/month</span>
                    </p>
                  </div>

                  {/* Duration Options */}
                  <div className="space-y-2">
                    <p className="text-[#b3b3b3] text-sm font-medium">Duration Options</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.durations.map((duration) => (
                        <Badge
                          key={duration.id}
                          variant="secondary"
                          className="bg-[#282828] text-white"
                        >
                          {getDurationLabel(duration.durationMonths)} - {formatPrice(duration.price)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-[#b3b3b3] text-sm font-medium">Features</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-white">
                          <Check className="h-4 w-4 text-[#1db954]" />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-[#b3b3b3]">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Includes */}
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-1 text-sm">
                      {plan.includesClasses ? (
                        <Check className="h-4 w-4 text-[#1db954]" />
                      ) : (
                        <X className="h-4 w-4 text-[#b3b3b3]" />
                      )}
                      <span className={plan.includesClasses ? "text-white" : "text-[#b3b3b3]"}>
                        Classes
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {plan.includesPT ? (
                        <Check className="h-4 w-4 text-[#1db954]" />
                      ) : (
                        <X className="h-4 w-4 text-[#b3b3b3]" />
                      )}
                      <span className={plan.includesPT ? "text-white" : "text-[#b3b3b3]"}>
                        Personal Training
                      </span>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#282828]">
                    <div className="flex items-center gap-2 text-[#b3b3b3]">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{plan._count.memberships} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#b3b3b3] hover:text-white hover:bg-[#282828]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#b3b3b3] hover:text-red-400 hover:bg-[#282828]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-[#181818] border-none">
          <CardContent className="py-12 text-center">
            <p className="text-[#b3b3b3] mb-4">No membership plans found.</p>
            <Button className="bg-[#1db954] text-black hover:bg-[#1ed760]">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
