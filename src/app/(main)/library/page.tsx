"use client";
import React from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const LibraryPage = () => {
  return <div>library</div>;
};

export default withPageAuthRequired(LibraryPage);
