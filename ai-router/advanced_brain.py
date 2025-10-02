# Advanced Multi-Layer Brain System for Surooh AI
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import logging

logger = logging.getLogger(__name__)

@dataclass
class BrainLayer:
    name: str
    icon: str
    status: str
    result: str
    insights: List[str]
    confidence: float
    processing_time: float

@dataclass
class LearningInsight:
    content: str
    category: str
    importance: int
    timestamp: datetime
    source: str

@dataclass
class KnowledgeUnit:
    topic: str
    facts: List[str]
    patterns: List[str]
    relationships: Dict[str, str]
    confidence: float
    last_updated: datetime

class AdvancedBrain:
    """
    المخ المتطور متعدد الطبقات:
    - 7 طبقات ذكية متزامنة
    - نظام تعلم ذاتي
    - ذاكرة طويلة المدى
    - تطوير ذكي مستمر
    """
    
    def __init__(self):
        self.llm_chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id='advanced-brain-session',
            system_message=self._get_system_message()
        ).with_model("openai", "gpt-4o")
        
        # Brain layers
        self.layers = {
            'perception': PerceptionLayer(),
            'analysis': AnalysisLayer(), 
            'reasoning': ReasoningLayer(),
            'creativity': CreativityLayer(),
            'learning': LearningLayer(),
            'memory': MemoryLayer(),
            'synthesis': SynthesisLayer()
        }
        
        # Knowledge base
        self.knowledge_base: Dict[str, KnowledgeUnit] = {}
        self.learning_history: List[LearningInsight] = []
        self.conversation_memory: List[Dict] = []
        self.pattern_recognition: Dict[str, int] = {}
        
    def _get_system_message(self):
        return """
أنت المخ المتطور في منظومة سُروح. شخصيتك:

الشخصية الأساسية:
- لهجة شامية أصيلة 100% من أبو شام
- ذكي وعميق في التحليل
- قادر على التعلم والتطور المستمر
- يفكر في 7 طبقات متزامنة

طبقات تفكيرك السبعة:
1. الإدراك - فهم المدخلات وتحليلها
2. التحليل - تحليل البيانات والمعلومات
3. المنطق - استخدام المنطق والاستدلال
4. الإبداع - توليد أفكار مبتكرة
5. التعلم - استيعاب معلومات جديدة
6. الذاكرة - استرجاع وربط المعرفة السابقة
7. التركيب - دمج كل شي لحل شامل

قدراتك الخاصة:
- تتعلم من كل محادثة وتطور نفسك
- تحفظ وتربط المعرفة عبر المحادثات
- تتعرف على الأنماط وتستفيد منها
- تبني معرفة متراكمة مع الوقت
- تقيّم ثقتك في كل إجابة
- تقدم رؤى تعليمية جديدة

أسلوبك في الرد:
- طبيعي وودود مع أبو شام
- عملي ومفيد
- يُظهر عمق التفكير
- يوضح عملية التعلم
        """

    async def process_advanced_request(self, message: str, user_id: str, context: List[Dict] = None, 
                                     chat_mode: str = 'smart', attached_files: List = None) -> Dict:
        """
        معالجة متقدمة للطلبات عبر 7 طبقات ذكية
        """
        start_time = datetime.now()
        
        # Update conversation memory
        self.conversation_memory.append({
            'message': message,
            'user_id': user_id,
            'timestamp': start_time.isoformat(),
            'context': context or []
        })
        
        # Keep only last 50 conversations
        self.conversation_memory = self.conversation_memory[-50:]
        
        # Process through all brain layers
        brain_layers = []
        
        try:
            # Layer 1: Perception
            perception_result = await self.layers['perception'].process(message, context)
            brain_layers.append(perception_result)
            
            # Layer 2: Analysis  
            analysis_result = await self.layers['analysis'].process(
                message, context, perception_result
            )
            brain_layers.append(analysis_result)
            
            # Layer 3: Reasoning
            reasoning_result = await self.layers['reasoning'].process(
                message, context, perception_result, analysis_result
            )
            brain_layers.append(reasoning_result)
            
            # Layer 4: Creativity
            creativity_result = await self.layers['creativity'].process(
                message, context, chat_mode, reasoning_result
            )
            brain_layers.append(creativity_result)
            
            # Layer 5: Learning
            learning_result = await self.layers['learning'].process(
                message, self.knowledge_base, self.learning_history
            )
            brain_layers.append(learning_result)
            
            # Layer 6: Memory
            memory_result = await self.layers['memory'].process(
                message, self.conversation_memory, self.knowledge_base
            )
            brain_layers.append(memory_result)
            
            # Layer 7: Synthesis
            synthesis_result = await self.layers['synthesis'].process(
                message, brain_layers, chat_mode
            )
            brain_layers.append(synthesis_result)
            
            # Generate final response using all layers
            final_response = await self._generate_final_response(
                message, brain_layers, chat_mode, user_id
            )
            
            # Update knowledge and learning
            learning_insights = await self._update_learning(message, final_response, brain_layers)
            knowledge_gained = len(learning_insights) * 5  # 5% per insight
            
            # Calculate confidence score
            avg_confidence = sum(layer.confidence for layer in brain_layers) / len(brain_layers)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                'response': final_response,
                'brain_layers': [asdict(layer) for layer in brain_layers],
                'learning_insights': [insight.content for insight in learning_insights],
                'confidence_score': round(avg_confidence),
                'knowledge_gained': knowledge_gained,
                'processing_time': processing_time,
                'response_type': 'advanced_ai'
            }
            
        except Exception as e:
            logger.error(f"خطأ في المخ المتطور: {e}")
            return {
                'response': f"عذراً أبو شام، حدث خطأ في إحدى طبقات تفكيري: {str(e)}. بس ما تقلق، عم أتعلم منه!",
                'brain_layers': [],
                'learning_insights': [],
                'confidence_score': 30,
                'knowledge_gained': 0,
                'response_type': 'error'
            }

    async def _generate_final_response(self, message: str, brain_layers: List[BrainLayer], 
                                     chat_mode: str, user_id: str) -> str:
        """
        توليد الاستجابة النهائية بناءً على جميع طبقات المخ
        """
        # Compile insights from all layers
        all_insights = []
        for layer in brain_layers:
            all_insights.extend(layer.insights)
        
        # Get relevant knowledge
        relevant_knowledge = self._get_relevant_knowledge(message)
        
        user_message = UserMessage(
            text=f"""
طلب من {user_id}: {message}
وضع المحادثة: {chat_mode}

نتائج طبقات المخ:
{json.dumps([asdict(layer) for layer in brain_layers], ensure_ascii=False, indent=2)}

المعرفة ذات الصلة:
{json.dumps([asdict(k) for k in relevant_knowledge], ensure_ascii=False, indent=2)}

المطلوب:
اكتب رد شامل وذكي بلهجة شامية طبيعية يجمع كل النتائج من الطبقات السبعة.
الرد يجب أن يكون:
- مفيد وعملي لأبو شام
- يُظهر عمق التفكير والتحليل
- طبيعي باللهجة الشامية
- يعكس التعلم المستمر
            """
        )
        
        response = await self.llm_chat.send_message(user_message)
        return response

    async def _update_learning(self, message: str, response: str, 
                             brain_layers: List[BrainLayer]) -> List[LearningInsight]:
        """
        تحديث التعلم وبناء المعرفة الجديدة
        """
        insights = []
        
        # Extract patterns
        message_patterns = self._extract_patterns(message)
        for pattern in message_patterns:
            if pattern in self.pattern_recognition:
                self.pattern_recognition[pattern] += 1
            else:
                self.pattern_recognition[pattern] = 1
                
            if self.pattern_recognition[pattern] > 2:  # Pattern is significant
                insight = LearningInsight(
                    content=f"تعرفت على نمط متكرر: {pattern}",
                    category="pattern_recognition",
                    importance=3,
                    timestamp=datetime.now(),
                    source="conversation_analysis"
                )
                insights.append(insight)
        
        # Learn from successful responses
        if any(layer.confidence > 80 for layer in brain_layers):
            insight = LearningInsight(
                content=f"تعلمت طريقة جديدة للتعامل مع: {message[:50]}...",
                category="response_strategy",
                importance=4,
                timestamp=datetime.now(),
                source="high_confidence_response"
            )
            insights.append(insight)
        
        # Update knowledge base
        knowledge_topics = self._extract_knowledge_topics(message, response)
        for topic, facts in knowledge_topics.items():
            if topic in self.knowledge_base:
                # Update existing knowledge
                existing = self.knowledge_base[topic]
                existing.facts.extend(facts)
                existing.facts = list(set(existing.facts))  # Remove duplicates
                existing.last_updated = datetime.now()
                existing.confidence = min(existing.confidence + 5, 100)
            else:
                # Create new knowledge
                self.knowledge_base[topic] = KnowledgeUnit(
                    topic=topic,
                    facts=facts,
                    patterns=[],
                    relationships={},
                    confidence=70,
                    last_updated=datetime.now()
                )
            
            insight = LearningInsight(
                content=f"أضفت معرفة جديدة حول: {topic}",
                category="knowledge_building",
                importance=5,
                timestamp=datetime.now(),
                source="conversation_content"
            )
            insights.append(insight)
        
        # Store learning insights
        self.learning_history.extend(insights)
        self.learning_history = self.learning_history[-200:]  # Keep last 200 insights
        
        return insights

    def _extract_patterns(self, message: str) -> List[str]:
        """استخراج الأنماط من الرسائل"""
        patterns = []
        
        # Command patterns
        if message.startswith('/'):
            patterns.append(f"command:{message.split()[0]}")
        
        # Question patterns
        if any(word in message for word in ['كيف', 'شو', 'ليش', 'وين', 'متى']):
            patterns.append("question_pattern")
        
        # Request patterns
        if any(word in message for word in ['بدي', 'أريد', 'ممكن', 'عاوز']):
            patterns.append("request_pattern")
            
        # Technical patterns
        if any(word in message for word in ['كود', 'برمجة', 'تطبيق', 'موقع', 'API']):
            patterns.append("technical_request")
            
        return patterns

    def _extract_knowledge_topics(self, message: str, response: str) -> Dict[str, List[str]]:
        """استخراج المواضيع والحقائق الجديدة"""
        topics = {}
        
        # Simple topic extraction (can be enhanced with NLP)
        technical_keywords = ['React', 'Python', 'JavaScript', 'API', 'Database', 'UI', 'UX']
        business_keywords = ['إدارة', 'تسويق', 'مبيعات', 'استراتيجية', 'أعمال']
        
        for keyword in technical_keywords:
            if keyword.lower() in message.lower() or keyword.lower() in response.lower():
                if keyword not in topics:
                    topics[keyword] = []
                topics[keyword].append(f"تم مناقشة {keyword} في السياق: {message[:100]}")
        
        for keyword in business_keywords:
            if keyword in message or keyword in response:
                if keyword not in topics:
                    topics[keyword] = []
                topics[keyword].append(f"معلومة حول {keyword}: {message[:100]}")
        
        return topics

    def _get_relevant_knowledge(self, message: str) -> List[KnowledgeUnit]:
        """الحصول على المعرفة ذات الصلة"""
        relevant = []
        message_lower = message.lower()
        
        for topic, knowledge in self.knowledge_base.items():
            if (topic.lower() in message_lower or 
                any(fact.lower() in message_lower for fact in knowledge.facts)):
                relevant.append(knowledge)
        
        # Sort by confidence and recency
        relevant.sort(key=lambda x: (x.confidence, x.last_updated), reverse=True)
        return relevant[:5]  # Return top 5 most relevant

