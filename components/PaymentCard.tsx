import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";

interface PaymentCard {
  title: string;
  text: string;
  picture: StaticImageData;
  secondImage?: StaticImageData;
}

export function PaymentCard({
  title,
  text,
  picture,
  secondImage,
}: PaymentCard) {
  return (
    <Card className="h-[160px] w-full">
      <CardHeader>
        <CardTitle className="text-xl font-normal text-[#71717A]">
          {title}
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Image src={picture} alt="hour glass" />
          <p className="text-xl font-medium text-[#333333]">{text}</p>
          {secondImage && <Image src={secondImage} alt="eyes closed" />}
        </div>
      </CardContent>
    </Card>
  );
}
