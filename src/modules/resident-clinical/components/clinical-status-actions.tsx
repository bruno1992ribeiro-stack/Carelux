"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, CircleOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Field, FieldError, FieldLabel, Textarea } from "@/components/carelux-ui";

import { deactivateAllergy, deactivateDiagnosis, voidClinicalRecord } from "../actions";
import { clinicalRecordVoidSchema } from "../schemas/resident-clinical.schema";

const initialState = { success: false, message: "" };
const secondaryActionClass = "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";
const destructiveActionClass = "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90";

function DeactivateDialog({ label, description, onConfirm }: { label: string; description: string; onConfirm: () => Promise<{ success: boolean; message: string }> }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button className={secondaryActionClass} />}><CircleOff aria-hidden size={16} /> Desativar</DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>{label}</DialogTitle></DialogHeader>
      <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      {message && <p role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{message}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><DialogClose render={<Button className={secondaryActionClass} />}>Cancelar</DialogClose><Button className={destructiveActionClass} disabled={pending} onClick={() => startTransition(async () => { const result = await onConfirm(); if (result.success) setOpen(false); else setMessage(result.message); })}>{pending ? "A desativar..." : "Desativar"}</Button></div>
    </DialogContent>
  </Dialog>;
}

export function DeactivateDiagnosisDialog({ residentId, diagnosisId }: { residentId: string; diagnosisId: string }) {
  return <DeactivateDialog label="Desativar diagnóstico" description="O diagnóstico permanece no histórico clínico e deixa de ser apresentado como ativo." onConfirm={() => deactivateDiagnosis(residentId, diagnosisId, initialState)} />;
}

export function DeactivateAllergyDialog({ residentId, allergyId }: { residentId: string; allergyId: string }) {
  return <DeactivateDialog label="Desativar alergia" description="A alergia permanece no histórico e deixa de gerar alertas clínicos ativos." onConfirm={() => deactivateAllergy(residentId, allergyId, initialState)} />;
}

type VoidValues = z.input<typeof clinicalRecordVoidSchema>;
export function VoidClinicalRecordDialog({ residentId, recordId }: { residentId: string; recordId: string }) {
  const [open, setOpen] = useState(false);
  const { formState: { errors, isSubmitting }, handleSubmit, register, reset, setError } = useForm<VoidValues>({ resolver: zodResolver(clinicalRecordVoidSchema), defaultValues: { recordId, voidReason: "" } });
  const submit = handleSubmit(async (values) => { const formData = new FormData(); formData.set("recordId", recordId); formData.set("voidReason", values.voidReason); const result = await voidClinicalRecord(residentId, initialState, formData); if (!result.success) { setError("root", { message: result.message }); return; } setOpen(false); reset({ recordId, voidReason: "" }); });
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button className={secondaryActionClass} />}><Ban aria-hidden size={16} /> Anular</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Anular registo clínico</DialogTitle></DialogHeader><p className="mb-5 text-sm leading-5 text-muted-foreground">O conteúdo original será preservado e identificado como anulado.</p><form noValidate onSubmit={submit} className="space-y-5">{errors.root?.message && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errors.root.message}</p>}<Field data-invalid={Boolean(errors.voidReason)}><FieldLabel htmlFor={`void-reason-${recordId}`}>Motivo da anulação</FieldLabel><Textarea id={`void-reason-${recordId}`} disabled={isSubmitting} {...register("voidReason")} />{errors.voidReason && <FieldError errors={[errors.voidReason]} />}</Field><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><DialogClose render={<Button className={secondaryActionClass} />}>Cancelar</DialogClose><Button type="submit" className={destructiveActionClass} disabled={isSubmitting}>{isSubmitting ? "A anular..." : "Anular registo"}</Button></div></form></DialogContent></Dialog>;
}