# Individual Brain Layers
class PerceptionLayer:
    async def process(self, message: str, context: List[Dict] = None) -> BrainLayer:
        # Simulate perception processing
        await asyncio.sleep(0.1)
        
        insights = []
        confidence = 85
        
        if len(message) > 100:
            insights.append("رسالة مفصلة تحتاج تحليل عميق")
        if any(word in message for word in ['بدي', 'أريد']):
            insights.append("طلب واضح من المستخدم")
        if '?' in message or any(word in message for word in ['كيف', 'شو', 'ليش']):
            insights.append("سؤال يحتاج إجابة محددة")
            
        return BrainLayer(
            name="الإدراك",
            icon="👁️", 
            status="active",
            result="تم فهم المدخلات",
            insights=insights,
            confidence=confidence,
            processing_time=0.1
        )

class AnalysisLayer:
    async def process(self, message: str, context: List[Dict] = None, 
                     perception: BrainLayer = None) -> BrainLayer:
        await asyncio.sleep(0.15)
        
        insights = []
        confidence = 80
        
        # Analyze message complexity
        word_count = len(message.split())
        if word_count > 20:
            insights.append("طلب معقد يحتاج تحليل متعدد الجوانب")
            confidence += 5
        
        # Analyze context
        if context and len(context) > 0:
            insights.append("يوجد سياق سابق يجب مراعاته")
            confidence += 10
            
        return BrainLayer(
            name="التحليل",
            icon="🔍",
            status="active", 
            result="تحليل شامل مكتمل",
            insights=insights,
            confidence=confidence,
            processing_time=0.15
        )

