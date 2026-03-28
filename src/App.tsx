/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Type, 
  Link, 
  Phone, 
  MessageSquare, 
  User, 
  Image as ImageIcon, 
  FileText, 
  Wifi, 
  Mail, 
  Download, 
  RefreshCw,
  Check,
  ChevronRight
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ContentType = 'Text' | 'URL' | 'Phone' | 'SMS' | 'vCard' | 'Image' | 'PDF' | 'WiFi' | 'Email';

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

export default function App() {
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

  const contentTypes: { id: ContentType; icon: React.ReactNode; label: string }[] = [
    { id: 'Text', icon: <Type size={18} />, label: 'Text' },
    { id: 'URL', icon: <Link size={18} />, label: 'URL' },
    { id: 'Phone', icon: <Phone size={18} />, label: 'Phone' },
    { id: 'SMS', icon: <MessageSquare size={18} />, label: 'SMS' },
    { id: 'vCard', icon: <User size={18} />, label: 'vCard' },
    { id: 'Image', icon: <ImageIcon size={18} />, label: 'Image' },
    { id: 'PDF', icon: <FileText size={18} />, label: 'PDF' },
    { id: 'WiFi', icon: <Wifi size={18} />, label: 'WiFi' },
    { id: 'Email', icon: <Mail size={18} />, label: 'Email' },
  ];

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      let finalContent = '';
      
      switch (settings.type) {
        case 'URL':
          finalContent = settings.url;
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

  const scrollToGenerator = () => {
    const element = document.getElementById('generator-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section with Gradient */}
      <div className="bg-hero-gradient pt-24 pb-40 text-left text-white">
        <div className="max-w-[1200px] mx-auto px-8 md:px-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-6"
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

      <main className="max-w-[1200px] mx-auto px-8 md:px-12 -mt-24 pb-20">
        <div id="generator-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Content Type */}
            <section className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Select Content Type</h2>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSettings(prev => ({ ...prev, type: type.id }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-[32px] border-2 transition-all gap-3 group",
                      settings.type === type.id 
                        ? "border-primary bg-primary/5 text-primary shadow-md" 
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
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
            <section className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Enter Content</h2>
              </div>

              <div className="space-y-6">
                {settings.type === 'URL' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Website URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      value={settings.url}
                      onChange={(e) => setSettings(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                    />
                  </div>
                )}

                {settings.type === 'Text' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Enter Text</label>
                    <textarea
                      value={settings.text}
                      onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Add your text here..."
                      className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all min-h-[180px] resize-none text-lg font-medium"
                    />
                  </div>
                )}

                {settings.type === 'Phone' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+1 234 567 890"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                    />
                  </div>
                )}

                {settings.type === 'SMS' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+1 234 567 890"
                        value={settings.smsPhone}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsPhone: e.target.value }))}
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Message</label>
                      <textarea
                        value={settings.smsMessage}
                        onChange={(e) => setSettings(prev => ({ ...prev, smsMessage: e.target.value }))}
                        placeholder="Enter your SMS message..."
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all min-h-[120px] resize-none text-lg font-medium"
                      />
                    </div>
                  </div>
                )}

                {settings.type === 'Email' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="hello@example.com"
                        value={settings.emailRecipient}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailRecipient: e.target.value }))}
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Subject Line</label>
                      <input 
                        type="text" 
                        placeholder="Inquiry about services"
                        value={settings.emailSubject}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailSubject: e.target.value }))}
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Message Body</label>
                      <textarea
                        value={settings.emailBody}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailBody: e.target.value }))}
                        placeholder="Write your email content here..."
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all min-h-[120px] resize-none text-lg font-medium"
                      />
                    </div>
                  </div>
                )}

                {settings.type === 'WiFi' && (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Network Name (SSID)</label>
                      <input 
                        type="text" 
                        placeholder="My Home WiFi"
                        value={settings.wifiSsid}
                        onChange={(e) => setSettings(prev => ({ ...prev, wifiSsid: e.target.value }))}
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Password</label>
                      <input 
                        type="text" 
                        placeholder="WiFi Password"
                        value={settings.wifiPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, wifiPassword: e.target.value }))}
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Encryption Type</label>
                      <select 
                        value={settings.wifiEncryption}
                        onChange={(e) => setSettings(prev => ({ ...prev, wifiEncryption: e.target.value as any }))}
                        className="w-full p-6 rounded-[24px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-lg font-medium bg-white"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                )}

                {settings.type === 'vCard' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe"
                          value={settings.vCardName}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardName: e.target.value }))}
                          className="w-full p-4 rounded-[16px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="+1 234 567 890"
                          value={settings.vCardPhone}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardPhone: e.target.value }))}
                          className="w-full p-4 rounded-[16px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="john@example.com"
                          value={settings.vCardEmail}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardEmail: e.target.value }))}
                          className="w-full p-4 rounded-[16px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Website</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com"
                          value={settings.vCardUrl}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardUrl: e.target.value }))}
                          className="w-full p-4 rounded-[16px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Company</label>
                        <input 
                          type="text" 
                          placeholder="Company Name"
                          value={settings.vCardOrg}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardOrg: e.target.value }))}
                          className="w-full p-4 rounded-[16px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Job Title</label>
                        <input 
                          type="text" 
                          placeholder="Software Engineer"
                          value={settings.vCardTitle}
                          onChange={(e) => setSettings(prev => ({ ...prev, vCardTitle: e.target.value }))}
                          className="w-full p-4 rounded-[16px] border-2 border-slate-100 focus:border-primary outline-none transition-all text-base font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(settings.type === 'Image' || settings.type === 'PDF') && (
                  <div className="p-12 border-4 border-dashed border-slate-100 rounded-[32px] text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      {settings.type === 'Image' ? <ImageIcon size={32} /> : <FileText size={32} />}
                    </div>
                    <p className="text-slate-400 font-medium">File upload coming soon. For now, please use a URL to your file.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: Customization */}
            <section className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Choose Colors & Size</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-700">Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Background Color */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-400">Background</label>
                      <div className="flex items-center gap-4 bg-slate-50 p-2 pr-4 rounded-full border-2 border-slate-100 hover:border-primary/20 transition-colors group">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          <input 
                            type="color" 
                            value={settings.bgColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-none p-0"
                          />
                        </div>
                        <span className="text-sm font-mono font-black text-slate-600 uppercase flex-1">{settings.bgColor}</span>
                      </div>
                    </div>

                    {/* Dot Color */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-400">Dot Color</label>
                      <div className="flex items-center gap-4 bg-slate-50 p-2 pr-4 rounded-full border-2 border-slate-100 hover:border-primary/20 transition-colors group">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          <input 
                            type="color" 
                            value={settings.fgColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, fgColor: e.target.value }))}
                            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-none p-0"
                          />
                        </div>
                        <span className="text-sm font-mono font-black text-slate-600 uppercase flex-1">{settings.fgColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-700">Select Size</h3>
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
                    <div className="flex justify-between text-xs font-bold text-slate-400">
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
              <div className="bg-white p-10 rounded-[56px] shadow-2xl border border-slate-100 text-center space-y-10">
                <div className="space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Preview</h2>
                  <p className="text-slate-400 font-bold text-xs">Ready for instant download</p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-8 bg-primary/5 rounded-[80px] blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
                  <div className="relative bg-white p-10 rounded-[64px] shadow-inner border border-slate-50 flex items-center justify-center min-h-[400px]">
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
                            className="max-w-full h-auto rounded-3xl shadow-2xl"
                          />
                          {isGenerating && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] flex items-center justify-center rounded-3xl">
                              <RefreshCw className="animate-spin text-primary" size={64} />
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-slate-100 flex flex-col items-center gap-8"
                        >
                          <div className="w-64 h-64 border-4 border-dashed border-slate-50 rounded-[56px] flex items-center justify-center">
                            <ImageIcon size={80} />
                          </div>
                          <p className="text-xl font-black">Preview</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-6">
                  <button
                    disabled={!qrDataUrl}
                    onClick={handleDownload}
                    className={cn(
                      "w-full py-6 rounded-[32px] font-black text-2xl flex items-center justify-center gap-4 transition-all shadow-2xl",
                      qrDataUrl 
                        ? "bg-primary text-white hover:bg-[#6b24c7] shadow-primary/30 hover:shadow-primary/40 active:scale-[0.96]" 
                        : "bg-slate-100 text-slate-200 cursor-not-allowed"
                    )}
                  >
                    <Download size={28} />
                    Download Free QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Why use section */}
        <section className="mt-40 max-w-[1200px] mx-auto text-center space-y-20 px-8 md:px-12">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Why use our Free QR Code Generator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-10 rounded-[48px] bg-white shadow-xl border border-slate-50 space-y-6 text-left group hover:bg-primary transition-colors duration-500">
              <div className="text-6xl font-black text-primary/10 group-hover:text-white/20 transition-colors">01</div>
              <h3 className="font-black text-2xl group-hover:text-white transition-colors">No Sign Up</h3>
              <p className="text-slate-500 group-hover:text-white/80 transition-colors leading-relaxed">Start generating immediately. We don't ask for your email or personal data. Privacy is our priority.</p>
            </div>
            <div className="p-10 rounded-[48px] bg-white shadow-xl border border-slate-50 space-y-6 text-left group hover:bg-primary transition-colors duration-500">
              <div className="text-6xl font-black text-primary/10 group-hover:text-white/20 transition-colors">02</div>
              <h3 className="font-black text-2xl group-hover:text-white transition-colors">No Subscription</h3>
              <p className="text-slate-500 group-hover:text-white/80 transition-colors leading-relaxed">Our tool is 100% free forever. No monthly fees or hidden costs for high-res downloads.</p>
            </div>
            <div className="p-10 rounded-[48px] bg-white shadow-xl border border-slate-100 space-y-6 text-left group hover:bg-primary transition-colors duration-500">
              <div className="text-6xl font-black text-primary/10 group-hover:text-white/20 transition-colors">03</div>
              <h3 className="font-black text-2xl group-hover:text-white transition-colors">High Quality</h3>
              <p className="text-slate-500 group-hover:text-white/80 transition-colors leading-relaxed">Download professional-grade QR codes suitable for print, business cards, and digital displays.</p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions section */}
        <section className="mt-40 space-y-20 max-w-[1200px] mx-auto px-8 md:px-12">
          <div className="text-left space-y-6 mb-20">
            <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-xl font-medium">Everything you need to know about QR codes and how to use them effectively.</p>
          </div>

          <div className="space-y-4">
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
          <div className="bg-hero-gradient p-12 md:p-24 rounded-[64px] text-center text-white space-y-10 shadow-2xl shadow-primary/20">
            <h2 className="text-5xl md:text-7xl font-black">Ready to get started?</h2>
            <p className="text-white/80 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
              Create your professional QR code in less than 30 seconds. No strings attached.
            </p>
            <button 
              onClick={scrollToGenerator}
              className="bg-white text-primary px-12 py-6 rounded-[32px] font-black text-2xl hover:scale-105 transition-transform shadow-xl active:scale-95"
            >
              Create QR code for free
            </button>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-20 px-8 md:px-12 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-black font-medium">
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
