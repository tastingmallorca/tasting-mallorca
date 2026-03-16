'use client';

import { useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { debounce, isEqual } from 'lodash';

export const useFormPersistence = (
    key: string,
    form: UseFormReturn<any>,
    defaultValues: any
) => {
    const { watch, reset, getValues } = form;

    const saveState = useCallback(debounce((data: any) => {
        try {
            const stateToSave = JSON.stringify(data, (key, value) => {
                if (value instanceof File) {
                    return null;
                }
                return value;
            });
            localStorage.setItem(key, stateToSave);
        } catch (error) {
            console.error("Could not save form state to localStorage", error);
        }
    }, 500), [key]);

    const clearPersistedData = useCallback(() => {
        localStorage.removeItem(key);
    }, [key]);

    // Load state from localStorage on initial mount
    useEffect(() => {
        let isMounted = true;
        try {
            const savedStateJSON = localStorage.getItem(key);
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                
                if (savedState.availabilityPeriods) {
                    savedState.availabilityPeriods = savedState.availabilityPeriods.map((p: any) => ({
                        ...p,
                        startDate: p.startDate ? new Date(p.startDate) : undefined,
                        endDate: p.endDate ? new Date(p.endDate) : undefined,
                        activeDays: p.activeDays && p.activeDays.length > 0 ? p.activeDays : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        languages: p.languages && p.languages.length > 0 ? p.languages : ['en', 'es', 'de', 'fr', 'nl']
                    }));
                }

                // Merge with default values to ensure all fields are present
                const mergedState = { ...defaultValues, ...savedState };
                
                if (isMounted) {
                    reset(mergedState, { keepDefaultValues: true });
                }
            }
        } catch (error) {
            console.error("Could not load form state from localStorage", error);
        }

        return () => {
            isMounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    
    // Watch for form changes and save to localStorage
    useEffect(() => {
        const subscription = watch((value) => {
            saveState(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, saveState]);

    return { clearPersistedData };
};
