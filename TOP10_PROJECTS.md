# VoltHacks 2026 — Phase 0 intake + 10 win-shaped projects

**Account (Safari, 2026-09-02):** VITALIE CERVINSCHI (`moscraciunxxx`) — registered. My projects empty.  
**Deadline:** Sep 5, 2026 @ 2:00pm PDT (3 days). Judging Sep 6–15. Winners Sep 16.  
**Official listing:** https://volthacks.devpost.com/  
**Rules:** https://volthacks.devpost.com/rules  
**Local tree:** this folder was empty at intake. Sibling inventory in §4.

This is **not** a Kaggle/Zindi metric contest. There is no `submission.csv`. The upload pack is a Devpost software page + public GitHub + demo video + hosted ten-second try.

---

## 1. Problem restatement

Build a **hardware, IoT, AI, or combined** project that interacts with the physical world (sensors, embedded, automation, intelligent devices) **or** a software/digital-twin stand-in that judges can operate. Tracks named on the hero: Robotics & Embedded, AI + Hardware, Smart Health, Sustainability & Smart Cities, Open Innovation, “anything engineering with impact.”

Software-only is explicitly allowed. Organizer resources suggest Arduino / Pi / Python / TensorFlow / Fusion 360 — they are **suggestions**, not requirements.

## 2. Metric nuances (what “wins”)

Five unweighted criteria:

1. Innovation and Creativity  
2. Technical Complexity (engineering, programming, **hardware integration**, or system design)  
3. Real World Impact  
4. Design and Functionality  
5. Presentation Quality (demo, documentation, communication)

No “Best Use of Featherless / Adaption / DevSwarm” track. Sponsor APIs do not score.  
No public gallery likes (gallery unpublished). ~50 remote judges, mostly software/ML/cloud, with a hardware-literate minority (Jabra embedded, NVIDIA ASIC, Qualcomm, Nightingale autonomy, Taher Ujjainwala, Dhiraj Patil). Founder-judge: Ehsan Sadiq (Dialogate). **Do not clone Dialogate.**

**Quote-able number on the first screen** is how this panel actually ranks cards. Chat UIs and feature-soup dashboards die.

## 3. Leakage / rules risks

| Risk | Evidence | Action |
|------|----------|--------|
| Existing-project resubmit | Rules: “Existing projects may not be submitted unless **significant new development** is completed during the event.” Window opened May 21/22 2026. | CortexLoop, Palimpsest, VOICEKEEP, Horizon, FoodLoop are **engines**, not entries. |
| Plagiarism / copy | Rules + organizer forum | Do not fork FaultForge / GridKind / VOLTGAURD and restyle. |
| Private repo | Organizer (Ehsan, ~1 month ago): **public GitHub required** | No private-share-to-email path. Strip secrets. |
| Hardware honesty | Field already has Wokwi/Fusion vapor vs real BOM | Label simulated vs physical. Never claim an ESP32 we do not have. |
| Medical / safety claims | NeoGuard-class soup; FaultForge scoped its score | Prototype language only. Number is incident-scoped. |
| Students-only widget vs open rules | Hero vs `/rules` | Confirm eligibility if you are not a student. You are already registered. |
| Hero cash vs rules cash | $35,785 / Grand $2,120 vs **$100 Grand** | Optimize for **judged ship**, not the sticker. |
| Dialogate clone | Founder is a judge; product is an interview coach | Ban list. |
| Prior contest corpses | LabSignal, Lanternwake, Lost Movement, Palimpsest card, 30972 | Do not rebuild. |

**Required pack:** name, problem, description, **demo video or presentation**, photos/screenshots, **public** source, tech/BOM list.

## 4. Data schema / local assets

No competition data files. Local folder was empty.

**Machine:** MacBook Pro M5 Max, 18 CPU / 40 GPU / 48 GB, Metal. Built-in camera + mic. No NVIDIA CUDA. **No ESP32 / Arduino / Pi firmware in the tree.**

**Reusable engines (significant new VoltHacks work required):**

| Engine | Path | Use |
|--------|------|-----|
| CortexLoop (INT8 CNN, NEON/I8MM, 33× GEMM, warehouse loop) | `/Volumes/Seagate/Coding Compete/projects/Arm Dev Post Challenge/Untitled/` | Robotics / edge AI — must add a **new** sensor door + HUD |
| VoiceBank Spark-TTS MLX | `/Users/vitaliecervinschi/VoiceBank/vitalie-cervinschi/` | Demo VO + leak-test instrument shape |
| Horizon / LastLook camera | `/Volumes/Seagate/Coding Compete/projects/LastLook/` | Health camera patterns only |
| Palimpsest on-device CV | `ML Empowerment Build Challenge 2.0/Untitled/` | Algorithms only |
| FoodLoop | `WebMCP Challenge/` | Sustainability ops only |

