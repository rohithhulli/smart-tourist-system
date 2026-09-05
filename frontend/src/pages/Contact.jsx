import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Compass, Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <PageHeader
        eyebrow="Traveller Support"
        title="Contact Tourist Support"
        subtitle="Have questions regarding itinerary recommendations, guides or regional travel assistance?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 text-safari-300">
            <MessageSquare className="w-5 h-5" />
            <h2 className="font-display font-semibold text-xl text-white">Send Us a Message</h2>
          </div>

          {submitted ? (
            <div className="p-8 bg-safari-500/10 border border-safari-500/30 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-safari-400 mx-auto" />
              <h3 className="font-display font-semibold text-white text-lg">Inquiry Received</h3>
              <p className="text-xs text-cream/70 leading-relaxed">
                Thank you for reaching out. Our ExploreIndiaAI travel assistance team will respond to your email promptly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-cream/70 font-semibold uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-ink-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-safari-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-cream/70 font-semibold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-ink-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-safari-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-cream/70 font-semibold uppercase tracking-wider">Your Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help your Karnataka travel experience?"
                  className="w-full bg-ink-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-safari-400 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-safari-600 hover:bg-safari-500 text-white font-bold text-xs rounded-full shadow-xl shadow-safari-900/40 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Helpline Details */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-xl text-white">
              Karnataka Tourist Helpline
            </h2>
            <p className="text-xs text-cream/65 leading-relaxed">
              Official travel helpline and regional support centers for tourists exploring Karnataka.
            </p>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <MapPin className="w-5 h-5 text-safari-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Karnataka Tourism Hub Center</p>
                  <p className="text-cream/55 mt-0.5">Kasturba Road, Bengaluru, Karnataka 560001</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <Phone className="w-5 h-5 text-sunset-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">24/7 Tourist Helpline</p>
                  <p className="text-cream/55 mt-0.5">+91 1800-425-4646 (Toll Free)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <Mail className="w-5 h-5 text-clay-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Inquiries</p>
                  <p className="text-cream/55 mt-0.5">support@exploreindia.ai</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-safari-500/10 border border-safari-500/20 text-xs text-safari-300 flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Emergency tourist medical and police assistance is available 24/7.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
