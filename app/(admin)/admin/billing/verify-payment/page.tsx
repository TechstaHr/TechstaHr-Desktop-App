// app/admin/billing/verify-payment/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPayment } from "@/lib/actions/payments.actions";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");
  const [paymentData, setPaymentData] = useState<any>(null);

  // Get the reference from URL parameters
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (reference) {
      handleVerifyPayment(reference);
    } else {
      toast.error("No payment reference found");
      setVerificationStatus("failed");
    }
  }, [reference]);

  const handleVerifyPayment = async (ref: string) => {
    setIsVerifying(true);

    try {
      const response = await verifyPayment(ref);

      if (
        response?.data?.status === "success" ||
        response?.status === "success"
      ) {
        toast.success("Payment verified successfully!");
        setVerificationStatus("success");
        setPaymentData(response.data || response);
      } else {
        toast.error("Payment verification failed");
        setVerificationStatus("failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);

      // Handle specific error cases
      if (error.response?.data?.error?.code === "transaction_not_found") {
        toast.error("Transaction not found. Please contact support.");
      } else if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error("Payment verification failed");
      }

      setVerificationStatus("failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReturnToBilling = () => {
    router.push("/admin/billing-subscription");
  };

  const handleRetryVerification = () => {
    if (reference) {
      handleVerifyPayment(reference);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          {isVerifying && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Verifying Payment...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your payment.
              </p>
            </>
          )}

          {!isVerifying && verificationStatus === "success" && (
            <>
              <div className="mb-4 text-green-600">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                Payment Successful!
              </h2>
              <p className="mb-6 text-gray-600">
                Your payment has been verified successfully. Here are the
                transaction details:
              </p>
              {paymentData && (
                <>
                  {/* Payment Summary Card */}
                  <div className="mb-6 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          Payment Receipt
                        </h3>
                        <p className="text-sm text-green-600">
                          Transaction ID: {paymentData.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-800">
                          ₦
                          {(
                            paymentData.requested_amount / 100
                          ).toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600">
                          {paymentData.currency}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Payment Method
                        </p>
                        <p className="text-sm capitalize text-green-600">
                          {paymentData.channel}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Status
                        </p>
                        <p className="text-sm text-green-600">
                          {paymentData.gateway_response}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Date & Time
                        </p>
                        <p className="text-sm text-green-600">
                          {new Date(paymentData.paid_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Reference
                        </p>
                        <p className="font-mono text-sm text-green-600">
                          {reference}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Transaction Information */}
                  <div className="mb-6 rounded-lg bg-gray-50 p-6">
                    <h4 className="mb-4 text-lg font-semibold text-gray-800">
                      Transaction Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Customer Information
                          </p>
                          <p className="text-sm text-gray-600">
                            {paymentData.customer?.email}
                          </p>
                          {paymentData.customer?.customer_code && (
                            <p className="text-xs text-gray-500">
                              Code: {paymentData.customer.customer_code}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Amount Breakdown
                          </p>
                          <div className="text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Amount:</span>
                              <span>
                                ₦
                                {(
                                  paymentData.requested_amount / 100
                                ).toLocaleString()}
                              </span>
                            </div>
                            {paymentData.fees && (
                              <div className="flex justify-between">
                                <span>Fees:</span>
                                <span>
                                  ₦{(paymentData.fees / 100).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Transaction Info
                          </p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              Domain:{" "}
                              <span className="capitalize">
                                {paymentData.domain}
                              </span>
                            </p>
                            <p>IP Address: {paymentData.ip_address}</p>
                            <p>
                              Created:{" "}
                              {new Date(
                                paymentData.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <Button
                onClick={handleReturnToBilling}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                Return to Billing
              </Button>
            </>
          )}

          {!isVerifying && verificationStatus === "failed" && (
            <>
              <div className="mb-4 text-red-600">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Payment Verification Failed
              </h2>
              <p className="mb-4 text-gray-600">
                We couldn't verify your payment. Please try again or contact
                support.
              </p>
              {reference && (
                <div className="mb-4 rounded-lg bg-gray-50 p-4 text-left">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reference:</span> {reference}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <Button
                  onClick={handleRetryVerification}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Retry Verification
                </Button>
                <Button
                  onClick={handleReturnToBilling}
                  variant="outline"
                  className="w-full"
                >
                  Return to Billing
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

