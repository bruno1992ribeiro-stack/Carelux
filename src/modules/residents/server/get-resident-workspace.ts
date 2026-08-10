import { cache } from "react";

import { notFound } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { residentService } from "../services/resident.service";
import { getResidentReadScope } from "./resident-authorization";

export const getResidentWorkspace = cache(async (id: string) => {
  const scope = await getResidentReadScope();

  try {
    return await residentService.getById(id, scope);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }
});

export const getResidentSummaryDetails = cache(async (id: string) => {
  const scope = await getResidentReadScope();

  try {
    return await residentService.getSummaryById(id, scope);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }

    throw error;
  }
});
