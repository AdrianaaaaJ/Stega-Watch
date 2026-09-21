"use client";

import { useRef, useState } from "react";
import { Activity, BarChart3, Download, Eye, FileImage, KeyRound, LockKeyhole, ScanLine, ShieldCheck, Upload } from "lucide-react";

declare global { interface Window { gtag?: (...args: unknown[]) => void } }

export default function Home() {
  const [view, setView] = useState<"workspace" | "activity">("workspace");
  const [mode, setMode] = useState<"hide" | "reveal">("hide");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const pick = (picked?: File) => {
    if (picked?.type.startsWith("image/")) { setFile(picked); setNotice(""); }
    else if (picked) setNotice("Please choose a PNG, JPG, or WebP image.");
  };

  const run = async () => {
    if (!file) return setNotice("Choose an image first.");
    if (mode === "hide" && !message.trim()) return setNotice("Write a message to hide first.");
    const image = new Image(); image.src = URL.createObjectURL(file);
    await new Promise(resolve => image.onload = resolve);
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    if (mode === "hide") {
      const bytes = new TextEncoder().encode(`STGW|${key}|${message}\0`);
      if (bytes.length * 8 > data.data.length / 4 * 3) return setNotice("This message is too large for that image. Try a larger PNG.");
      let n = 0;
      for (const byte of bytes) for (let bit = 7; bit >= 0; bit--) { const pixel = Math.floor(n / 3) * 4 + n % 3; data.data[pixel] = (data.data[pixel] & 254) | ((byte >> bit) & 1); n++; }
      context.putImageData(data, 0, 0);
      const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = `stega-${file.name.replace(/\.[^.]+$/, "")}.png`; link.click();
      window.gtag?.("event", "stega_encode"); setNotice("Encoded! Your PNG download has started.");
    } else {
      let bits = "", output = "";
      for (let i = 0; i < data.data.length; i += 4) for (let channel = 0; channel < 3; channel++) { bits += data.data[i + channel] & 1; if (bits.length === 8) { const char = String.fromCharCode(parseInt(bits, 2)); if (char === "\0") { const parts = output.split("|"); window.gtag?.("event", "stega_scan"); return setNotice(parts[0] === "STGW" ? `Hidden message: ${parts.slice(2).join("|") || "(empty)"}` : "No compatible message found."); } output += char; bits = ""; } }
      window.gtag?.("event", "stega_scan"); setNotice("No compatible message found.");
    }
  };

  const showWorkspace = () => { setView("workspace"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <main className="min-h-screen overflow-x-hidden bg-[#080a1d] text-[#eef2ff]">
    <div className="pointer-events-none fixed inset-0 arcade-grid opacity-40" />
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d25]/95 px-5 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <button onClick={showWorkspace} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff3cac] text-[#080a1d] shadow-[0_0_22px_#ff3cac]"><Eye size={22}/></span><span className="text-left"><b className="block font-mono text-lg">STEGA_WHAT</b><small className="font-mono text-[10px] tracking-[.2em] text-cyan-300">SIGNAL LAB</small></span></button>
        <nav className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] p-1 font-mono text-xs md:flex">
          <button onClick={showWorkspace} className={`nav-item ${view === "workspace" ? "nav-on" : ""}`}>WORKSPACE</button>
          <button onClick={() => setView("activity")} className={`nav-item ${view === "activity" ? "nav-on" : ""}`}>ACTIVITY</button>
        </nav>
        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 font-mono text-[11px] text-emerald-300"><i className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300"/>SYSTEM READY</span>
      </div>
      <nav className="mx-auto mt-3 flex max-w-7xl gap-2 font-mono text-[11px] md:hidden"><button onClick={showWorkspace} className={`nav-item flex-1 ${view === "workspace" ? "nav-on" : ""}`}>WORKSPACE</button><button onClick={() => setView("activity")} className={`nav-item flex-1 ${view === "activity" ? "nav-on" : ""}`}>ACTIVITY</button></nav>
    </header>

    {view === "workspace" ? <>
      <section className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <div className="mb-9 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div><div className="mb-4 flex items-center gap-3"><span className="h-px w-10 bg-cyan-300"/><p className="font-mono text-xs tracking-[.22em] text-cyan-300">PRIVATE IMAGE STEGANOGRAPHY</p></div><h1 className="max-w-3xl text-4xl font-black leading-[.95] tracking-[-.04em] sm:text-6xl">Hide the message.<br/><span className="text-[#ff3cac]">Keep the signal.</span></h1></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-base font-semibold text-white">One image. One hidden conversation.</p><p className="mt-2 text-sm leading-6 text-slate-400">Encode a private note or inspect an image for a compatible payload. Processing happens locally in your browser.</p></div>
        </div>

        <section className="panel overflow-hidden rounded-2xl border border-white/10">
          <div className="flex border-b border-white/10 p-2"><button onClick={() => { setMode("hide"); setNotice(""); }} className={`tab ${mode === "hide" ? "tab-on" : ""}`}><LockKeyhole size={16}/> HIDE A MESSAGE</button><button onClick={() => { setMode("reveal"); setNotice(""); }} className={`tab ${mode === "reveal" ? "tab-on" : ""}`}><ScanLine size={16}/> REVEAL A MESSAGE</button></div>
          <div className="grid items-stretch gap-6 p-5 sm:p-7 md:grid-cols-2">
            <div className="flex flex-col"><label className="label mb-3 block">01 / CARRIER IMAGE</label><button onClick={() => input.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); pick(event.dataTransfer.files[0]); }} className="dropzone h-56 w-full flex-1"><Upload size={28} className="text-cyan-300"/><b>{file ? file.name : "Drop an image here"}</b><span>{file ? `${Math.ceil(file.size / 1024)} KB ready` : "or select a PNG, JPG, or WebP"}</span></button><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => pick(event.target.files?.[0])}/></div>
            <div className="flex flex-col"><label className="label mb-3 block">02 / {mode === "hide" ? "SECRET MESSAGE" : "SCAN STATUS"}</label>{mode === "hide" ? <><textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={1000} className="field h-56 resize-none" placeholder="Type what only your recipient should know…"/><span className="mt-2 text-right font-mono text-[11px] text-slate-500">{message.length}/1000</span></> : <div className="flex h-56 flex-col justify-center rounded-xl border border-dashed border-white/10 bg-white/[.025] p-7 text-sm leading-6 text-slate-400"><ScanLine className="mb-4 text-[#ff3cac]"/><b className="block text-base text-slate-200">Ready to inspect</b><span className="mt-2">We’ll look for a compatible embedded message in your selected image.</span></div>}</div>
            <div className="md:col-span-2"><label className="label block">03 / OPTIONAL PASSPHRASE</label><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"><div className="relative"><KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input value={key} onChange={event => setKey(event.target.value)} className="field w-full !pl-12" placeholder="Add a key for your recipient" type="password"/></div><button onClick={run} className="arcade-btn min-h-11 px-6">{mode === "hide" ? <><Download size={17}/> ENCODE IMAGE</> : <><ScanLine size={17}/> SCAN IMAGE</>}</button></div>{notice && <p aria-live="polite" className="mt-3 text-sm text-cyan-200">{notice}</p>}</div>
          </div>
        </section>
      </section>
      <section id="privacy" className="relative border-y border-white/10 bg-[#101438] px-5 py-9 sm:px-8"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3"><div><p className="label">BUILT FOR DISCRETION</p><h2 className="mt-3 text-2xl font-bold">Clear controls, quiet handling.</h2></div><div className="info"><ShieldCheck className="text-emerald-300"/><b>Privacy first</b><span>Your image and message are processed locally in the browser.</span></div><div className="info"><FileImage className="text-cyan-300"/><b>Best results</b><span>PNG images preserve embedded pixel-level information most reliably.</span></div></div></section>
    </> : <section className="relative mx-auto min-h-[calc(100vh-82px)] max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="mb-10 max-w-3xl">
        <div className="mb-4 flex items-center gap-3"><span className="h-px w-10 bg-[#ff3cac]"/><p className="font-mono text-xs tracking-[.22em] text-[#ff3cac]">ACTIVITY MONITOR</p></div>
        <h1 className="text-4xl font-black leading-[.95] tracking-[-.04em] sm:text-6xl">Signals are live.<br/><span className="text-cyan-300">Privacy stays intact.</span></h1>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-400">A simple view of how visitors use Stega_What. Images, hidden messages, and passphrases always remain private.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <article className="panel rounded-2xl border border-white/10 p-6"><BarChart3 className="mb-8 text-[#ff3cac]"/><p className="label">PAGE VIEWS</p><strong className="my-3 block text-2xl">Visitor activity</strong><p className="text-sm leading-6 text-slate-500">See how many people visit Stega_What over time.</p></article>
        <article className="panel rounded-2xl border border-white/10 p-6"><Download className="mb-8 text-cyan-300"/><p className="label">ENCODE</p><strong className="my-3 block text-2xl">Encoding activity</strong><p className="text-sm leading-6 text-slate-500">Monitor how often visitors create encoded images.</p></article>
        <article className="panel rounded-2xl border border-white/10 p-6"><Activity className="mb-8 text-emerald-300"/><p className="label">DECODE</p><strong className="my-3 block text-2xl">Scanning activity</strong><p className="text-sm leading-6 text-slate-500">Monitor how often visitors scan images for messages.</p></article>
      </div>
    </section>}
    <footer className="relative mx-auto flex max-w-7xl justify-between px-5 py-7 font-mono text-[11px] text-slate-500 sm:px-8"><span>STEGA_WHAT / SIGNAL LAB</span><span>USE RESPONSIBLY · 2026</span></footer>
  </main>;
}
