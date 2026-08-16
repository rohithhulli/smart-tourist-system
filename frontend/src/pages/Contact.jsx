import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Mail className="w-4 h-4" /> Help & Contact
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Contact Tourist Support</h1>
        <p className="text-xs text-slate-400 mt-0.5">Have questions regarding trip recommendations or local guide assistance?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" /> Send Us a Message
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-300">Our Karnataka Tourist AI assistance team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help your Karnataka travel experience?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Inquiry
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <h2 className="font-bold text-lg text-white">Karnataka Tourist AI Helpline</h2>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Karnataka Tourism Hub Center</p>
                <p className="text-slate-400">Kasturba Road, Bengaluru, Karnataka 560001</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">24/7 Tourist Helpline</p>
                <p className="text-slate-400">+91 1800-425-4646 (Toll Free)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <Mail className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Email Support</p>
                <p className="text-slate-400">support@smarttouristkarnataka.ai</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
