/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ref, watch, toValue, reactive } from 'vue';
import type { ObjectSchema, AnyObject } from 'yup';
import { ValidationError } from 'yup';

export interface UseFormOptions<DATA extends AnyObject> {
  mode: 'eager' | 'lazy';
  defaultValues: DATA;
}

export const useForm = <DATA extends AnyObject>(
  schema: ObjectSchema<DATA>,
  options?: Partial<UseFormOptions<DATA>>,
) => {
  type Errors = Partial<Record<keyof DATA, ValidationError>>;
  // Merge default options with user-defined options
  const opts: UseFormOptions<DATA> = Object.assign(
    {},
    { mode: 'lazy', defaultValues: schema.getDefault() } as UseFormOptions<DATA>,
    options,
  );

  const values = reactive<DATA>(opts.defaultValues);
  const isValid = ref(true);
  const isLoading = ref(false);
  const errors = ref<Errors>();

  const clearErrors = (): void => {
    errors.value = undefined;
  };

  // Function to clear error by data key
  const clearError = (key: keyof DATA): void => {
    if (!errors.value) return;
    if (!(key in errors.value)) return;

    delete errors.value[key];
  };

  const setToDefaultValues = () => {
    Object.assign(values, { ...schema.getDefault() });
  };

  // Function to group errors by data key
  const setErrors = (err: ValidationError): void => {
    errors.value = err.inner.reduce((accum, innerErr) => {
      accum[innerErr.path as keyof DATA] = innerErr;
      return accum;
    }, {} as Errors);
  };

  // Function to initiate validation watch
  let unwatch: null | (() => void) = null;
  const validationWatch = (): void => {
    if (unwatch !== null) {
      return;
    }

    unwatch = watch(
      () => toValue(values),
      async () => {
        await validate();
      },
      { deep: true },
    );
  };

  // Function to perform validation
  const validate = (): boolean => {
    clearErrors();

    try {
      schema.validateSync(values, { abortEarly: false });
      isValid.value = true;
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        // Group errors by data key
        setErrors(err);
        isValid.value = false;

        // Watch for field updates and re-validate
        validationWatch();

        return false;
      }
      return false;
    }
  };

  // Function to validate a specific field by key
  const validateField = (key: keyof DATA): boolean => {
    clearError(key);

    try {
      schema.validateSyncAt(key as string, values);
      isValid.value = true;

      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        if (errors.value && key in errors.value) {
          // Group errors by data key
          setErrors(err);
        } else {
          // Error by data key
          errors.value = { ...(errors.value ?? {}), [key]: err } as Errors;
        }

        return false;
      }

      return false;
    }
  };

  const submit = (callback: () => Promise<void> | void, onError?: VoidFunction) => async () => {
    isLoading.value = true;
    const isSuccess = validate();
    if (isSuccess) {
      await callback();
    } else {
      onError?.();
    }
    isLoading.value = false;
  };

  // Function to scroll to the first error in the form. To work, a field should have a .is-error class.
  const scrollToError = (selector = '.is-error', options = { offset: 0 }): void => {
    const element = document.querySelector(selector);

    if (element) {
      const topOffset =
        element.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        options.offset;

      window.scrollTo({
        behavior: 'smooth',
        top: topOffset,
      });
    }
  };

  // Activate validation watch based on the chosen mode
  if (opts.mode === 'eager') {
    validationWatch();
  }

  // Expose functions and variables for external use
  return {
    values,
    submit,
    validate,
    validateField,
    errors,
    isLoading,
    isValid,
    clearErrors,
    clearError,
    scrollToError,
    setToDefaultValues,
  };
};
