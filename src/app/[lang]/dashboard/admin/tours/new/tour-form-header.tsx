

'use client';

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ArrowLeft, Loader2, Save, Languages, Settings2, Menu } from "lucide-react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { Tour } from "@/backend/tours/domain/tour.model";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useDashboardLayout } from "@/app/[lang]/dashboard/layout-context";

interface TourFormHeaderProps {
    isSubmitting: boolean;
    isTranslating: boolean;
    onTranslate: () => void;
    initialData?: Tour;
    basePath: string;
}

export function TourFormHeader({
    isSubmitting,
    isTranslating,
    onTranslate,
    initialData,
    basePath,
}: TourFormHeaderProps) {
    const { control, formState: { isDirty } } = useFormContext();
    const { setIsMobileMenuOpen } = useDashboardLayout();

    const ActionPanel = () => (
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-0">
             <Button 
                onClick={onTranslate} 
                size="lg" 
                variant="outline"
                disabled={isTranslating || isSubmitting}
                className="w-full md:w-auto justify-center md:size-auto md:px-4 md:py-2 md:text-sm"
            >
                {isTranslating ? <Loader2 className="animate-spin" /> : <><Languages className="mr-2" /> <span>Translate with AI</span></>}
            </Button>
            <FormField
                control={control}
                name="published"
                render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 md:border-0 md:p-0">
                        <FormLabel className="text-base font-normal md:text-sm">
                            {field.value ? 'Published' : 'Draft'}
                        </FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )}
            />
            <Button 
                size="lg" 
                disabled={isSubmitting}
                className={cn("w-full md:w-auto md:h-11 md:px-8 transition-all", isDirty ? "bg-accent text-accent-foreground hover:bg-accent/90" : "")}
                type="submit"
                form="tour-form"
            >
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> {isDirty ? 'Save Changes' : 'Save Tour'}</>
                )}
            </Button>
        </div>
    );

    return (
        <header className="flex h-20 items-center justify-between border-b bg-background px-4 md:px-8 shrink-0">
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={basePath}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Tours
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">
                    {initialData ? 'Edit Tour' : 'Create New Tour'}
                </h1>
            </div>
            <div className="hidden md:flex">
                <ActionPanel />
            </div>

            {/* Mobile View */}
            <div className="flex md:hidden items-center justify-between w-full">
                 <Button asChild variant="ghost" size="icon">
                    <Link href={basePath}>
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">
                    {initialData ? 'Edit Tour' : 'Create Tour'}
                </h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings2 />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] p-0">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>Form Actions</SheetTitle>
                            <SheetDescription className='sr-only'>Actions to save, translate, and publish the tour.</SheetDescription>
                        </SheetHeader>
                        <ActionPanel />
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
