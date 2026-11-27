"use client";
import React from "react";
import { withSessionRequired } from "@/components/session-guard";

const LibraryPage = () => {
  return <div>library</div>;
};

export default withSessionRequired(LibraryPage);
