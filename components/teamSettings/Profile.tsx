"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editUserProfile, uploadProfilePicture } from "@/lib/actions/user.actions";
import { useUserStore } from "@/store/userStore";
import Image from "next/image";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { countries } from "@/lib/utils/countries";

const Profile = () => {
  const queryClient = useQueryClient();

  const user = useUserStore((state) => state.user);

  const [fullName, setFullName] = React.useState("");
  const [roleTitle, setRoleTitle] = React.useState("");
  const [publicName, setPublicName] = React.useState("");
  const [address, setAddress] = React.useState<{
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  }>({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  // Update state when user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setRoleTitle(user.role_title || "");
      setPublicName(user.full_name || "");
      setAddress(user.address || {
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: editUserProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success(data?.message || "Profile updated.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success(data?.message || "Profile picture updated.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload profile picture.");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    uploadMutation.mutate(formData);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("role_title", roleTitle);
    formData.append("address", JSON.stringify(address));

    mutation.mutate(formData);
  };

  const getCurrentTimeZone = () => {
    if (user?.local_time) {
      return user.local_time;
    }

    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentTime = new Date().toLocaleString("en-US", {
        timeZone: timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
      return `${currentTime} (${timeZone})`;
    } catch (error) {
      return "Unable to determine current time zone";
    }
  };

  if (!user) return;

  return (
    <div className="space-y-12">
      <div>
        <p className="text-xl font-medium text-[#333333]">Profile</p>
        <p className="text-[#AAAAAA]">
          Manage your personal information, and control which information other
          people see and apps may access.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-[#A1A1A1]">Profile photo and header image</p>
        <div className="relative w-full overflow-hidden rounded-sm border bg-white lg:h-[340px]">
          <div className="h-[60%] bg-gradient-to-r from-[#1E90FF] to-[#a1c4e7]"></div>
          <div className="absolute left-14 top-[60%] flex h-[90px] w-[90px] -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white lg:h-[180px] lg:w-[180px]">
            <label className="group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full hover:opacity-90">
              <Image
                src={user?.avatar || "/images/default-avatar.png"}
                alt="User Avatar"
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 hidden items-center justify-center bg-black/50 text-sm font-medium text-white transition-all group-hover:flex">
                {uploadMutation.status === "pending" ? "Uploading..." : "Change Photo"}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="full_name"
              className="block font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="public_name"
              className="block font-medium text-gray-700"
            >
              Public name
            </label>
            <input
              type="text"
              id="public_name"
              name="public_name"
              value={publicName}
              onChange={(e) => setPublicName(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
              placeholder="Enter your public name"
            />
          </div>

          <div>
            <label
              htmlFor="role_title"
              className="block font-medium text-gray-700"
            >
              Role title
            </label>
            <input
              type="text"
              id="role_title"
              name="role_title"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 capitalize shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
              placeholder="Enter your role title"
            />
          </div>

          {/* Address Section */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">Address</p>
              <p className="text-sm text-[#AAAAAA] mb-4">
                Your address is essential for receiving payments as an employee.
              </p>
            </div>

            <div>
              <label
                htmlFor="street"
                className="block font-medium text-gray-700"
              >
                Street Address
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="block font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block font-medium text-gray-700"
                >
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="postalCode"
                  className="block font-medium text-gray-700"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={address.postal_code}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full rounded-sm border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#146898] focus:ring-[#146898] sm:text-sm"
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block font-medium text-gray-700"
                >
                  Country
                </label>
                <Select
                  name="country"
                  value={address.country}
                  onValueChange={(value) =>
                    setAddress((prev) => ({ ...prev, country: value }))
                  }
                >
                  <SelectTrigger className="mt-1 w-full rounded-sm border-gray-300 bg-white">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            className="rounded-sm bg-[#4CAF50] text-white"
            type="submit"
            disabled={mutation.status === "pending"}
          >
            {mutation.status === "pending" ? "Saving..." : "Save"}
          </Button>
        </form>

        {/* Current Time Zone Display */}
        <div className="space-y-3">
          <p className="text-xl font-medium text-[#333333]">
            Current Time Zone
          </p>
          {user.local_time !== "" ? (
            <div className="rounded-sm border border-gray-200 bg-gray-50 p-4">
              <p className="font-mono text-sm text-[#333333]">
                {getCurrentTimeZone()}
              </p>
            </div>
          ) : (
            <p className="text-[#AAAAAA]">
              You have not set your time zone yet
            </p>
          )}
        </div>

        <div>
          <p className="font-medium text-[#71717A]">Contact</p>

          <div className="space-y-14 rounded-sm border p-4">
            <span>
              <p className="text-[#AAAAAA]">Email address</p>
              <p className="text-lg font-medium text-[#333333]">{user.email}</p>
            </span>

            <p className="text-[#4CAF50]">Manage your email address</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
