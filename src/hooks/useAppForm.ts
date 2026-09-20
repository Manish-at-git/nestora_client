import { useForm, type UseFormProps, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";

export interface UseAppFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues
> extends Omit<UseFormProps<TFieldValues, TContext, TTransformedValues>, "resolver"> {
  schema?: ZodType<any, any, any>;
  resolver?: UseFormProps<TFieldValues, TContext, TTransformedValues>["resolver"];
}

/**
 * Custom form hook for high-performance forms.
 * Defaults to `mode: "onTouched"` so that Zod validation runs on blur and submit
 * instead of freezing typing on every keystroke.
 */
export function useAppForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues
>(props?: UseAppFormProps<TFieldValues, TContext, TTransformedValues>) {
  const { schema, resolver, mode = "onTouched", ...rest } = props || {};

  return useForm<TFieldValues, TContext, TTransformedValues>({
    mode,
    resolver: schema ? (zodResolver(schema) as any) : resolver,
    ...rest,
  });
}

export default useAppForm;
