'use client';

import { fullIntakeSchema, type FullIntake } from '@jeevansetu/types';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, Megaphone, Mic, MicOff } from 'lucide-react';
import { useState, useRef } from 'react';

import { api, ApiClientError } from '@/lib/api';
import type { FullIntakeResultView } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Phase 4 — Nurse intake form. Captures patient demographics, vitals, and
 * symptoms, then submits a single full-intake request. The server runs the
 * deterministic safety screen immediately and returns the result, which is shown
 * here so the nurse sees life-threatening red flags at the bedside.
 */
export default function IntakePage() {
  const { t } = useTranslation();
  const [result, setResult] = useState<FullIntakeResultView | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [vitals, setVitals] = useState({
    temperatureC: '',
    oxygenSaturation: '',
    heartRate: '',
    respiratoryRate: '',
    systolicBp: '',
    diastolicBp: '',
  });

  const [secondarySymptoms, setSecondarySymptoms] = useState<string[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Refs to persist across recognition restarts without triggering re-renders
  const manuallyStopped = useRef(false);
  const accumulatedTranscript = useRef('');

  const startVoiceIntake = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    // Reset state on a fresh start
    manuallyStopped.current = false;
    accumulatedTranscript.current = '';
    setTranscript('');
    setInterimText('');
    setIsRecording(true);

    const launchRecognition = () => {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onerror = (e: any) => {
        // Ignore no-speech errors — these are common pauses, not real errors
        if (e.error === 'no-speech') return;
        console.error('Speech recognition error:', e.error);
        if (e.error === 'audio-capture' || e.error === 'not-allowed') {
          manuallyStopped.current = true;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        // If not manually stopped, auto-restart to keep recording through silences
        if (!manuallyStopped.current) {
          try {
            launchRecognition();
          } catch {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          accumulatedTranscript.current += finalTranscript;
          setTranscript(accumulatedTranscript.current);
          setInterimText('');
        } else {
          setInterimText(interimTranscript);
        }
      };

      (window as any)._currentRecognition = recognition;
      recognition.start();
    };

    launchRecognition();
  };

  const stopVoiceIntake = () => {
    manuallyStopped.current = true;
    if ((window as any)._currentRecognition) {
      ((window as any)._currentRecognition).stop();
    }
    setIsRecording(false);
    // Use the ref value which has the full accumulated transcript
    const finalText = (accumulatedTranscript.current + ' ' + interimText).trim();
    void handleParseTranscript(finalText);
  };

  const handleParseTranscript = async (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    setIsParsingVoice(true);
    try {
      const data = await api.post<any>('/patients/intake/parse-voice', { transcript: cleaned });
      
      const fields: Record<string, string | number | undefined> = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        bloodGroup: data.bloodGroup,
        chiefComplaint: data.chiefComplaint,
        primarySymptom: data.primarySymptom,
        primarySeverity: data.primarySeverity,
        temperatureC: data.temperatureC,
        oxygenSaturation: data.oxygenSaturation,
        heartRate: data.heartRate,
        respiratoryRate: data.respiratoryRate,
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
      };

      Object.entries(fields).forEach(([id, val]) => {
        if (val !== undefined && val !== null) {
          const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
          if (input) {
            input.value = String(val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });

      setVitals({
        temperatureC: data.temperatureC !== undefined && data.temperatureC !== null ? String(data.temperatureC) : vitals.temperatureC,
        oxygenSaturation: data.oxygenSaturation !== undefined && data.oxygenSaturation !== null ? String(data.oxygenSaturation) : vitals.oxygenSaturation,
        heartRate: data.heartRate !== undefined && data.heartRate !== null ? String(data.heartRate) : vitals.heartRate,
        respiratoryRate: data.respiratoryRate !== undefined && data.respiratoryRate !== null ? String(data.respiratoryRate) : vitals.respiratoryRate,
        systolicBp: data.systolicBp !== undefined && data.systolicBp !== null ? String(data.systolicBp) : vitals.systolicBp,
        diastolicBp: data.diastolicBp !== undefined && data.diastolicBp !== null ? String(data.diastolicBp) : vitals.diastolicBp,
      });

      if (data.isUnconscious !== undefined) {
        const checkbox = document.getElementsByName('isUnconscious')[0] as HTMLInputElement | null;
        if (checkbox) {
          checkbox.checked = !!data.isUnconscious;
        }
      }

      if (data.allergies && Array.isArray(data.allergies)) {
        const input = document.getElementById('allergies') as HTMLInputElement | null;
        if (input) input.value = data.allergies.join(', ');
      }
      if (data.existingDiseases && Array.isArray(data.existingDiseases)) {
        const input = document.getElementById('existingDiseases') as HTMLInputElement | null;
        if (input) input.value = data.existingDiseases.join(', ');
      }
      if (data.medications && Array.isArray(data.medications)) {
        const input = document.getElementById('medications') as HTMLInputElement | null;
        if (input) input.value = data.medications.join(', ');
      }

      if (data.secondarySymptoms && Array.isArray(data.secondarySymptoms)) {
        setSecondarySymptoms(data.secondarySymptoms);
      }
      setVoiceError(null);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes('rate limit') || err?.message?.includes('quota')
        ? 'Gemini quota exceeded — please wait ~30 seconds and try again.'
        : 'Failed to parse clinical transcript. Please try again.';
      setVoiceError(msg);
    } finally {
      setIsParsingVoice(false);
    }
  };

  const getVitalsWarning = (name: string, val: string) => {
    if (!val) return undefined;
    const num = Number(val);
    if (isNaN(num)) return undefined;

    if (name === 'oxygenSaturation') {
      if (num < 90) return 'CRITICAL';
      if (num < 92) return 'LOW';
    }
    if (name === 'heartRate') {
      if (num < 50 || num > 120) return 'OUT OF RANGE';
    }
    if (name === 'temperatureC') {
      if (num < 35 || num > 38.5) return 'OUT OF RANGE';
    }
    if (name === 'respiratoryRate') {
      if (num < 10 || num > 24) return 'OUT OF RANGE';
    }
    if (name === 'systolicBp') {
      if (num < 90 || num > 160) return 'OUT OF RANGE';
    }
    return undefined;
  };

  const handleVitalsChange = (name: keyof typeof vitals) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const mutation = useMutation({
    mutationFn: (payload: FullIntake) => api.post<FullIntakeResultView>('/patients/intake', payload),
    onSuccess: (data) => {
      setResult(data);
      setErrorMsg(null);
    },
    onError: (err) =>
      setErrorMsg(err instanceof ApiClientError ? err.message : 'Submission failed'),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = {
      patient: {
        name: String(form.get('name') ?? ''),
        age: Number(form.get('age') ?? 0),
        gender: String(form.get('gender') ?? 'UNKNOWN'),
        phone: optional(form.get('phone')),
        guardianName: optional(form.get('guardianName')),
        guardianPhone: optional(form.get('guardianPhone')),
        bloodGroup: String(form.get('bloodGroup') ?? 'UNKNOWN'),
        allergies: splitList(form.get('allergies')),
        existingDiseases: splitList(form.get('existingDiseases')),
        medications: splitList(form.get('medications')),
      },
      vitals: {
        temperatureC: numOrUndef(form.get('temperatureC')),
        oxygenSaturation: numOrUndef(form.get('oxygenSaturation')),
        heartRate: numOrUndef(form.get('heartRate')),
        respiratoryRate: numOrUndef(form.get('respiratoryRate')),
        systolicBp: numOrUndef(form.get('systolicBp')),
        diastolicBp: numOrUndef(form.get('diastolicBp')),
        isUnconscious: form.get('isUnconscious') === 'on',
      },
      symptoms: {
        primarySymptom: { name: String(form.get('primarySymptom') ?? ''), severity: String(form.get('primarySeverity') ?? 'MODERATE'), isPrimary: true },
        secondarySymptoms: splitList(form.get('secondarySymptoms')).map((name) => ({ name, severity: 'MODERATE' as const })),
      },
      chiefComplaint: optional(form.get('chiefComplaint')),
    };

    const parsed = fullIntakeSchema.safeParse(raw);
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
      return;
    }
    mutation.mutate(parsed.data);
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('patientIntake')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {isRecording ? (
            <button
              type="button"
              onClick={stopVoiceIntake}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition animate-pulse-glow"
            >
              <MicOff className="h-4 w-4" />
              <span>Stop Listening</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isParsingVoice}
              onClick={startVoiceIntake}
              className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition"
            >
              {isParsingVoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span>{isParsingVoice ? 'Structuring Voice...' : 'Voice Intake'}</span>
            </button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col gap-2 animate-slide-in">
          <div className="flex items-center gap-2 text-red-600 font-semibold text-xs uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>Microphone Listening... Speak clinical details now</span>
          </div>
          <p className="text-sm text-slate-700 italic select-text leading-relaxed">
            {transcript || interimText ? (
              <>
                <span>{transcript}</span>
                <span className="text-slate-400 font-normal">{interimText}</span>
              </>
            ) : (
              "Start speaking patient vitals, name, age, gender, symptoms..."
            )}
          </p>
        </div>
      )}

      {isParsingVoice && (
        <div className="mb-6 p-4 rounded-xl border border-brand-200 bg-brand-50/30 flex items-center gap-3 animate-slide-in">
          <Loader2 className="h-5 w-5 animate-spin text-brand-700" />
          <span className="text-sm font-medium text-slate-700">Gemini LLM is extracting clinical data from your speech...</span>
        </div>
      )}

      {voiceError && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-3 animate-slide-in">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Voice Processing Failed</p>
            <p>{voiceError}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <fieldset className="card space-y-4">
          <legend className="px-1 text-sm font-semibold text-brand-700">{t('patientDemographics')}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fullName')} name="name" required />
            <Field label={t('age')} name="age" type="number" required />
            <Select label={t('gender')} name="gender" options={['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']} />
            <Field label={t('phone')} name="phone" />
            <Field label={t('guardianName')} name="guardianName" />
            <Field label={t('guardianPhone')} name="guardianPhone" />
            <Select label={t('bloodGroup')} name="bloodGroup" options={['UNKNOWN', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']} />
          </div>
          <Field label={t('allergies')} name="allergies" />
          <Field label={t('existingDiseases')} name="existingDiseases" />
          <Field label={t('medications')} name="medications" />
        </fieldset>

        <fieldset className="card space-y-4">
          <legend className="px-1 text-sm font-semibold text-brand-700">{t('vitalSigns')}</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t('temperature')} name="temperatureC" type="number" step="0.1" value={vitals.temperatureC} onChange={handleVitalsChange('temperatureC')} warning={getVitalsWarning('temperatureC', vitals.temperatureC)} />
            <Field label={t('oxygenSaturation')} name="oxygenSaturation" type="number" value={vitals.oxygenSaturation} onChange={handleVitalsChange('oxygenSaturation')} warning={getVitalsWarning('oxygenSaturation', vitals.oxygenSaturation)} />
            <Field label={t('heartRate')} name="heartRate" type="number" value={vitals.heartRate} onChange={handleVitalsChange('heartRate')} warning={getVitalsWarning('heartRate', vitals.heartRate)} />
            <Field label={t('respiratoryRate')} name="respiratoryRate" type="number" value={vitals.respiratoryRate} onChange={handleVitalsChange('respiratoryRate')} warning={getVitalsWarning('respiratoryRate', vitals.respiratoryRate)} />
            <Field label="Systolic BP" name="systolicBp" type="number" value={vitals.systolicBp} onChange={handleVitalsChange('systolicBp')} warning={getVitalsWarning('systolicBp', vitals.systolicBp)} />
            <Field label="Diastolic BP" name="diastolicBp" type="number" value={vitals.diastolicBp} onChange={handleVitalsChange('diastolicBp')} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="isUnconscious" className="h-4 w-4" /> {t('unconscious')}
          </label>
        </fieldset>

        <fieldset className="card space-y-4">
          <legend className="px-1 text-sm font-semibold text-brand-700">{t('symptoms')}</legend>
          <Field label={t('chiefComplaint')} name="chiefComplaint" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('primarySymptom')} name="primarySymptom" required />
            <Select label={t('severity')} name="primarySeverity" options={['MILD', 'MODERATE', 'SEVERE']} />
          </div>
          <SymptomTagInput
            label={t('secondarySymptoms')}
            name="secondarySymptoms"
            tags={secondarySymptoms}
            onAddTag={(tag) => setSecondarySymptoms((prev) => [...prev, tag])}
            onRemoveTag={(tag) => setSecondarySymptoms((prev) => prev.filter((t) => t !== tag))}
          />
        </fieldset>

        {errorMsg ? <p className="rounded-lg bg-red-50 p-3 text-sm text-critical">{errorMsg}</p> : null}

        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('submit')}
        </button>
      </form>

      {result ? <SafetyResultPanel result={result} /> : null}
    </div>
  );
}

function SafetyResultPanel({ result }: { result: FullIntakeResultView }) {
  const { t } = useTranslation();
  const critical = result.safety.isCritical;
  const [broadcasted, setBroadcasted] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const broadcastMutation = useMutation({
    mutationFn: () =>
      api.post('/notifications/broadcast', {
        department: 'Emergency',
        title: `EMERGENCY: Critical Patient Registered`,
        body: `Critical safety conditions detected for Patient ${result.patientName} at ${result.hospitalName}. Immediate assistance required.`,
        payload: { visitId: result.visitId },
      }),
    onSuccess: () => {
      setBroadcasted(true);
      setBroadcastError(null);
    },
    onError: (err) => {
      setBroadcastError(err instanceof ApiClientError ? err.message : 'Broadcast failed');
    },
  });

  return (
    <div className={`card mt-6 border-l-4 transition-all duration-300 animate-slide-in ${critical ? 'border-l-critical bg-red-50' : 'border-l-low bg-green-50'}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {critical ? (
            <AlertTriangle className="h-5 w-5 text-critical" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-low" />
          )}
          <h3 className="font-semibold text-slate-900">
            {critical ? 'CRITICAL — immediate action required' : 'No critical red flags detected'}
          </h3>
        </div>
        
        {critical && (
          <button
            onClick={() => broadcastMutation.mutate()}
            disabled={broadcastMutation.isPending || broadcasted}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-critical text-white font-medium text-xs hover:bg-red-700 disabled:opacity-50 transition"
          >
            <Megaphone className="h-3.5 w-3.5" />
            {broadcasted ? 'Broadcasted' : 'Broadcast Emergency'}
          </button>
        )}
      </div>

      {broadcastError && <p className="mt-2 text-xs text-critical font-medium">{broadcastError}</p>}
      {broadcasted && <p className="mt-2 text-xs text-green-700 font-medium">Emergency alert broadcasted to all active specialists.</p>}

      <div className="mt-2">
        <p className="text-sm font-semibold text-slate-800">
          {result.hospitalName} — Emergency Department
        </p>
        <p className="text-xs text-slate-400">Visit ID: {result.visitId}</p>
      </div>
      {result.safety.triggeredRules.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {result.safety.triggeredRules.map((r) => (
            <li key={r.ruleId}>
              • <strong>{r.label}</strong> — {r.rationale}
            </li>
          ))}
        </ul>
      ) : null}
      {result.safety.recommendedActions.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-800">Recommended actions</p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
            {result.safety.recommendedActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  step,
  value,
  onChange,
  warning,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  warning?: string;
}) {
  return (
    <div>
      <label className="label flex justify-between items-center" htmlFor={name}>
        <span>
          {label}
          {required ? <span className="text-critical"> *</span> : null}
        </span>
        {warning && (
          <span className={`text-[10px] font-bold animate-pulse flex items-center gap-0.5 ${warning === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
            {warning}
          </span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={onChange}
        className={`input transition-all duration-200 ${
          warning === 'CRITICAL'
            ? 'border-red-400 bg-red-50/30 focus:ring-red-400 focus:border-red-400 focus:outline-none'
            : warning === 'LOW' || warning === 'OUT OF RANGE'
              ? 'border-amber-400 bg-amber-50/20 focus:ring-amber-400 focus:border-amber-400 focus:outline-none'
              : ''
        }`}
      />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} className="input">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
function optional(value: FormDataEntryValue | null): string | undefined {
  const s = String(value ?? '').trim();
  return s || undefined;
}
function numOrUndef(value: FormDataEntryValue | null): number | undefined {
  const s = String(value ?? '').trim();
  return s ? Number(s) : undefined;
}

function SymptomTagInput({
  label,
  name,
  tags,
  onAddTag,
  onRemoveTag,
}: {
  label: string;
  name: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        onAddTag(val);
        setInput('');
      }
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition duration-150">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-brand-50 text-brand-800 text-xs font-semibold px-2 py-1 rounded-md border border-brand-100 animate-scale-in">
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="text-brand-500 hover:text-brand-800 font-bold transition ml-1"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type symptom and press Enter..." : ""}
          className="flex-1 bg-transparent border-0 outline-none p-0.5 text-sm text-slate-800 min-w-[120px] focus:ring-0 focus:outline-none"
        />
      </div>
      <input type="hidden" name={name} value={tags.join(',')} />
    </div>
  );
}
