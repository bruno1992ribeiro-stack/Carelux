"use client";

import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/carelux-ui";

import { FacilityForm } from "./facility-form";

export function CreateFacilityDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        + Novo Lar
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar novo lar</DialogTitle>
        </DialogHeader>

        <FacilityForm />
      </DialogContent>
    </Dialog>
  );
}
