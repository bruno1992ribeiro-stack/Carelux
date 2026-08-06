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
        + Nova Unidade
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar nova unidade</DialogTitle>
        </DialogHeader>

        <FacilityForm mode="create" />
      </DialogContent>
    </Dialog>
  );
}
