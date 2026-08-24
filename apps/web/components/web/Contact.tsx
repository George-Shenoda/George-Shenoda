'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { sendContactEmail } from '@/app/actions/contact';
import {
  createLocalStorageStorage,
  createOutbox,
  submitContact,
  type Outbox,
} from '@portfolio/shared';
import { CheckCircle2, AlertCircle, Loader2, MailWarning } from 'lucide-react';
import Reveal from './Reveal';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000';
const OUTBOX_KEY = 'portfolio-contact-outbox';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'queued'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [queuedCount, setQueuedCount] = useState(0);
  const outboxRef = useRef<Outbox | null>(null);

  const isDesktop =
    typeof window !== 'undefined' && window.electronAPI?.isDesktop === true;

  // Desktop only: keep an offline outbox and flush it on reconnect/launch.
  useEffect(() => {
    if (!isDesktop) return;
    const outbox = createOutbox({
      storage: createLocalStorageStorage(OUTBOX_KEY),
      submit: (payload) => submitContact(SITE_URL, payload),
    });
    outboxRef.current = outbox;

    const flush = async () => {
      try {
        const result = await outbox.flush();
        setQueuedCount(result.remaining.length);
      } catch {
        // storage unavailable — leave the queue untouched
      }
    };

    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [isDesktop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status === 'error' || status === 'queued') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const result =
        window.electronAPI?.isDesktop === true
          ? // Desktop app: no server runtime here — route through the deployed site.
            await submitContact(SITE_URL, formData)
          : await sendContactEmail(formData);

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else if (result.networkError && outboxRef.current) {
        // Offline: queue locally and auto-send when connectivity returns.
        await outboxRef.current.add(formData);
        setQueuedCount(await outboxRef.current.pendingCount());
        setStatus('queued');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setStatus('error');
      setErrorMessage('Failed to send message. Please check your connection and try again.');
    }
  };

    return (
        <div id="contact" className="w-full flex items-center justify-center p-6 sm:p-10 dark:bg-[#151d1d] bg-[#eee]">
          <Reveal className="w-full max-w-4xl">
          <div className="w-full max-w-4xl p-6 sm:p-10 bg-background dark:bg-[#161d1d] rounded-3xl shadow-2xl text-center border border-black/10 dark:border-white/10 transition-all">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Let&apos;s Engineer Your Next Solution</h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
          Ready to start your next project? Send me a message and let&apos;s get to work.
        </p>

        {status === 'success' ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-300" role="status">
            <div className="size-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-10" />
            </div>
            <h3 className="text-2xl font-semibold">Message Sent</h3>
            <p className="text-muted-foreground text-base max-w-md">
              Thank you for reaching out. I&apos;ve received your message and will get back to you as soon as possible.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatus('idle')}
              className="mt-4 cursor-pointer px-6 py-5 h-auto active:scale-[0.98] transition duration-300"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div aria-live="polite">
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in duration-200">
                <AlertCircle className="size-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {(status === 'queued' || (queuedCount > 0 && status === 'idle')) && (
              <div className="flex items-center gap-3 p-4 mb-2 rounded-xl bg-primary/10 border border-primary/25 text-primary text-sm font-medium animate-in fade-in duration-200">
                <MailWarning className="size-5 shrink-0" />
                <span>
                  {status === 'queued'
                    ? 'You are offline — your message was saved and will send automatically once you reconnect.'
                    : `${queuedCount} saved message${queuedCount === 1 ? '' : 's'} will send automatically once you are back online.`}
                </span>
              </div>
            )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-sm font-medium text-muted-foreground ml-1">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  disabled={status === 'loading'}
                  className="w-full p-3 text-base border border-gray-300 dark:border-gray-600 bg-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl transition duration-200 placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-sm font-medium text-muted-foreground ml-1">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full p-3 text-base border border-gray-300 dark:border-gray-600 bg-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl transition duration-200 placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-message" className="block text-sm font-medium text-muted-foreground ml-1">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me about your project, timeline, or question..."
                rows={5}
                required
                disabled={status === 'loading'}
                className="w-full p-3 text-base border border-gray-300 dark:border-gray-600 bg-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl transition duration-200 resize-y min-h-[120px] placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="cursor-pointer w-full sm:w-auto px-10 py-6 h-auto bg-linear-to-br from-primary to-secondary text-base text-white font-semibold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-2" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    Send Message
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Typically replies within 24 hours — no spam, ever.
              </p>
            </div>
          </form>
        )}
          </div>
          </Reveal>
        </div>
    );
}