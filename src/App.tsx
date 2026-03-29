/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { 
  Type, 
  Link, 
  Phone, 
  MessageSquare, 
  User, 
  Wifi, 
  Mail, 
  Download, 
  RefreshCw,
  Check,
  ChevronRight,
  Home as HomeIcon,
  AlertCircle,
  Utensils,
  Briefcase,
  Pencil,
  QrCode
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { HexColorPicker } from 'react-colorful';

type ContentType = 'Text' | 'URL' | 'Phone' | 'SMS' | 'vCard' | 'WiFi' | 'Email';

interface QRSettings {
  type: ContentType;
  size: number;
  bgColor: string;
  fgColor: string;
  // Specific fields
  text: string;
  url: string;
  phone: string;
  smsPhone: string;
  smsMessage: string;
  emailRecipient: string;
  emailSubject: string;
  emailBody: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: 'WPA' | 'WEP' | 'nopass';
  vCardName: string;
  vCardPhone: string;
  vCardEmail: string;
  vCardOrg: string;
  vCardTitle: string;
  vCardUrl: string;
}

function ColorPicker({ color, onChange, label }: { color: string; onChange: (color: string) => void; label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceBelow < 320 ? 'top' : 'bottom');
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="space-y-3 relative" ref={triggerRef}>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</label>
      <div className="flex items-center p-1 gap-2 rounded-xl border border-slate-200 focus-within:border-primary/50 transition-all">
        <div className="relative shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center group relative overflow-hidden transition-all cursor-pointer rounded-lg"
            style={{ backgroundColor: color }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            <Pencil size={16} className={cn(
              "relative z-10 transition-colors",
              color.toLowerCase() === '#ffffff' ? "text-slate-800" : "text-white"
            )} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: position === 'bottom' ? 10 : -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: position === 'bottom' ? 10 : -10, scale: 0.95 }}
                className={cn(
                  "absolute z-50 left-0 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 space-y-4 min-w-[240px]",
                  position === 'bottom' ? "top-full mt-2" : "bottom-full mb-2"
                )}
              >
                <div className="custom-color-picker origin-top-left">
                  <HexColorPicker color={color} onChange={onChange} />
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {['#000000', '#ffffff', '#7D2AE8', '#07B9CE', '#3969E7', '#F27D26', '#E11D48', '#10B981', '#F59E0B', '#6366F1', '#D946EF', '#8B5CF6'].map((c) => (
                    <button
                      key={c}
                      onClick={() => onChange(c)}
                      className="w-full aspect-square rounded-md border border-slate-100 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <div 
                    className="w-8 h-8 rounded-full border border-slate-100 shadow-sm shrink-0" 
                    style={{ backgroundColor: color }} 
                  />
                  <input 
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('#') && val.length <= 7) {
                        onChange(val);
                      }
                    }}
                    className="flex-1 text-xs font-mono font-black text-slate-900 uppercase bg-slate-50 p-2 rounded-lg border-none outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input 
          type="text"
          value={color}
          onChange={(e) => {
            const val = e.target.value;
            if (val.startsWith('#') && val.length <= 7) {
              onChange(val);
            }
          }}
          className="flex-1 text-base font-mono font-bold text-slate-700 uppercase bg-transparent px-2 py-2 outline-none transition-all"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center gap-4 text-left group"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 group-hover:text-primary shrink-0"
        >
          <ChevronRight size={24} />
        </motion.div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
          {question}
        </h3>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 pl-10 text-slate-600 text-lg leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <AlertCircle size={120} className="text-primary relative" />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-slate-900 tracking-tight">404</h1>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Page Not Found</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back to generating some QR codes.
          </p>
        </div>
        <RouterLink 
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20"
        >
          <HomeIcon size={20} />
          Back to Home
        </RouterLink>
      </motion.div>
    </div>
  );
}