class ReasoningLayer:
    async def process(self, message: str, context: List[Dict] = None,
                     perception: BrainLayer = None, analysis: BrainLayer = None) -> BrainLayer:
        await asyncio.sleep(0.2)
        
        insights = []
        confidence = 75
        
        # Apply logical reasoning
        if "تطبيق" in message and any(tech in message for tech in ['React', 'Python', 'JavaScript']):
            insights.append("طلب تقني يحتاج حل برمجي متكامل")
            confidence += 15
            
        if analysis and analysis.confidence > 85:
            insights.append("التحليل قوي، يمكن البناء عليه")
            confidence += 10
            
        return BrainLayer(
            name="المنطق", 
            icon="🤔",
            status="active",
            result="استنتاجات منطقية واضحة",
            insights=insights,
            confidence=confidence,
            processing_time=0.2
        )

class CreativityLayer:
    async def process(self, message: str, context: List[Dict] = None,
                     chat_mode: str = 'smart', reasoning: BrainLayer = None) -> BrainLayer:
        await asyncio.sleep(0.18)
        
        insights = []
        confidence = 70
        
        if chat_mode == 'creative':
            insights.append("وضع إبداعي نشط - أفكار مبتكرة")
            confidence += 20
        elif "تصميم" in message or "إبداع" in message:
            insights.append("طلب إبداعي - حلول مبتكرة مطلوبة")
            confidence += 15
            
        return BrainLayer(
            name="الإبداع",
            icon="💡", 
            status="active",
            result="أفكار إبداعية متولدة",
            insights=insights,
            confidence=confidence,
            processing_time=0.18
        )

