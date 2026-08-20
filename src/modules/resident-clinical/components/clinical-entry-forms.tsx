"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AllergySeverity, AllergyType, ClinicalRecordCategory } from "@prisma/client";
import { PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Field, FieldError, FieldGroup, FieldLabel, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/carelux-ui";

import { amendClinicalRecord, correctAllergy, correctDiagnosis, createAllergy, createClinicalRecord, createDiagnosis } from "../actions";
import { allergySchema, clinicalRecordSchema, diagnosisSchema } from "../schemas/resident-clinical.schema";

const initialState = { success: false, message: "" };
const secondaryActionClass = "border border-border bg-transparent px-3 py-2 text-foreground shadow-none hover:bg-muted";
const toDateInput = (value?: Date | null) => value ? value.toISOString().slice(0, 10) : "";
const toDateTimeInput = (value?: Date | null) => {
  const date = value ?? new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};
const toIsoDateTime = (value: unknown) => (value instanceof Date ? value : new Date(String(value))).toISOString();

function RootError({ message }: { message?: string }) {
  return message ? <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{message}</p> : null;
}

type DiagnosisValues = z.input<typeof diagnosisSchema>;
export function DiagnosisDialog({ residentId, diagnosis }: { residentId: string; diagnosis?: { id: string; name: string; description: string | null; diagnosedAt: Date | null; observations: string | null } }) {
  const [open, setOpen] = useState(false);
  const { formState: { errors, isSubmitting }, handleSubmit, register, setError, reset } = useForm<DiagnosisValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: { name: diagnosis?.name ?? "", description: diagnosis?.description ?? "", diagnosedAt: toDateInput(diagnosis?.diagnosedAt), observations: diagnosis?.observations ?? "" },
  });
  const submit = handleSubmit(async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value ? String(value) : ""));
    if (diagnosis) formData.set("supersedesId", diagnosis.id);
    const result = diagnosis ? await correctDiagnosis(residentId, initialState, formData) : await createDiagnosis(residentId, initialState, formData);
    if (!result.success) { Object.entries(result.errors ?? {}).forEach(([key, messages]) => setError(key as keyof DiagnosisValues, { message: messages[0] })); setError("root", { message: result.message }); return; }
    setOpen(false); reset();
  });
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button className={diagnosis ? secondaryActionClass : undefined} />}>
      {diagnosis ? <><PencilLine aria-hidden size={16} /> Corrigir</> : <><Plus aria-hidden size={18} /> Novo diagnóstico</>}
    </DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>{diagnosis ? "Corrigir diagnóstico" : "Novo diagnóstico"}</DialogTitle></DialogHeader>
      <form noValidate onSubmit={submit} className="space-y-5"><RootError message={errors.root?.message} /><FieldGroup>
        <Field data-invalid={Boolean(errors.name)}><FieldLabel htmlFor="diagnosis-name">Diagnóstico</FieldLabel><Input id="diagnosis-name" disabled={isSubmitting} {...register("name")} />{errors.name && <FieldError errors={[errors.name]} />}</Field>
        <Field data-invalid={Boolean(errors.description)}><FieldLabel htmlFor="diagnosis-description">Descrição</FieldLabel><Textarea id="diagnosis-description" disabled={isSubmitting} {...register("description")} />{errors.description && <FieldError errors={[errors.description]} />}</Field>
        <Field data-invalid={Boolean(errors.diagnosedAt)}><FieldLabel htmlFor="diagnosis-date">Data do diagnóstico</FieldLabel><Input id="diagnosis-date" type="date" disabled={isSubmitting} {...register("diagnosedAt")} />{errors.diagnosedAt && <FieldError errors={[errors.diagnosedAt]} />}</Field>
        <Field data-invalid={Boolean(errors.observations)}><FieldLabel htmlFor="diagnosis-observations">Observações</FieldLabel><Textarea id="diagnosis-observations" disabled={isSubmitting} {...register("observations")} />{errors.observations && <FieldError errors={[errors.observations]} />}</Field>
      </FieldGroup><div className="flex justify-end"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "A guardar..." : diagnosis ? "Guardar correção" : "Registar diagnóstico"}</Button></div></form>
    </DialogContent>
  </Dialog>;
}