function Home() {
  const [settings, setSettings] = useState<QRSettings>({
    type: 'URL',
    size: 300,
    bgColor: '#ffffff',
    fgColor: '#000000',
    text: '',
    url: '',
    phone: '',
    smsPhone: '',
    smsMessage: '',
    emailRecipient: '',
    emailSubject: '',
    emailBody: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    vCardName: '',
    vCardPhone: '',
    vCardEmail: '',
    vCardOrg: '',
    vCardTitle: '',
    vCardUrl: '',
  });
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const contentTypes: { id: ContentType; icon: React.ReactNode; label: string }[] = [
    { id: 'URL', icon: <Link size={18} />, label: 'URL' },
    { id: 'Text', icon: <Type size={18} />, label: 'Text' },
    { id: 'WiFi', icon: <Wifi size={18} />, label: 'WiFi' },
    { id: 'Email', icon: <Mail size={18} />, label: 'Email' },
    { id: 'Phone', icon: <Phone size={18} />, label: 'Phone' },
    { id: 'SMS', icon: <MessageSquare size={18} />, label: 'SMS' },
    { id: 'vCard', icon: <User size={18} />, label: 'vCard' },
  ];

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      let finalContent = '';
      
      switch (settings.type) {
        case 'URL':
          finalContent = settings.url;
          break;
        case 'Menu':
          finalContent = settings.menuUrl;
          break;
        case 'Business':
          finalContent = settings.businessUrl;
          break;
        case 'Text':
          finalContent = settings.text;
          break;
        case 'Phone':
          finalContent = settings.phone ? `tel:${settings.phone}` : '';
          break;
        case 'SMS':
          finalContent = settings.smsPhone ? `sms:${settings.smsPhone}${settings.smsMessage ? `?body=${encodeURIComponent(settings.smsMessage)}` : ''}` : '';
          break;
        case 'Email':
          if (settings.emailRecipient) {
            const params = new URLSearchParams();
            if (settings.emailSubject) params.append('subject', settings.emailSubject);
            if (settings.emailBody) params.append('body', settings.emailBody);
            const query = params.toString();
            finalContent = `mailto:${settings.emailRecipient}${query ? `?${query}` : ''}`;
          }
          break;
        case 'WiFi':
          if (settings.wifiSsid) {
            finalContent = `WIFI:S:${settings.wifiSsid};T:${settings.wifiEncryption};P:${settings.wifiPassword};;`;
          }
          break;
        case 'vCard':
          if (settings.vCardName) {
            finalContent = `BEGIN:VCARD\nVERSION:3.0\nN:${settings.vCardName}\nORG:${settings.vCardOrg}\nTITLE:${settings.vCardTitle}\nTEL:${settings.vCardPhone}\nEMAIL:${settings.vCardEmail}\nURL:${settings.vCardUrl}\nEND:VCARD`;
          }
          break;
        default:
          finalContent = '';
      }

      if (!finalContent) {
        setQrDataUrl('');
        return;
      }

      const url = await QRCode.toDataURL(finalContent, {
        width: settings.size,
        margin: 2,
        color: {
          dark: settings.fgColor,
          light: settings.bgColor,
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQRCode();
    }, 300);
    return () => clearTimeout(timer);
  }, [settings]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `free-qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section with Gradient */}
      <div className="bg-hero-gradient pt-24 pb-40 text-left text-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-6 tracking-tight"
          >
            Free <span className="text-white">QR Code</span> Generator
          </motion.h1>
          <p className="text-white/90 max-w-3xl text-xl md:text-2xl font-medium mb-10">
            Create high-resolution QR codes for free, and use them to drive online traffic to your site, share useful information and increase your sales.
          </p>
          <div className="flex flex-wrap gap-6 md:gap-10">
            {[
              "100% Free",
              "No sign up",
              "High Quality"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-lg font-bold">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Check size={14} className="text-white" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-12 -mt-24 pb-20">
        <div ref={generatorRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Content Type */}
            <section className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Content Type</h2>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSettings(prev => ({ ...prev, type: type.id }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all gap-3 group",
                      settings.type === type.id 
                        ? "border-primary bg-primary/5 text-primary shadow-md" 
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      settings.type === type.id ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:text-primary"
                    )}>
                      {type.icon}
                    </div>
                    <span className="text-xs font-bold">{type.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Content Input */}
            <section className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Enter Content</h2>
              </div>

              <div className="space-y-6">
                {settings.type === 'URL' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Website URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      value={settings.url}
                      onChange={(e) => setSettings(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                    />
                  </div>
                )}

                {settings.type === 'Text' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Enter Text</label>
                    <textarea
                      value={settings.text}
                      onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Add your text here..."
                      className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all min-h-[180px] resize-none text-lg font-medium"
                    />
                  </div>
                )}

                {settings.type === 'Phone' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+1 234 567 890"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                    />
                  </div>
                )}

                {settings.type === 'SMS' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+1 234 567 890"
                        value={settings.smsPhone}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsPhone: e.target.value }))}
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Message</label>
                      <textarea
                        value={settings.smsMessage}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsMessage: e.target.value }))}
                        placeholder="Enter your SMS message..."
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all min-h-[120px] resize-none text-lg font-medium"
                      />
                    </div>
                  </div>
                )}

                {settings.type === 'Email' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="hello@example.com"
                        value={settings.emailRecipient}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailRecipient: e.target.value }))}
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Subject Line</label>
                      <input 
                        type="text" 
                        placeholder="Inquiry about services"
                        value={settings.emailSubject}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailSubject: e.target.value }))}
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Message Body</label>
                      <textarea
                        value={settings.emailBody}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailBody: e.target.value }))}
                        placeholder="Write your email content here..."
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all min-h-[120px] resize-none text-lg font-medium"
                      />
                    </div>
                  </div>
                )}

                {settings.type === 'WiFi' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Network Name (SSID)</label>
                      <input 
                        type="text" 
                        placeholder="My Home WiFi"
                        value={settings.wifiSsid}
                        onChange={(e) => setSettings(prev => ({ ...prev, wifiSsid: e.target.value }))}
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Password</label>
                      <input 
                        type="text" 
                        placeholder="WiFi Password"
                        value={settings.wifiPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, wifiPassword: e.target.value }))}
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 tracking-tight">Encryption Type</label>
                      <select 
                        value={settings.wifiEncryption}
                        onChange={(e) => setSettings(prev => ({ ...prev, wifiEncryption: e.target.value as any }))}
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium bg-white"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                )}

                {settings.type === 'vCard' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          value={settings.vCardName}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardName: e.target.value }))}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Phone</label>
                        <input 
                          type="tel" 
                          placeholder="+1 234 567 890"
                          value={settings.vCardPhone}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardPhone: e.target.value }))}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Email</label>
                        <input 
                          type="email" 
                          placeholder="john@example.com"
                          value={settings.vCardEmail}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardEmail: e.target.value }))}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Website</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com"
                          value={settings.vCardUrl}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardUrl: e.target.value }))}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Company</label>
                        <input 
                          type="text" 
                          placeholder="Company Name"
                          value={settings.vCardOrg}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardOrg: e.target.value }))}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 tracking-tight">Job Title</label>
                        <input 
                          type="text" 
                          placeholder="Software Engineer"
                          value={settings.vCardTitle}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardTitle: e.target.value }))}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: Customization */}
            <section className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Choose Colors & Size</h2>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-700 tracking-tight">Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ColorPicker 
                      label="Background" 
                      color={settings.bgColor} 
                      onChange={(color) => setSettings(prev => ({ ...prev, bgColor: color }))} 
                    />
                    <ColorPicker 
                      label="Dot Color" 
                      color={settings.fgColor} 
                      onChange={(color) => setSettings(prev => ({ ...prev, fgColor: color }))} 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-700 tracking-tight">Select Size</h3>
                  <div className="space-y-6">
                    <input 
                      type="range" 
                      min="100" 
                      max="1000" 
                      step="50"
                      value={settings.size}
                      onChange={(e) => setSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400 tracking-tight">
                      <span>100px</span>
                      <span className="text-primary text-lg">{settings.size}px</span>
                      <span>1000px</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-100 text-center space-y-6 md:space-y-10">
                <div className="space-y-2 md:space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Preview</h2>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-8 bg-primary/5 rounded-3xl blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
                  <div className="relative bg-white p-6 md:p-10 rounded-3xl shadow-inner border border-slate-50 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                    <AnimatePresence mode="wait">
                      {qrDataUrl ? (
                        <motion.div
                          key="qr"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative"
                        >
                          <img 
                            src={qrDataUrl} 
                            alt="QR Code Preview" 
                            className="max-w-full h-auto rounded-2xl shadow-2xl"
                          />
                          {isGenerating && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] flex items-center justify-center rounded-2xl">
                              <RefreshCw className="animate-spin text-primary" size={64} />
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-slate-100 flex flex-col items-center"
                        >
                          <QrCode size={180} className="text-slate-100 opacity-40" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <button
                    disabled={!qrDataUrl}
                    onClick={handleDownload}
                    className={cn(
                      "w-full py-3 md:py-6 rounded-3xl font-black text-xl md:text-2xl flex items-center justify-center gap-3 transition-all shadow-2xl",
                      qrDataUrl 
                        ? "bg-primary text-white hover:bg-[#6b24c7] shadow-primary/30 hover:shadow-primary/40 active:scale-[0.96]" 
                        : "bg-slate-100 text-slate-200 cursor-not-allowed"
                    )}
                  >
                    <Download size={24} />
                    Download Free QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Frequently Asked Questions section */}
        <section className="mt-40 space-y-20 max-w-[1200px] mx-auto px-4 md:px-12">
          <div className="text-left space-y-6 mb-20">
            <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-xl font-medium">Everything you need to know about QR codes and how to use them effectively.</p>
          </div>

          <div className="space-y-4">
            <FAQItem question="Why use our Free QR Code Generator?">
              <div className="space-y-6">
                <p>Our tool is built with three core principles in mind to provide the best experience for our users:</p>
                <ol className="list-decimal pl-5 space-y-4">
                  <li className="text-slate-600">
                    <strong className="text-slate-900">No Sign Up:</strong> Start generating immediately. We don't ask for your email or personal data. Privacy is our priority.
                  </li>
                  <li className="text-slate-600">
                    <strong className="text-slate-900">No Subscription:</strong> Our tool is 100% free forever. No monthly fees or hidden costs for high-res downloads.
                  </li>
                  <li className="text-slate-600">
                    <strong className="text-slate-900">High Quality:</strong> Download professional-grade QR codes suitable for print, business cards, and digital displays.
                  </li>
                </ol>
              </div>
            </FAQItem>

            <FAQItem question="What is a QR code?">
              <p>
                A QR code (Quick Response code) is a type of matrix barcode first designed in 1994 for the automotive industry in Japan. 
                It's a machine-readable optical label that contains information about the item to which it is attached. 
                Unlike standard barcodes, QR codes can store significantly more data and can be scanned from any direction.
              </p>
            </FAQItem>

            <FAQItem question="Benefits of using QR codes">
              <ul className="list-disc pl-5 space-y-2">
                <li>Instant access to information without typing</li>
                <li>High data capacity for URLs, text, and contact info</li>
                <li>Extremely durable and scannable even when damaged</li>
                <li>Cost-effective marketing and tracking tool</li>
                <li>Seamless bridge between physical and digital worlds</li>
              </ul>
            </FAQItem>

            <FAQItem question="Ways to use QR codes in your business">
              <div className="space-y-4">
                <p>QR codes offer versatile solutions across various business functions:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Marketing:</strong> Add to flyers, posters, and billboards for instant website visits.</li>
                  <li><strong>Menus:</strong> Contactless digital menus for restaurants and cafes.</li>
                  <li><strong>Payments:</strong> Fast and secure mobile payments at checkout.</li>
                  <li><strong>Networking:</strong> Digital business cards (vCards) for instant contact saving.</li>
                </ul>
              </div>
            </FAQItem>

            <FAQItem question="How to scan a QR code">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open your smartphone's camera app or a dedicated QR scanner.</li>
                <li>Point the camera at the QR code so it's clearly visible on the screen.</li>
                <li>Tap the notification that appears to open the link or view the content.</li>
              </ol>
            </FAQItem>
          </div>
        </section>

        {/* Callout Section */}
        <section className="mt-40">
          <div className="bg-hero-gradient p-12 md:p-24 rounded-3xl text-center text-white space-y-10 shadow-2xl shadow-primary/20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">Ready to get started?</h2>
            <p className="text-white/80 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
              Create your professional QR code in less than 30 seconds. No strings attached.
            </p>
            <button 
              onClick={scrollToGenerator}
              className="bg-white text-primary px-8 py-4 md:px-12 md:py-6 rounded-3xl font-black text-xl md:text-2xl hover:scale-105 transition-transform shadow-xl active:scale-95"
            >
              Create QR code for free
            </button>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-20 px-4 md:px-12 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-black font-medium text-left">
          <p>© {new Date().getFullYear()} Free QR Code Generator. All rights reserved.</p>
          <p>
            Created by{" "}
            <a 
              href="https://gbemisolaoyeniyi.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Gbemisola
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
