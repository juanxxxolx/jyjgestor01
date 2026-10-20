/**
 * @file Hook personalizado para validación de formularios con UX mejorada.
 * - Muestra todos los errores de golpe al hacer submit
 * - Scroll automático al primer campo con error
 * - Deshabilita botón mientras valida/envía
 */

import { useCallback, useRef } from 'react';
import { FormInstance, Rule } from 'antd/es/form';

interface UseFormValidationOptions<T> {
  form: FormInstance<T>;
  onSubmit: (values: T) => Promise<void> | void;
  /** Scroll al primer error (default: true) */
  scrollToFirstError?: boolean;
  /** Mensaje de error genérico si falla el submit */
  submitErrorMessage?: string;
  /** Callback cuando el submit es exitoso */
  onSuccess?: () => void;
}

export function useFormValidation<T extends Record<string, any>>({
  form,
  onSubmit,
  scrollToFirstError = true,
  submitErrorMessage = 'Error al guardar',
  onSuccess,
}: UseFormValidationOptions<T>) {
  const submittingRef = useRef(false);
  const submitCountRef = useRef(0);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    submitCountRef.current += 1;
    const currentSubmit = submitCountRef.current;

    try {
      // Validar todos los campos
      const values = await form.validateFields();

      // Ejecutar submit
      await onSubmit(values);

      // Solo ejecutar success si es el submit más reciente
      if (currentSubmit === submitCountRef.current) {
        onSuccess?.();
      }
    } catch (err: any) {
      // Ant Design lanza error con errorFields cuando hay errores de validación
      if (err?.errorFields && err.errorFields.length > 0) {
        // Los errores ya se muestran en los campos, solo hacemos scroll
        if (scrollToFirstError) {
          const firstErrorField = err.errorFields[0];
          const node = document.querySelector(`[name="${firstErrorField.name.join('.')}"]`);
          if (node) {
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (node as HTMLElement).focus?.();
          }
        }
      } else if (err) {
        // Error del servidor u otro
        console.error('Submit error:', err);
      }
    } finally {
      if (currentSubmit === submitCountRef.current) {
        submittingRef.current = false;
      }
    }
  }, [form, onSubmit, scrollToFirstError, onSuccess]);

  const isSubmitting = submittingRef.current;

  return {
    handleSubmit,
    isSubmitting,
  };
}

/**
 * Hook para obtener reglas de validación comunes reutilizables.
 */
export const validationRules = {
  required: (message = 'Este campo es obligatorio'): Rule => ({
    required: true,
    message,
  }),
  email: (message = 'Email no válido'): Rule => ({
    type: 'email',
    message,
  }),
  minLength: (min: number, message?: string): Rule => ({
    min,
    message: message || `Mínimo ${min} caracteres`,
  }),
  maxLength: (max: number, message?: string): Rule => ({
    max,
    message: message || `Máximo ${max} caracteres`,
  }),
  numeric: (message = 'Solo números'): Rule => ({
    pattern: /^\d+$/,
    message,
  }),
  phone: (message = 'Teléfono inválido (10 dígitos)'): Rule => ({
    pattern: /^\d{10}$/,
    message,
  }),
  positiveNumber: (message = 'Debe ser mayor a 0'): Rule => ({
    type: 'number',
    min: 1,
    message,
  }),
  nonNegativeNumber: (message = 'Debe ser 0 o mayor'): Rule => ({
    type: 'number',
    min: 0,
    message,
  }),
  noWhitespace: (message = 'No debe contener solo espacios'): Rule => ({
    validator: (_: any, value: string) => {
      if (!value || !value.trim()) return Promise.reject(new Error(message));
      return Promise.resolve();
    },
  }),
  alphanumeric: (message = 'Solo letras, números, guiones y guiones bajos'): Rule => ({
    pattern: /^[A-Za-z0-9\-_]+$/,
    message,
  }),
  uppercaseAlphanumeric: (message = 'Solo mayúsculas, números, guiones y guiones bajos'): Rule => ({
    pattern: /^[A-Z0-9\-_]+$/,
    message,
  }),
};

/**
 * Combinar múltiples reglas en una sola.
 */
export function composeRules(...rules: Rule[]): Rule[] {
  return rules;
}