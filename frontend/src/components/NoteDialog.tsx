"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Check, Headphones, Mic, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setFormErrors } from "@/lib/utils/set-form-errors";
import { noteSchema } from "@/schemas/notes";
import { saveNoteAction } from "@/server/actions/notes";
import { CategorySelect } from "./CategorySelect";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;

  item(index: number): SpeechRecognitionResult;

  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;

  item(index: number): SpeechRecognitionAlternative;

  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;

  start(): void;

  stop(): void;

  abort(): void;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: {
    id: string;
    title: string;
    content: string;
    category: string;
    updatedAt: string;
  };
  categories: Category[];
}

export function NoteDialog({
  open,
  onOpenChange,
  note,
  categories,
}: NoteDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousOpenRef = useRef(open);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      id: note?.id || "",
      title: note?.title || "",
      content: note?.content || "",
      category: note?.category || categories[0]?.id || "",
    },
  });

  const [_pending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const categoryId = form.watch("category");
  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  const lastEdited = note?.updatedAt
    ? format(new Date(note.updatedAt), "MMMM d, yyyy 'at' h:mma")
    : "";

  const onSubmit = useCallback(
    async (values: z.infer<typeof noteSchema>) => {
      setIsSaving(true);

      startTransition(async () => {
        const formData = new FormData();
        if (values.id) formData.append("id", values.id);
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("category", values.category);

        const result = await saveNoteAction({}, formData);

        setIsSaving(false);

        if (result.success) {
          setLastSaved(new Date());
          toast.success(result.success);

          if (result.note?.id) {
            form.setValue("id", result.note.id);
          }

          router.refresh();
        } else if (result.error) {
          if (typeof result.error === "string") {
            toast.error(result.error);
          } else {
            setFormErrors({ form, errors: result.error });
          }
        }
      });
    },
    [form, router],
  );

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let _interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += `${transcript} `;
          } else {
            _interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const currentContent = form.getValues("content");
          form.setValue("content", currentContent + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          toast.error(
            "Microphone access denied. Please enable it in your browser settings.",
          );
        } else if (event.error === "no-speech") {
          toast.info("No speech detected. Please try again.");
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [form]);

  const toggleRecording = useCallback(() => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.info("Recording stopped");
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success("Recording started. Speak into your microphone.");
      } catch (_error) {
        toast.error("Failed to start recording. Please try again.");
      }
    }
  }, [isRecording, isSupported]);

  useEffect(() => {
    if (previousOpenRef.current && !open) {
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }

      const values = form.getValues();
      if (values.title || values.content) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        form.handleSubmit(onSubmit)();
      }
    }
    previousOpenRef.current = open;
  }, [open, form, onSubmit, isRecording]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, form, onSubmit]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (!values.title && !values.content) {
        return;
      }

      saveTimeoutRef.current = setTimeout(() => {
        form.handleSubmit(onSubmit)();
      }, 10000);
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form, onSubmit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="note-dialog"
        className="w-full h-full !max-w-screen rounded-3xl border-none p-8 gap-0 border-[3px] shadow-none flex flex-col"
      >
        <DialogTitle className="sr-only">Edit Note</DialogTitle>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <DialogHeader className="p-0 pb-4 space-y-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-[225px]">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CategorySelect
                            categories={categories}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </DialogHeader>
            <Card
              className="flex-1 flex flex-col border-[3px] rounded-2xl overflow-hidden"
              style={{
                backgroundColor: selectedCategory?.color
                  ? `${selectedCategory.color}80`
                  : "#FCFBF9",
                borderColor: selectedCategory?.color || "#D4C7B7",
              }}
            >
              <div className="px-12 pb-6 flex-1 flex flex-col overflow-auto">
                {lastEdited && (
                  <div className="text-sm text-black/60 mb-4 text-right">
                    Last Edited: {lastEdited}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Note Title"
                          className="!text-2xl font-serif shadow-none font-bold border-none bg-transparent px-0 mb-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-black/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Pour your heart out..."
                          className="flex-1 p-0 w-full shadow-none border-none bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-black/40 h-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-between px-8 pb-8 pt-0 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-black/60">
                  {isSaving ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : lastSaved ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Saved</span>
                    </>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  className={`relative h-14 transition-all duration-500 ease-in-out text-white overflow-hidden border !border-[#2C2C2C] ${
                    isRecording
                      ? "w-[251px] px-4 bg-[#EF9C66] hover:bg-[#EF9C66]/90"
                      : "w-14 bg-black hover:bg-black/90"
                  }`}
                  style={{
                    borderRadius: "32px",
                  }}
                  onClick={toggleRecording}
                  disabled={!isSupported}
                  title={
                    !isSupported
                      ? "Speech recognition not supported"
                      : isRecording
                        ? "Stop recording"
                        : "Start voice recording"
                  }
                >
                  <div className="flex items-center justify-center w-full">
                    {isRecording ? (
                      <div className="flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-3">
                          <Mic
                            className="h-5 w-5 flex-shrink-0"
                            strokeWidth={2}
                          />
                          <Phone
                            className="h-5 w-5 flex-shrink-0 text-red-500 rotate-[135deg]"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="w-1 h-3 bg-white rounded-full animate-wave-1" />
                            <span className="w-1 h-4 bg-white rounded-full animate-wave-2" />
                            <span className="w-1 h-6 bg-white rounded-full animate-wave-3" />
                            <span className="w-1 h-4 bg-white rounded-full animate-wave-2" />
                            <span className="w-1 h-3 bg-white rounded-full animate-wave-1" />
                          </div>
                          <Headphones
                            className="h-5 w-5 flex-shrink-0"
                            strokeWidth={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <Mic className="h-6 w-6" strokeWidth={2} />
                    )}
                  </div>
                </Button>
              </div>
            </Card>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
