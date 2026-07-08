"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    location: "Kanpur",
    avatar: "RS",
    rating: 5,
    text: "मेरी सीवर की शिकायत तीन सप्ताह से लंबित थी। जब मैंने इसे यहाँ दर्ज किया, तो AI ने इसे तुरंत कानपुर नगर निगम को भेज दिया, और चालक दल ने इसे केवल 2 दिनों में हल कर दिया।",
    textEn: "My sewer complaint was pending for three weeks. When I filed it here, the AI routed it to the Kanpur Nagar Nigam instantly, and the crew resolved it in just 2 days. Simply outstanding speed!",
  },
  {
    name: "Meena Devi",
    location: "Chowk, Lucknow",
    avatar: "MD",
    rating: 5,
    text: "मुझे स्मार्टफोन पर टाइप करना ठीक से नहीं आता, इसलिए मैंने सिर्फ चौक की धंसी हुई सड़क की एक तस्वीर खींची और उसे अपलोड कर दिया। AI ने समस्या और सटीक स्थान को खुद ही पहचान लिया—मुझे एक शब्द भी टाइप नहीं करना पड़ा!",
    textEn: "I'm not good at typing on smartphones, so I just snapped a photo of the caved-in road at Chowk and uploaded it. The AI automatically detected the exact issue and location—I didn't have to type a single word!",
  },
  {
    name: "Priya Verma",
    location: "Varanasi",
    avatar: "PV",
    rating: 5,
    text: "शिकायत दर्ज करना उतना ही सरल था जितना कि हिंदी में वॉयस नोट भेजना। सिस्टम ने इसका पूरी तरह से अनुवाद किया, टिकट पंजीकृत किया, और मंदिर के पास का कचरा साफ होने तक मुझे वास्तविक समय में एसएमएस अपडेट भेजता रहा।",
    textEn: "Filing a grievance was as simple as sending a voice note in Hindi. The system translated it perfectly, registered the ticket, and kept sending me real-time SMS updates until the garbage dump near the temple was cleared.",
  },
  {
    name: "Sanjay Tiwari",
    location: "Gorakhpur",
    avatar: "ST",
    rating: 4,
    text: "यह बहुत बड़ी राहत है कि यहाँ वास्तविक जवाबदेही है। जब स्थानीय अधिकारी ने टूटी हुई जल निकासी रिपोर्ट की अनदेखी की, तो AI ने तीसरे दिन खुद ही इसे वरिष्ठ आयुक्त के पास भेज दिया, और अगली सुबह काम शुरू हो गया।",
    textEn: "It's a huge relief that there is real accountability here. When the local officer ignored the broken drainage report, the AI autonomously escalated it to the senior commissioner on day 3, and work started the next morning.",
  },
];

export function Testimonials() {
  return (
    <section className="pt-12 pb-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Trusted by <span className="gradient-text">Citizens</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from real people across Uttar Pradesh.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="glass-card rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <Quote className="w-8 h-8 text-primary/20 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-base leading-relaxed mb-4">
                    &ldquo;{t.textEn}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                        {t.avatar}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.location}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-3.5 h-3.5 fill-warning-amber text-warning-amber"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