**Research context already open in Safari:** Quanta bioelectricity (cells use voltage to coordinate), magnetoelectric hydrogels for wireless neural stim, conductive hydrogel neural interfaces. That is a **Volt**-named, IEEE-readable lane the field is not in.

## 5. Train / test difference analog

There is no public LB. The “public slice” is the Devpost card a stranger opens in ten seconds. The “private exam” is 50+ judges in an unpublished gallery, Sep 6–15. Localhost, draft, or empty My projects = zero.

## 6. Existing code / notebooks here

None in `Volt HACKS/` at intake. Competitive field already includes (public software pages):

| Card | Shape | Lesson |
|------|-------|--------|
| [FaultForge](https://devpost.com/software/faultforge) | Warehouse fire **digital twin**, Safety Score **5 → 100**, no LLM as truth, hosted | Current bar for software-only |
| [GridKind](https://devpost.com/software/gridkind) | Microgrid allocation twin, 3000+ plans, honest “Sensor Lab” | Honest simulated hardware is allowed if labelled |
| [VOLTGAURD-AI](https://devpost.com/software/voltgaurd-ai) | TinyML + INA226, Wokwi, ~0.3 ms loop | Embedded story judges can quote — do not clone |
| [RoboSustain](https://devpost.com/software/robosustain) | Full ESP32 robot BOM | Hardware theater unless tape shows the robot |
| [NeoGuard](https://devpost.com/software/neoguard-real-time-neonatal-monitoring-for-nicus) | NICU feature soup + chatbot | Dies on design + presentation |
| [ELECTRICITY BILL CALCULATOR](https://devpost.com/software/electricity-bill-calculator-t8270d) | Tariff form | Instant last place |
| EcoVolt / VoltHome / FLUXGLOVES | ESP32 energy / glove | Crowded energy + needs hardware on camera |

## 7. Validation strategy (hackathon analog)

Ship a **deterministic core** with a seeded incident, a visible hash, and a score that moves after a repair. Host it. Film the score moving. Public repo. Thumbnail not the default GIF. Do **not** spend the last 72 hours collecting sponsor logos. Featherless coupon `VOLT26` is optional glue, not a strategy.

---

## 8. Ranked 10 — what we can excel at

Scores are a 0–100 **win-fitness** blend (track fit, field differentiation, 3-day ship with **this** machine, judge-path, panel affinity, rules honesty). Not a prize guarantee.

### 1. VoltDecision — bioelectric group-decision lab — **88**

**Track:** AI + Hardware Integration / Smart Health / Open Innovation (the “Volt” in VoltHacks).  
**Verb:** Inject a voltage pattern. Watch tissue decide. Repair the policy. Prove the replay.  
**Why we excel:** Field is ESP32 energy meters and interview clones. Your open research tabs are already on cellular bioelectric coordination. IEEE + health judges can quote a Coordination Score. Same *shape* as FaultForge, **different physics** (not a warehouse fire fork).  
**3-day build:** Deterministic TypeScript/Python twin of an electrode array + gap junctions + injury current. Optional Mac-camera “optical voltage reporter” channel, labelled. GitHub Pages.  
**HUD number:** Coordination Score 0–100, mispattern ticks, incident-input hash.  
**Ten-second try:** one **Run incident** button.  
**Do not:** claim a real culture dish; clone Dialogate; hide an LLM as the diagnostic.

### 2. CortexSight — closed-loop Physical AI with a live camera — **84**

**Track:** Robotics & Embedded / AI + Hardware.  
**Verb:** See → INT8 decide → act, with the Mac camera as the real sensor.  
**Why we excel:** Only local native stack (CortexLoop 33× GEMM, 1.7 KB INT8 model). Nightingale autonomy + NVIDIA ASIC + Qualcomm can smell fake robotics.  
**Required new work (rules):** live camera door, collision/mission HUD, hosted fixture — **not** the Arm contest card restyled.  
**HUD number:** mission time, collisions, GEMM speedup vs scalar.  
**Risk:** “significant new development” bar; do not submit Arm Create unchanged.

### 3. RideThrough — device-level medical-load outage twin — **80**

**Track:** Sustainability & Smart Cities / Smart Health.  
**Verb:** Keep the clinic fridge / oxygen concentrator up when the feeder dies.  
**Why we excel:** GridKind already owns *neighborhood equity*. This is **minutes of protected critical load** — Carilion Clinic + health-analyst judges.  
**HUD number:** protected minutes, reserve SoC %, curtailed noncritical kWh.  
**Do not:** clone GridKind’s 72-home map or call it a live electrical controller.

### 4. LeakCage — fail-closed edge voice leak instrument — **76**

**Track:** Smart Health / AI + Hardware.  
**Verb:** A clinic check-in that **refuses** to speak if the voiceprint can leak.  
**Why we excel:** VoiceBank + Jabra embedded judge; keeper shape (VOICEKEEP-RT) without resubmitting 30972. Non-chat: consent state + leak bits, not a coach.  
**HUD number:** leak bits, consent = locked/open, clone-match %.  
**Do not:** build an interview tutor (Dialogate); resubmit VOICEKEEP.

### 5. TremorVolt — 30-second webcam tremor screen — **74**

**Track:** Smart Health.  
**Verb:** One hold-the-phone / hold-still take. Publish Hz vs a labelled baseline.  
**Why we excel:** Palimpsest’s contest was won by a 30-second screen plus a number a judge can quote (CADENCE). Camera is on this laptop.  
**HUD number:** peak tremor Hz, amplitude, vs published reference (scoped).  
**Do not:** diagnose Parkinson’s; ship a chatbot “doctor.”

### 6. DropPredict — honest volt-drop firmware lab (Wokwi + hosted HUD) — **70**

**Track:** Embedded / AI + Hardware.  
**Verb:** Predict a sag, fire the hold-up switch, show loop time.  
**Why we excel:** Taher / Dhiraj / NVIDIA ASIC lane. Wokwi is allowed if labelled.  
**HUD number:** loop time (µs), predicted vs actual sag, false-negative ticks.  
**Do not:** claim an INA226 we do not own; restyle VOLTGAURD-AI.

### 7. ColdNode — surplus-food cold-chain twin — **62**

**Track:** Sustainability.  
**Verb:** A cooler’s temperature budget decides which pickup survives.  
**Why we excel:** FoodLoop ops brain exists; VoltHacks needs the **thermal loop**, not another dashboard.  
**HUD number:** °C-hours remaining, spoilage risk 0–100.  
**Weakness:** hardware story is simulated unless you film a real probe.

### 8. FloodPlate — on-device recovery of water-damaged civic records — **58**

**Track:** Sustainability / Open Innovation.  
**Verb:** Photograph a soaked page. Show CER before/after on-device.  
**Why we excel:** Palimpsest engines, not the Palimpsest card. Flood + records is a real-world story.  
**HUD number:** CER / readable-word count before vs after.  
**Weakness:** looks like last contest unless the first screen is the camera, not a manifesto.

### 9. OptoMesh — magnetoelectric stim digital twin — **55**

**Track:** Smart Health / Open Innovation.  
**Verb:** Wireless field in → current at the interface → recruitment curve.  
**Why we excel:** Matches your open papers; IEEE-readable.  
**HUD number:** estimated interface current, recruitment %, off-target %.  
**Weakness:** medical-device claim risk; 3-day depth vs VoltDecision (pick one bio-electric story, not two).

### 10. HandSerial — browser hand → actuator twin (no glove BOM) — **48**

**Track:** Robotics / IoT.  
**Verb:** Webcam hand pose drives a labelled virtual gripper / a11y switch.  
**Why we excel:** MediaPipe + Web serial-shaped API without lying about FLUXGLOVES hardware.  
**HUD number:** pose latency ms, grasp success on a seeded task.  
**Weakness:** crowded “Minority Report glove” aesthetic; weaker impact story.

---

## 9. Kill list (do not build)

- Interview / speech-coach / “AI mentor” (clones Dialogate; founder judges).  
- Electricity bill calculator or Copilot tariff form.  
- NICU / hospital feature soup with a parent chatbot.  
- Sponsor-logo salad (Featherless + Adaption + DevSwarm + Tin in 72 hours).  
- Claiming ESP32 / INA226 / MQ-7 we do not have.  
- Resubmitting CortexLoop, Palimpsest, Horizon, VOICEKEEP, Lost Movement, LabSignal unchanged.  
- Rebuilding Proof of Possible 30972.  
- Localhost as the try-it URL.

## 10. Recommended 72-hour path (if you take #1)

1. **Today:** Create the Devpost project (name only), public GitHub, GitHub Pages skeleton with a non-zero Coordination Score. Fill Gate C as you go.  
2. **Day 2:** Deterministic incident + diagnosis + repair + replay hashes. Optional webcam optical-voltage channel.  
3. **Day 3:** VoiceBank demo tape (`voicebank-demo`, picture-first, new script). Screenshots, story Setup = the hosted URL, thumbnail not the placeholder. Submit — drafts that stay drafts fail.

Do not scaffold a second product. One public ship.

## 11. Parallel-agent plan used

| Agent | Result |
|-------|--------|
| Safari logged-in readout | Registered; empty My projects; dates; rules; resources; 2 discussion threads; create-project name field |
| Local inventory ([explore](2e73d5b1-c691-4737-bf43-13b954bcc0e4)) | Empty Volt HACKS; CortexLoop / VoiceBank / no MCU |
| Sponsors + judges ([research](c4057254-8f1d-4599-92a0-f6454345eab5)) | Dialogate = interview coach; prize arithmetic; win shape |
| Field cards | FaultForge, GridKind, VOLTGAURD, RoboSustain, NeoGuard, bill calculator |

There is no Phase 2–6 modeling zoo. The “ensemble” is **one** hosted loop plus a tape.