const allergyTypeLabels: Record<AllergyType, string> = { MEDICATION: "Medicamento", FOOD: "Alimento", ENVIRONMENTAL: "Ambiental", CONTACT: "Contacto", OTHER: "Outro" };
const severityLabels: Record<AllergySeverity, string> = { MILD: "Ligeira", MODERATE: "Moderada", SEVERE: "Grave", LIFE_THREATENING: "Risco de vida" };
type AllergyValues = z.input<typeof allergySchema>;
export function AllergyDialog({ residentId, allergy }: { residentId: string; allergy?: { id: string; allergen: string; type: AllergyType | null; reaction: string; severity: AllergySeverity; observations: string | null } }) {
  const [open, setOpen] = useState(false);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register, setError, reset } = useForm<AllergyValues>({ resolver: zodResolver(allergySchema), defaultValues: { allergen: allergy?.allergen ?? "", type: allergy?.type ?? null, reaction: allergy?.reaction ?? "", severity: allergy?.severity ?? AllergySeverity.MODERATE, observations: allergy?.observations ?? "" } });
  const submit = handleSubmit(async (values) => {
    const formData = new FormData(); Object.entries(values).forEach(([key, value]) => formData.set(key, value ? String(value) : "")); if (allergy) formData.set("supersedesId", allergy.id);
    const result = allergy ? await correctAllergy(residentId, initialState, formData) : await createAllergy(residentId, initialState, formData);
    if (!result.success) { Object.entries(result.errors ?? {}).forEach(([key, messages]) => setError(key as keyof AllergyValues, { message: messages[0] })); setError("root", { message: result.message }); return; }
    setOpen(false); reset();
  });
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button className={allergy ? secondaryActionClass : undefined} />}>{allergy ? <><PencilLine aria-hidden size={16} /> Corrigir</> : <><Plus aria-hidden size={18} /> Nova alergia</>}</DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>{allergy ? "Corrigir alergia" : "Nova alergia"}</DialogTitle></DialogHeader><form noValidate onSubmit={submit} className="space-y-5"><RootError message={errors.root?.message} /><FieldGroup>
      <Field data-invalid={Boolean(errors.allergen)}><FieldLabel htmlFor="allergy-allergen">Alergénio</FieldLabel><Input id="allergy-allergen" disabled={isSubmitting} {...register("allergen")} />{errors.allergen && <FieldError errors={[errors.allergen]} />}</Field>
      <div className="grid gap-5 sm:grid-cols-2"><Field data-invalid={Boolean(errors.type)}><FieldLabel>Tipo</FieldLabel><Controller name="type" control={control} render={({ field }) => <Select items={[{ label: "Não indicado", value: null }, ...Object.values(AllergyType).map((item) => ({ label: allergyTypeLabels[item], value: item }))]} value={field.value ?? null} onValueChange={field.onChange} disabled={isSubmitting}><SelectTrigger><SelectValue placeholder="Não indicado" /></SelectTrigger><SelectContent><SelectItem value={null}>Não indicado</SelectItem>{Object.values(AllergyType).map((item) => <SelectItem key={item} value={item}>{allergyTypeLabels[item]}</SelectItem>)}</SelectContent></Select>} />{errors.type && <FieldError errors={[errors.type]} />}</Field>
      <Field data-invalid={Boolean(errors.severity)}><FieldLabel>Gravidade</FieldLabel><Controller name="severity" control={control} render={({ field }) => <Select items={Object.values(AllergySeverity).map((item) => ({ label: severityLabels[item], value: item }))} value={field.value} onValueChange={field.onChange} disabled={isSubmitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.values(AllergySeverity).map((item) => <SelectItem key={item} value={item}>{severityLabels[item]}</SelectItem>)}</SelectContent></Select>} />{errors.severity && <FieldError errors={[errors.severity]} />}</Field></div>
      <Field data-invalid={Boolean(errors.reaction)}><FieldLabel htmlFor="allergy-reaction">Reação</FieldLabel><Textarea id="allergy-reaction" disabled={isSubmitting} {...register("reaction")} />{errors.reaction && <FieldError errors={[errors.reaction]} />}</Field>
      <Field data-invalid={Boolean(errors.observations)}><FieldLabel htmlFor="allergy-observations">Observações</FieldLabel><Textarea id="allergy-observations" disabled={isSubmitting} {...register("observations")} />{errors.observations && <FieldError errors={[errors.observations]} />}</Field>
    </FieldGroup><div className="flex justify-end"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "A guardar..." : allergy ? "Guardar correção" : "Registar alergia"}</Button></div></form></DialogContent>
  </Dialog>;
}

