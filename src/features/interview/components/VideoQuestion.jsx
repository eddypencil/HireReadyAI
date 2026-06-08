//src\features\interview\components\VideoQuestion.jsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/shared/services/supabase";
import { uploadRecording } from "../services/video_storage_service";
import { Camera, CheckCircle2, Redo2, Video, StopCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
const MAX_SECONDS = 180;

export default function VideoQuestion({
  question,
  applicationStageId,
  onAnswer,
}) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState("idle");
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const timerRef = useRef(null);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionGranted(true);
      setStatus("previewing");
    } catch {
      setPermissionGranted(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: request camera on mount
    requestCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    chunksRef.current = [];
    setVideoUrl(null);
    blobRef.current = null;

    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm; codecs=vp9",
      });
    } catch {
      recorder = new MediaRecorder(streamRef.current);
    }

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      blobRef.current = blob;
      setVideoUrl(URL.createObjectURL(blob));
      setStatus("reviewing");
    };

    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setStatus("recording");
    setTimeLeft(MAX_SECONDS);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!blobRef.current || !question?.id) return;
    setStatus("uploading");

    try {
      const { fileName } = await uploadRecording(
        blobRef.current,
        applicationStageId,
        question.id,
      );

      const { data: whisperData, error: whisperErr } =
        await supabase.functions.invoke("whisper-api", {
          body: { audioPath: fileName, questionId: question.id },
        });

      if (whisperErr) throw whisperErr;

      const transcript = whisperData?.text ?? "";
      onAnswer(transcript || "[No transcript available]");
    } catch (err) {
      console.error("Upload/transcription failed:", err);
      onAnswer("[Transcription failed]");
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!permissionGranted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10">
        <div className="size-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
          <Camera className="size-7 text-accent" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-medium text-foreground">Camera access required</p>
          <p className="text-xs text-muted-foreground max-w-xs">Allow camera and microphone access to record your video answer</p>
        </div>
        <button
          onClick={requestCamera}
          className="flex items-center gap-2 bg-accent text-accent-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Video className="size-4" />
          Enable Camera & Microphone
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Video preview / review */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0a0f1a] aspect-video flex items-center justify-center border border-border shadow-md shadow-cerulean-900/10">
        {videoUrl && status === "reviewing" ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2.5 bg-foreground/10 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/10">
            <span className="size-2.5 rounded-full bg-destructive animate-pulse shadow-md shadow-destructive" />
            <span className="text-white text-xs font-medium tabular-nums">
              {fmt(timeLeft)}
            </span>
          </div>
        )}

        {/* Uploading overlay */}
        {status === "uploading" && (
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="size-10 rounded-xl border-2 border-white/20 border-t-white animate-spin" />
            <div className="text-center">
              <p className="text-white text-sm font-medium">
              {t("interview_page.video_question.transcribing")}
            </p>
              <p className="text-white/60 text-xs mt-0.5">
              {t("interview_page.video_question.transcribing_sub")}
            </p>
            </div>
          </div>
        )}

        {/* Idle overlay (camera not yet active) */}
        {status === "idle" && (
          <div className="absolute inset-0 bg-[#0a0f1a] flex flex-col items-center justify-center gap-3">
            <Camera className="size-8 text-foreground/20" />
            <p className="text-xs text-muted-foreground">Initializing camera…</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2.5">
        {status === "previewing" && (
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2.5 bg-destructive text-destructive-foreground rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-destructive/40"
          >
            <span className="size-3 rounded-full bg-white animate-pulse" />
            <span>Start Recording</span>
            <span className="text-destructive-foreground/70 text-xs">(max 3 min)</span>
          </button>
        )}

        {status === "recording" && (
          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-all"
          >
            <StopCircle className="size-5" />
            Stop Recording
          </button>
        )}

        {status === "reviewing" && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={startRecording}
              className="flex items-center justify-center gap-2 border border-border bg-card text-foreground rounded-xl py-3 text-sm font-medium hover:bg-secondary hover:border-primary/30 transition-all"
            >
              <Redo2 className="size-4" />
              {t("interview_page.video_question.re_record")}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/30"
            >
              <CheckCircle2 className="size-4" />
              {t("interview_page.video_question.submit_answer")} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
