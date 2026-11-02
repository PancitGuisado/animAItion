import React from 'react';
import { 
  Dog, Cat, Car, Brain, Flame, Zap, Rocket, Shield, 
  Coins, Heart, Code, Smile, Sun, Moon, Music, Sparkles, 
  Target, Clock, Check, Apple, Coffee, Laptop, Dumbbell, Globe, Lock
} from 'lucide-react';

export const ICON_MAP = {
  dog: Dog,
  cat: Cat,
  car: Car,
  brain: Brain,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  shield: Shield,
  coins: Coins,
  heart: Heart,
  code: Code,
  smile: Smile,
  sun: Sun,
  moon: Moon,
  music: Music,
  sparkles: Sparkles,
  target: Target,
  clock: Clock,
  check: Check,
  apple: Apple,
  coffee: Coffee,
  laptop: Laptop,
  dumbbell: Dumbbell,
  globe: Globe,
  lock: Lock
};

export function getIconComponent(name) {
  if (!name) return Sparkles;
  const key = name.toLowerCase().trim();
  return ICON_MAP[key] || Sparkles;
}