const categoryLabels: Record<ClinicalRecordCategory, string> = { MEDICAL: "Medicina", NURSING: "Enfermagem", PHYSIOTHERAPY: "Fisioterapia", OCCUPATIONAL_THERAPY: "Terapia ocupacional", SPEECH_THERAPY: "Terapia da fala", PSYCHOLOGY: "Psicologia", NUTRITION: "Nutrição", SOCIAL_WORK: "Serviço social", AUDIOLOGY: "Audiologia", OTHER: "Outro" };
type RecordValues = z.input<typeof clinicalRecordSchema>;
export function ClinicalRecordDialog({ residentId, record }: { residentId: string; record?: { id: string; category: ClinicalRecordCategory; title: string; content: string; clinicalAt: Date } }) {
  const [open, setOpen] = useState(false);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register, setError, reset } = useForm<RecordValues>({ resolver: zodResolver(clinicalRecordSchema), defaultValues: { category: record?.category ?? ClinicalRecordCategory.NURSING, title: record?.title ?? "", content: record?.content ?? "", clinicalAt: toDateTimeInput(record?.clinicalAt) } });
  const submit = handleSubmit(async (values) => { const formData = new FormData(); Object.entries(values).forEach(([key, value]) => formData.set(key, String(value ?? ""))); formData.set("clinicalAt", toIsoDateTime(values.clinicalAt)); if (record) formData.set("amendsRecordId", record.id); const result = record ? await amendClinicalRecord(residentId, initialState, formData) : await createClinicalRecord(residentId, initialState, formData); if (!result.success) { Object.entries(result.errors ?? {}).forEach(([key, messages]) => setError(key as keyof RecordValues, { message: messages[0] })); setError("root", { message: result.message }); return; } setOpen(false); reset(); });
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button className={record ? secondaryActionClass : undefined} />}>{record ? <><PencilLine aria-hidden size={16} /> Corrigir</> : <><Plus aria-hidden size={18} /> Novo registo</>}</DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{record ? "Corrigir registo clínico" : "Novo registo clínico"}</DialogTitle></DialogHeader><form noValidate onSubmit={submit} className="space-y-5"><RootError message={errors.root?.message} /><FieldGroup>
    <div className="grid gap-5 sm:grid-cols-2"><Field data-invalid={Boolean(errors.category)}><FieldLabel>Categoria</FieldLabel><Controller name="category" control={control} render={({ field }) => <Select items={Object.values(ClinicalRecordCategory).map((item) => ({ label: categoryLabels[item], value: item }))} value={field.value} onValueChange={field.onChange} disabled={isSubmitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.values(ClinicalRecordCategory).map((item) => <SelectItem key={item} value={item}>{categoryLabels[item]}</SelectItem>)}</SelectContent></Select>} />{errors.category && <FieldError errors={[errors.category]} />}</Field><Field data-invalid={Boolean(errors.clinicalAt)}><FieldLabel htmlFor="record-date">Data e hora clínica</FieldLabel><Input id="record-date" type="datetime-local" disabled={isSubmitting} {...register("clinicalAt")} />{errors.clinicalAt && <FieldError errors={[errors.clinicalAt]} />}</Field></div>
    <Field data-invalid={Boolean(errors.title)}><FieldLabel htmlFor="record-title">Título</FieldLabel><Input id="record-title" disabled={isSubmitting} {...register("title")} />{errors.title && <FieldError errors={[errors.title]} />}</Field>
    <Field data-invalid={Boolean(errors.content)}><FieldLabel htmlFor="record-content">Conteúdo clínico</FieldLabel><Textarea id="record-content" className="min-h-40" disabled={isSubmitting} {...register("content")} />{errors.content && <FieldError errors={[errors.content]} />}</Field>
  </FieldGroup><div className="flex justify-end"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "A guardar..." : record ? "Guardar correção" : "Criar registo"}</Button></div></form></DialogContent></Dialog>;
}

export { categoryLabels, severityLabels, allergyTypeLabels };
