
import React from "react";
import { OrganizationStructuredData } from "@/components/seo/OrganizationStructuredData";

export default function Head() {
  return (
    <>
      <meta charSet="UTF-8" />
      <link rel="icon" type="image/png" href="/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="robots" content="index, follow" />
      <OrganizationStructuredData />
    </>
  );
}