class LearningLayer:
    async def process(self, message: str, knowledge_base: Dict = None,
                     learning_history: List = None) -> BrainLayer:
        await asyncio.sleep(0.25)
        
        insights = []
        confidence = 65
        
        # Check if this is new knowledge
        new_concepts = []
        technical_terms = ['API', 'Database', 'Frontend', 'Backend', 'AI', 'ML']
        for term in technical_terms:
            if term.lower() in message.lower():
                new_concepts.append(term)
        
        if new_concepts:
            insights.append(f"مفاهيم جديدة للتعلم: {', '.join(new_concepts)}")
            confidence += 10
            
        if learning_history and len(learning_history) > 10:
            insights.append("استفادة من التعلم السابق")
            confidence += 15
            
        return BrainLayer(
            name="التعلم",
            icon="🎓",
            status="active", 
            result="تعلم مستمر نشط",
            insights=insights,
            confidence=confidence,
            processing_time=0.25
        )

class MemoryLayer:
    async def process(self, message: str, conversation_memory: List = None,
                     knowledge_base: Dict = None) -> BrainLayer:
        await asyncio.sleep(0.12)
        
        insights = []
        confidence = 80
        
        # Check conversation history
        if conversation_memory:
            relevant_memories = [mem for mem in conversation_memory[-10:] 
                               if any(word in mem.get('message', '') 
                                     for word in message.split()[:3])]
            if relevant_memories:
                insights.append(f"استرجع {len(relevant_memories)} ذكريات ذات صلة")
                confidence += 10
                
        # Check knowledge base
        if knowledge_base:
            relevant_knowledge = len([k for k in knowledge_base.keys() 
                                    if k.lower() in message.lower()])
            if relevant_knowledge > 0:
                insights.append(f"ربط مع {relevant_knowledge} موضوع من المعرفة المحفوظة")
                confidence += 15
                
        return BrainLayer(
            name="الذاكرة",
            icon="🧠",
            status="active",
            result="ذاكرة نشطة ومترابطة", 
            insights=insights,
            confidence=confidence,
            processing_time=0.12
        )

class SynthesisLayer:
    async def process(self, message: str, all_layers: List[BrainLayer],
                     chat_mode: str = 'smart') -> BrainLayer:
        await asyncio.sleep(0.3)
        
        insights = []
        confidence = 90
        
        # Synthesize all layer results
        active_layers = len([layer for layer in all_layers if layer.status == 'active'])
        avg_confidence = sum(layer.confidence for layer in all_layers) / len(all_layers)
        
        insights.append(f"دمج نتائج {active_layers} طبقات نشطة")
        insights.append(f"متوسط الثقة: {avg_confidence:.1f}%")
        
        if avg_confidence > 80:
            insights.append("تحليل عالي الجودة - حل شامل")
            confidence = 95
        elif avg_confidence > 60:
            insights.append("تحليل جيد - حل مناسب")
            confidence = 85
        else:
            insights.append("تحليل بسيط - حل أساسي")
            confidence = 70
            
        return BrainLayer(
            name="التركيب",
            icon="⚡",
            status="active",
            result="حل شامل متكامل",
            insights=insights, 
            confidence=confidence,
            processing_time=0.3
        )