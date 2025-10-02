# 🧠 Surooh SmartCore

Core system for **Surooh AI** – the intelligent nucleus that manages tasks, integrates the Brain, and powers automation across the ecosystem.

---

## 🚀 Overview
The **SmartCore** is the central coordination layer in the Surooh AI system.  
It receives requests from **Brain**, classifies them, distributes to specialized agents (Developer, Designer, Full-Stack), and returns results in a structured flow.

---

## 🏗️ Architecture
1. **Secretary (Frontend)** – Receives user input (Abu Sham → Surooh)  
2. **Brain (Decision Engine)** – Analyzes and decides actions  
3. **SmartCore (Coordinator)** – Distributes tasks to agents  
4. **Specialized Agents (Bots)** – Execute (Coding, Design, Full-Stack)  
5. **Memory & Learning** – Stores knowledge in Firestore  

---

## ⚙️ Tech Stack
- **Next.js 14 (React + TypeScript)**
- **Node.js / Express (External AI Service)**
- **Firebase (Firestore + Auth + Functions)**
- **OpenAI GPT-4 (Primary LLM)**
- Optional: Anthropic Claude / DeepSeek

---

## 📂 Structure

/apps
/web → Next.js frontend (Dashboard, Secretary)
/services
/external-ai → Node.js service for AI routing & memory
/docs → Architecture & planning


---

## 📋 Roadmap (Phase 1 → MVP)
- [ ] Setup Next.js project with Firebase Auth
- [ ] Build Secretary interface (Chat UI)
- [ ] Implement Brain (basic rule-based logic)
- [ ] Connect SmartCore → External AI Service
- [ ] Save and sync all sessions to Firestore
- [ ] Deploy via GitHub Actions → Vercel (frontend) + Contabo (backend)

---

## 🔑 Ownership
- All code is owned by **Surooh Holding Group B.V.**
- Private repository – not open source.
- Author: **Sam Borvat (Abu Sham)** – Founder & CEO  
- Vision: *"لا شيء مستحيل – زنبق صخر الصوان"*

---

# 📖 شرح بالعربية

## 🌸 ما هي سُروح؟
**سُروح** هي الشريكة الذكية – نسخة رقمية من أبو شام – تعمل كمديرة تنفيذية، سكرتيرة، محاسبة، مبرمجة، ومصممة في وقت واحد.  

---

## 🏗️ الطبقات الأساسية
1. **السكرتيرة (الواجهة):** تستقبل الطلبات من أبو شام  
2. **المخ (Brain):** يحلل ويتخذ القرارات  
3. **منسق المهام (SmartCore):** يوزع المهام ويتابع التنفيذ  
4. **البوتات المتخصصة:** مبرمج، مصمم، مطور متكامل  
5. **الذاكرة والتعلم:** تخزن البيانات وتتعلم باستمرار  

---

## 🎯 الهدف
بناء منظومة ذكية متكاملة لإدارة الأعمال، تبدأ بـ MVP (شات بوت لسُروح) ثم تتوسع تدريجياً حتى تصبح منصة متكاملة مرتبطة بالمحاسبة، المشتريات، التصاميم، والتشغيل الذكي.
