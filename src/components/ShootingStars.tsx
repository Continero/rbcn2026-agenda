"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

const LOGO_SIZE = 20;
const MAX_FALLEN = 50;
const SPAWN_MIN_MS = 10000;
const SPAWN_MAX_MS = 20000;
const SPARK_COUNT = 8;
const FPS = 60;
const EDGE_MARGIN = 30;

// Gnome config
const GNOME_W = 24;
const GNOME_H = 40;
const GNOME_SPEED = 0.4; // pixels per frame
const GNOME_MARGIN = 60; // turn-around margin from edges
const GNOME_MEET_DISTANCE = 40; // pixels apart to trigger pancake eating
const PANCAKE_DURATION = 240; // frames (~4 seconds at 60fps)
const PANCAKE_COOLDOWN = 300; // frames before they can eat again
const SHOOT_INTERVAL = 60; // frames (~1s at 60fps)
const PROJECTILE_SPEED = 8; // pixels per frame
const HIT_CHANCE = 0.15; // 15% hit rate
const FRAGMENT_SIZE = 12; // ~60% of LOGO_SIZE
const SUPER_SAIYAN_DURATION = 300; // frames (~5s)
const SUPER_SAIYAN_SPEED_MULT = 3;
const SUPER_SAIYAN_SCALE = 1.5;
const BUBBLE_MIN_MS = 20000;
const BUBBLE_MAX_MS = 40000;
const BUBBLE_DURATION_MS = 5000;
const SONG_INTERVAL_MS = 120000; // 2 minutes between songs
const SONG_LINE_MS = 2500; // each line shown for 2.5s

// Person config (Pekka & René)
const PERSON_SPEED = 0.3;
const PERSON_MARGIN = 50;
const CONVO_INTERVAL_MS = 60000; // 1 min between conversations
const CONVO_LINE_MS = 4000; // each line shown 4s
const CONVO_BUBBLE_DURATION_MS = 3500;

interface SongLine {
  gnome: number;
  text: string;
}

const SONGS: SongLine[][] = [
  // Bohemian Rhapsody
  [
    { gnome: 0, text: "Is this the real life? 🎤" },
    { gnome: 1, text: "Is this just fantasy?" },
    { gnome: 0, text: "Caught in a landslide..." },
    { gnome: 1, text: "No escape from reality!" },
    { gnome: 0, text: "Open your eyes..." },
    { gnome: 1, text: "Look up to the skies..." },
    { gnome: 0, text: "I'm just a poor boy 😢" },
    { gnome: 1, text: "Easy come, easy go!" },
  ],
  // Never Gonna Give You Up
  [
    { gnome: 0, text: "Never gonna give you up 🎵" },
    { gnome: 1, text: "Never gonna let you down!" },
    { gnome: 0, text: "Never gonna run around..." },
    { gnome: 1, text: "And desert you! 🎤" },
    { gnome: 0, text: "Never gonna make you cry!" },
    { gnome: 1, text: "Never gonna say goodbye!" },
    { gnome: 0, text: "Never gonna tell a lie..." },
    { gnome: 1, text: "And hurt you! 🕺" },
  ],
  // We Will Rock You
  [
    { gnome: 0, text: "Buddy you're a boy 🎵" },
    { gnome: 1, text: "Make a big noise!" },
    { gnome: 0, text: "Playin' in the street..." },
    { gnome: 1, text: "Gonna be a big man someday!" },
    { gnome: 0, text: "We will... 🥁" },
    { gnome: 1, text: "We will..." },
    { gnome: 0, text: "ROCK YOU! 🎸" },
    { gnome: 1, text: "ROCK YOU! 🤘" },
  ],
  // Don't Stop Believin'
  [
    { gnome: 0, text: "Just a small town girl 🎵" },
    { gnome: 1, text: "Livin' in a lonely world!" },
    { gnome: 0, text: "She took the midnight train" },
    { gnome: 1, text: "Goin' anywhere!" },
    { gnome: 0, text: "Don't stop... 🎤" },
    { gnome: 1, text: "Believin'!" },
    { gnome: 0, text: "Hold on to that feelin'!" },
    { gnome: 1, text: "Streetlight people! ✨" },
  ],
  // Hakuna Matata
  [
    { gnome: 0, text: "Hakuna Matata! 🎵" },
    { gnome: 1, text: "What a wonderful phrase!" },
    { gnome: 0, text: "Hakuna Matata..." },
    { gnome: 1, text: "Ain't no passing craze!" },
    { gnome: 0, text: "It means no worries 😎" },
    { gnome: 1, text: "For the rest of your days!" },
    { gnome: 0, text: "It's our problem-free..." },
    { gnome: 1, text: "Philosophy! 🦁" },
  ],
  // YMCA
  [
    { gnome: 0, text: "Young man! 🎵" },
    { gnome: 1, text: "There's no need to feel down!" },
    { gnome: 0, text: "I said young man!" },
    { gnome: 1, text: "Pick yourself off the ground!" },
    { gnome: 0, text: "It's fun to stay at the..." },
    { gnome: 1, text: "Y-M-C-A! 🕺" },
    { gnome: 0, text: "Y! M! C! A!" },
    { gnome: 1, text: "💃 Y-M-C-A! 💃" },
  ],
  // Baby Shark
  [
    { gnome: 0, text: "Baby shark 🦈" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
    { gnome: 0, text: "Mama shark 🦈" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
    { gnome: 0, text: "Daddy shark 🦈" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
    { gnome: 0, text: "Run away! 🏃" },
    { gnome: 1, text: "Doo doo doo doo doo doo!" },
  ],
];

const GNOME_MESSAGES = [
  "Robot Framework rocks! 🤖",
  "Automate all the things!",
  "Hello RoboCon 2026! 🎉",
  "Keywords are magic ✨",
  "Have a great conference!",
  "RF + Python = ❤️",
  "Testing made easy!",
  "Welcome to Helsinki! 🇫🇮",
  "Open source forever!",
  "Log files are my diary 📖",
  "*** Test Cases *** 🚀",
  "Keyword-driven FTW!",
  "RPA or testing? Both!",
  "Moi moi! 👋",
  "I love test automation!",
  "RF community is the best!",
  "Hyvää päivää! ☀️",
  "Keep calm and automate",
  "One framework to rule them all",
  "Tervetuloa! 🎊",
];

interface ConvoLine {
  speaker: 'pekka' | 'rene' | 'mikka';
  text: string;
}

const CONVERSATIONS: ConvoLine[][] = [
  [
    { speaker: 'pekka', text: "RF 7 is looking really good" },
    { speaker: 'rene', text: "The VAR syntax was worth the debates" },
    { speaker: 'pekka', text: "Only took us 3 years of GitHub issues" },
    { speaker: 'rene', text: "Open source moves fast... eventually" },
  ],
  [
    { speaker: 'rene', text: "How many keywords is too many keywords?" },
    { speaker: 'pekka', text: "There is no upper limit" },
    { speaker: 'rene', text: "That explains the 800-keyword library I reviewed" },
    { speaker: 'pekka', text: "...was it well-documented at least?" },
  ],
  [
    { speaker: 'pekka', text: "TRY/EXCEPT was a good addition" },
    { speaker: 'rene', text: "People kept asking for it for years" },
    { speaker: 'pekka', text: "Now they ask why it's not like Python" },
    { speaker: 'rene', text: "You can never win 😄" },
  ],
  [
    { speaker: 'rene', text: "Browser Library or SeleniumLibrary?" },
    { speaker: 'pekka', text: "Why not both?" },
    { speaker: 'rene', text: "That's what everyone's doing actually" },
    { speaker: 'pekka', text: "The RF way: support everything" },
  ],
  [
    { speaker: 'pekka', text: "Someone opened an issue in Finnish" },
    { speaker: 'rene', text: "Could you understand it?" },
    { speaker: 'pekka', text: "Yes. It said 'this doesn't work'" },
    { speaker: 'rene', text: "Same in every language then" },
  ],
  [
    { speaker: 'rene', text: "The Foundation board meeting is next week" },
    { speaker: 'pekka', text: "Any exciting agenda items?" },
    { speaker: 'rene', text: "Whether to use RF to test RF" },
    { speaker: 'pekka', text: "...we should have done that years ago" },
  ],
  [
    { speaker: 'pekka', text: "I coded all night, it's 4 AM in Helsinki" },
    { speaker: 'rene', text: "The sun is already up there, right?" },
    { speaker: 'pekka', text: "In June yes. In February? Pure darkness" },
    { speaker: 'rene', text: "Perfect conditions for coding" },
  ],
  [
    { speaker: 'rene', text: "Should we add YAML support?" },
    { speaker: 'pekka', text: "...please don't start that again" },
    { speaker: 'rene', text: "I'm just asking!" },
    { speaker: 'pekka', text: "The answer is still no 🙃" },
  ],
  [
    { speaker: 'pekka', text: "Have you seen the log.html lately?" },
    { speaker: 'rene', text: "It's beautiful. Who needs dashboards?" },
    { speaker: 'pekka', text: "Some people print it and frame it" },
    { speaker: 'rene', text: "As one should" },
  ],
  [
    { speaker: 'rene', text: "Coffee break?" },
    { speaker: 'pekka', text: "In Finland, it's always coffee time" },
    { speaker: 'rene', text: "Germans also take coffee seriously" },
    { speaker: 'pekka', text: "But we drink more per capita 🇫🇮" },
  ],
  [
    { speaker: 'pekka', text: "Someone named their keyword 'Do The Thing'" },
    { speaker: 'rene', text: "Descriptive naming at its finest" },
    { speaker: 'pekka', text: "At least it wasn't 'Test 1'" },
    { speaker: 'rene', text: "...I've seen 'Test 1' through 'Test 847'" },
  ],
  [
    { speaker: 'rene', text: "How's the sauna after RoboCon?" },
    { speaker: 'pekka', text: "Essential. It's part of the conference" },
    { speaker: 'rene', text: "In Germany we'd have a beer garden" },
    { speaker: 'pekka', text: "We have beer in the sauna too" },
  ],
  [
    { speaker: 'pekka', text: "RF is used in 60+ countries now" },
    { speaker: 'rene', text: "And how many languages?" },
    { speaker: 'pekka', text: "Keywords work in any language, that's the beauty" },
    { speaker: 'rene', text: "Universal test automation 🌍" },
  ],
  [
    { speaker: 'rene', text: "What's your favorite RF feature?" },
    { speaker: 'pekka', text: "Simplicity. Plain text is powerful" },
    { speaker: 'rene', text: "Mine is the community" },
    { speaker: 'pekka', text: "That's not a feature... but I agree ❤️" },
  ],
  [
    { speaker: 'pekka', text: "Winter coding in Helsinki: -20°C outside" },
    { speaker: 'rene', text: "That sounds terrible" },
    { speaker: 'pekka', text: "Laptop keeps my hands warm" },
    { speaker: 'rene', text: "Silver lining of open source 😄" },
  ],
  // Mikka conversations
  [
    { speaker: 'mikka', text: "Board meeting agenda has 12 items today" },
    { speaker: 'rene', text: "Can we skip the first 11?" },
    { speaker: 'mikka', text: "No. Item 1: why don't we have more sponsors" },
    { speaker: 'rene', text: "...this is going to be a long meeting" },
  ],
  [
    { speaker: 'mikka', text: "We need more paying members" },
    { speaker: 'pekka', text: "Have you tried making RF worse so people pay for support?" },
    { speaker: 'mikka', text: "That is... not the strategy" },
    { speaker: 'pekka', text: "Just brainstorming 🙃" },
  ],
  [
    { speaker: 'mikka', text: "I sent the board 5 emails this week" },
    { speaker: 'rene', text: "I saw them. All of them. At 6 AM" },
    { speaker: 'mikka', text: "Early bird gets the sponsors" },
    { speaker: 'rene', text: "Early bird gets the coffee first ☕" },
  ],
  [
    { speaker: 'pekka', text: "Mikka, any new sponsors?" },
    { speaker: 'mikka', text: "I'm working on three leads right now" },
    { speaker: 'pekka', text: "You said that last month too" },
    { speaker: 'mikka', text: "These are THREE DIFFERENT leads!" },
  ],
  [
    { speaker: 'mikka', text: "The Foundation needs a bigger budget" },
    { speaker: 'pekka', text: "For what?" },
    { speaker: 'mikka', text: "To pay me to find a bigger budget" },
    { speaker: 'pekka', text: "...the logic checks out somehow" },
  ],
  [
    { speaker: 'mikka', text: "Who's done their action items from last meeting?" },
    { speaker: 'rene', text: "Define 'done'" },
    { speaker: 'pekka', text: "Define 'action items'" },
    { speaker: 'mikka', text: "I'll take that as a no 😅" },
  ],
  [
    { speaker: 'mikka', text: "RoboCon attendance is looking great this year" },
    { speaker: 'rene', text: "People love Helsinki in February" },
    { speaker: 'mikka', text: "They love RF. Helsinki is a bonus" },
    { speaker: 'pekka', text: "The sauna is the real reason" },
  ],
  [
    { speaker: 'rene', text: "Mikka, when's the next board meeting?" },
    { speaker: 'mikka', text: "You just missed it" },
    { speaker: 'rene', text: "What? When was it?" },
    { speaker: 'mikka', text: "Just kidding. It's Thursday. Please show up 😄" },
  ],
  [
    { speaker: 'mikka', text: "I pitched RF to a Fortune 500 company today" },
    { speaker: 'pekka', text: "And?" },
    { speaker: 'mikka', text: "They said 'we already use it'" },
    { speaker: 'pekka', text: "That's... good and bad at the same time" },
  ],
  [
    { speaker: 'mikka', text: "Open source is free but someone has to pay the bills" },
    { speaker: 'rene', text: "That's basically my LinkedIn headline" },
    { speaker: 'mikka', text: "Mine too. We should coordinate" },
    { speaker: 'rene', text: "Add it to the next board meeting agenda" },
  ],
];

// RF logo SVG using currentColor for fill
const RF_PATH = "m 0,0 c 0,7.6 6.179,13.779 13.77,13.779 7.6,0 13.779,-6.179 13.779,-13.779 0,-2.769 -2.238,-5.007 -4.998,-5.007 -2.761,0 -4.999,2.238 -4.999,5.007 0,2.078 -1.695,3.765 -3.782,3.765 C 11.693,3.765 9.997,2.078 9.997,0 9.997,-2.769 7.76,-5.007 4.999,-5.007 2.238,-5.007 0,-2.769 0,0 m 57.05,-23.153 c 0,-2.771 -2.237,-5.007 -4.998,-5.007 l -46.378,0 c -2.761,0 -4.999,2.236 -4.999,5.007 0,2.769 2.238,5.007 4.999,5.007 l 46.378,0 c 2.761,0 4.998,-2.238 4.998,-5.007 M 35.379,-2.805 c -1.545,2.291 -0.941,5.398 1.35,6.943 l 11.594,7.83 c 2.273,1.58 5.398,0.941 6.943,-1.332 1.545,-2.29 0.941,-5.398 -1.35,-6.943 l -11.594,-7.83 c -0.852,-0.586 -1.829,-0.87 -2.788,-0.87 -1.607,0 -3.187,0.781 -4.155,2.202 m 31.748,-30.786 c 0,-0.945 -0.376,-1.852 -1.045,-2.522 l -8.617,-8.617 c -0.669,-0.668 -1.576,-1.045 -2.523,-1.045 l -52.833,0 c -0.947,0 -1.854,0.377 -2.523,1.045 l -8.617,8.617 c -0.669,0.67 -1.045,1.577 -1.045,2.522 l 0,52.799 c 0,0.947 0.376,1.854 1.045,2.522 l 8.617,8.619 c 0.669,0.668 1.576,1.044 2.523,1.044 l 52.833,0 c 0.947,0 1.854,-0.376 2.523,-1.044 l 8.617,-8.619 c 0.669,-0.668 1.045,-1.575 1.045,-2.522 l 0,-52.799 z m 7.334,61.086 -11.25,11.25 c -1.705,1.705 -4.018,2.663 -6.428,2.663 l -56.523,0 c -2.412,0 -4.725,-0.959 -6.43,-2.665 L -17.412,27.494 c -1.704,-1.705 -2.661,-4.016 -2.661,-6.427 l 0,-56.515 c 0,-2.411 0.958,-4.725 2.663,-6.428 l 11.25,-11.25 c 1.705,-1.705 4.017,-2.662 6.428,-2.662 l 56.515,0 c 2.41,0 4.723,0.957 6.428,2.662 l 11.25,11.25 c 1.705,1.703 2.663,4.017 2.663,6.428 l 0,56.514 c 0,2.412 -0.958,4.724 -2.663,6.429";

function rfSvg(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 122.4325 122.34125" width="${size}" height="${size}">
  <g transform="matrix(1.25,0,0,-1.25,0,202.34125)">
    <g transform="translate(52.4477,88.1268)">
      <path fill="currentColor" d="${RF_PATH}"/>
    </g>
  </g>
</svg>`;
}

const RF_SVG = rfSvg(LOGO_SIZE);

// Amigurumi gnome SVG — cute crocheted style with pointy hat, round body, beard
function gnomeSvg(hatColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="${GNOME_W}" height="${GNOME_H}">
    <!-- Pointy hat -->
    <polygon points="12,0 3,16 21,16" fill="${hatColor}"/>
    <polygon points="12,0 3,16 21,16" fill="rgba(0,0,0,0.1)"/>
    <!-- Hat brim texture -->
    <ellipse cx="12" cy="16" rx="10" ry="2" fill="${hatColor}" />
    <!-- Face -->
    <circle cx="12" cy="19" r="7" fill="#f0cda8"/>
    <!-- Eyes (bead style) -->
    <circle cx="9.5" cy="18" r="1.2" fill="#111"/>
    <circle cx="14.5" cy="18" r="1.2" fill="#111"/>
    <circle cx="10" cy="17.5" r="0.4" fill="#fff"/>
    <circle cx="15" cy="17.5" r="0.4" fill="#fff"/>
    <!-- Nose -->
    <circle cx="12" cy="20" r="1.5" fill="#e8b88a"/>
    <!-- Beard -->
    <ellipse cx="12" cy="25" rx="7" ry="5" fill="#f5f0e8"/>
    <ellipse cx="12" cy="26" rx="5.5" ry="4" fill="#fff"/>
    <!-- Body -->
    <rect x="5" y="28" width="14" height="7" rx="4" fill="#5c3a1e"/>
    <!-- Feet -->
    <ellipse cx="8" cy="36" rx="3.5" ry="2.5" fill="#4a2e14"/>
    <ellipse cx="16" cy="36" rx="3.5" ry="2.5" fill="#4a2e14"/>
  </svg>`;
}

// Pekka Klärck — light brown hair, clean-shaven, olive/brown shirt
function pekkaSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="${GNOME_W}" height="${GNOME_H}">
    <!-- Hair -->
    <ellipse cx="12" cy="10" rx="7" ry="7.5" fill="#a67b4f"/>
    <rect x="5" y="10" width="14" height="4" fill="#a67b4f" rx="1"/>
    <!-- Face -->
    <ellipse cx="12" cy="14" rx="6" ry="6.5" fill="#f0cda8"/>
    <!-- Eyes -->
    <ellipse cx="9.5" cy="13" rx="1" ry="1.2" fill="#3a5a3a"/>
    <ellipse cx="14.5" cy="13" rx="1" ry="1.2" fill="#3a5a3a"/>
    <circle cx="10" cy="12.6" r="0.4" fill="#fff"/>
    <circle cx="15" cy="12.6" r="0.4" fill="#fff"/>
    <!-- Nose & mouth -->
    <ellipse cx="12" cy="15.5" rx="1.2" ry="0.8" fill="#e8b88a"/>
    <path d="M10 17.5 Q12 19 14 17.5" stroke="#c4956a" stroke-width="0.5" fill="none"/>
    <!-- Shirt -->
    <rect x="5" y="21" width="14" height="10" rx="3" fill="#7a6532"/>
    <!-- Arms -->
    <rect x="2" y="22" width="4" height="7" rx="2" fill="#7a6532"/>
    <rect x="18" y="22" width="4" height="7" rx="2" fill="#7a6532"/>
    <!-- Hands -->
    <circle cx="4" cy="30" r="1.8" fill="#f0cda8"/>
    <circle cx="20" cy="30" r="1.8" fill="#f0cda8"/>
    <!-- Pants -->
    <rect x="6" y="30" width="5" height="6" rx="2" fill="#2c2c3a"/>
    <rect x="13" y="30" width="5" height="6" rx="2" fill="#2c2c3a"/>
    <!-- Shoes -->
    <ellipse cx="8.5" cy="37" rx="3" ry="1.8" fill="#3a3a3a"/>
    <ellipse cx="15.5" cy="37" rx="3" ry="1.8" fill="#3a3a3a"/>
  </svg>`;
}

// René Rohner — dark hair with bun, dark beard, dark shirt/jacket
function reneSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="${GNOME_W}" height="${GNOME_H}">
    <!-- Hair -->
    <ellipse cx="12" cy="10" rx="7" ry="7.5" fill="#2a1f14"/>
    <rect x="5" y="10" width="14" height="4" fill="#2a1f14" rx="1"/>
    <!-- Bun -->
    <circle cx="12" cy="3.5" r="3.5" fill="#2a1f14"/>
    <!-- Face -->
    <ellipse cx="12" cy="14" rx="6" ry="6.5" fill="#e8c49a"/>
    <!-- Eyes -->
    <ellipse cx="9.5" cy="13" rx="1" ry="1.2" fill="#2a3a4a"/>
    <ellipse cx="14.5" cy="13" rx="1" ry="1.2" fill="#2a3a4a"/>
    <circle cx="10" cy="12.6" r="0.4" fill="#fff"/>
    <circle cx="15" cy="12.6" r="0.4" fill="#fff"/>
    <!-- Nose -->
    <ellipse cx="12" cy="15.5" rx="1.2" ry="0.8" fill="#d4a876"/>
    <!-- Beard -->
    <ellipse cx="12" cy="18.5" rx="5" ry="3.5" fill="#2a1f14"/>
    <ellipse cx="12" cy="18" rx="4" ry="2.5" fill="#3a2a1e"/>
    <!-- Jacket -->
    <rect x="4" y="21" width="16" height="10" rx="3" fill="#1a1a2e"/>
    <!-- Shirt collar -->
    <polygon points="10,21 12,24 14,21" fill="#2a2a3e"/>
    <!-- Arms -->
    <rect x="1" y="22" width="4" height="7" rx="2" fill="#1a1a2e"/>
    <rect x="19" y="22" width="4" height="7" rx="2" fill="#1a1a2e"/>
    <!-- Hands -->
    <circle cx="3" cy="30" r="1.8" fill="#e8c49a"/>
    <circle cx="21" cy="30" r="1.8" fill="#e8c49a"/>
    <!-- Pants -->
    <rect x="6" y="30" width="5" height="6" rx="2" fill="#15152a"/>
    <rect x="13" y="30" width="5" height="6" rx="2" fill="#15152a"/>
    <!-- Shoes -->
    <ellipse cx="8.5" cy="37" rx="3" ry="1.8" fill="#1a1a1a"/>
    <ellipse cx="15.5" cy="37" rx="3" ry="1.8" fill="#1a1a1a"/>
  </svg>`;
}

// Mikka Solmela — light brown hair styled up, glasses, short beard, pink/red hoodie over black tee
function mikkaSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="${GNOME_W}" height="${GNOME_H}">
    <!-- Hair (styled up) -->
    <ellipse cx="12" cy="9" rx="7" ry="7" fill="#b8935a"/>
    <ellipse cx="12" cy="5.5" rx="5" ry="3.5" fill="#c4a060"/>
    <rect x="5" y="10" width="14" height="3" fill="#b8935a" rx="1"/>
    <!-- Face -->
    <ellipse cx="12" cy="14" rx="6" ry="6.5" fill="#f0cda8"/>
    <!-- Glasses -->
    <rect x="7" y="11.5" rx="1.5" ry="1.5" width="4.5" height="3.5" fill="none" stroke="#c0a888" stroke-width="0.6"/>
    <rect x="12.5" y="11.5" rx="1.5" ry="1.5" width="4.5" height="3.5" fill="none" stroke="#c0a888" stroke-width="0.6"/>
    <line x1="11.5" y1="13" x2="12.5" y2="13" stroke="#c0a888" stroke-width="0.5"/>
    <!-- Eyes (behind glasses) -->
    <ellipse cx="9.3" cy="13.2" rx="0.9" ry="1" fill="#3a4a3a"/>
    <ellipse cx="14.7" cy="13.2" rx="0.9" ry="1" fill="#3a4a3a"/>
    <circle cx="9.7" cy="12.8" r="0.35" fill="#fff"/>
    <circle cx="15.1" cy="12.8" r="0.35" fill="#fff"/>
    <!-- Nose -->
    <ellipse cx="12" cy="15.5" rx="1.1" ry="0.7" fill="#e8b88a"/>
    <!-- Smile -->
    <path d="M9.5 17 Q12 19.5 14.5 17" stroke="#c4956a" stroke-width="0.6" fill="none"/>
    <!-- Beard (short) -->
    <ellipse cx="12" cy="18" rx="4.5" ry="2.5" fill="#9a7a50"/>
    <ellipse cx="12" cy="17.5" rx="3.5" ry="1.8" fill="#aa8a5a"/>
    <!-- Hoodie (pink/red) -->
    <rect x="4" y="21" width="16" height="10" rx="3" fill="#e8365d"/>
    <!-- Hood outline -->
    <path d="M5 21 Q4 19 6 18" stroke="#d02a50" stroke-width="0.8" fill="none"/>
    <path d="M19 21 Q20 19 18 18" stroke="#d02a50" stroke-width="0.8" fill="none"/>
    <!-- Black tee underneath -->
    <rect x="8" y="21" width="8" height="4" rx="1" fill="#1a1a1a"/>
    <!-- Arms -->
    <rect x="1" y="22" width="4" height="7" rx="2" fill="#e8365d"/>
    <rect x="19" y="22" width="4" height="7" rx="2" fill="#e8365d"/>
    <!-- Hands -->
    <circle cx="3" cy="30" r="1.8" fill="#f0cda8"/>
    <circle cx="21" cy="30" r="1.8" fill="#f0cda8"/>
    <!-- Pants -->
    <rect x="6" y="30" width="5" height="6" rx="2" fill="#2c2c3a"/>
    <rect x="13" y="30" width="5" height="6" rx="2" fill="#2c2c3a"/>
    <!-- Shoes -->
    <ellipse cx="8.5" cy="37" rx="3" ry="1.8" fill="#3a3a3a"/>
    <ellipse cx="15.5" cy="37" rx="3" ry="1.8" fill="#3a3a3a"/>
  </svg>`;
}

interface FlyingStar {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  el: HTMLDivElement;
}

interface FallenLogo {
  id: number;
  body: Matter.Body;
  el: HTMLDivElement;
  glowing: boolean;
}

interface Gnome {
  x: number;
  direction: number; // 1 = right, -1 = left
  body: Matter.Body;
  el: HTMLDivElement;
  frame: number;
  bubbleEl: HTMLDivElement | null;
  eating: boolean;
  eatFrame: number;
  eatCooldown: number;
  superSaiyan: boolean;
  superSaiyanFrame: number;
  shootFrame: number;
}

interface Person {
  name: 'pekka' | 'rene' | 'mikka';
  x: number;
  direction: number;
  el: HTMLDivElement;
  frame: number;
  bubbleEl: HTMLDivElement | null;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  el: HTMLDivElement;
  willHit: boolean;
  targetId: number;
  age: number;
}

export function ShootingStars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const params = new URLSearchParams(window.location.search);
    const timeBoost = Math.max(1, parseFloat(params.get("timeboost") || "1") || 1);

    // --- matter.js setup ---
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.8 } });
    const wallThickness = 40;

    const ground = Matter.Bodies.rectangle(
      w / 2, h + wallThickness / 2, w + 200, wallThickness,
      { isStatic: true }
    );
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2, h / 2, wallThickness, h * 2,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      w + wallThickness / 2, h / 2, wallThickness, h * 2,
      { isStatic: true }
    );
    Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

    // --- State ---
    const flyingStars: FlyingStar[] = [];
    const fallenLogos: FallenLogo[] = [];
    const projectiles: Projectile[] = [];
    let nextId = 0;

    // --- DOM element creation ---
    function createStarElement(isFallen: boolean): HTMLDivElement {
      const el = document.createElement("div");
      el.className = isFallen ? "fallen-logo" : "shooting-star";

      if (!isFallen) {
        const tail = document.createElement("div");
        tail.className = "shooting-star-tail";
        el.appendChild(tail);
      }

      const logoContainer = document.createElement("div");
      logoContainer.innerHTML = RF_SVG;
      el.appendChild(logoContainer);

      container!.appendChild(el);
      return el;
    }

    // --- Create sparks at impact point ---
    function createSparks(x: number, y: number) {
      const colors = ["#00c0b5", "#2ecbc2", "#bbc446", "#ffffff"];

      for (let i = 0; i < SPARK_COUNT; i++) {
        const spark = document.createElement("div");
        spark.className = "spark";

        const sparkAngle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        const dx = Math.cos(sparkAngle) * distance;
        const dy = Math.sin(sparkAngle) * distance;

        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2 + Math.random() * 2;

        spark.style.cssText = `
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          box-shadow: 0 0 4px ${color};
          --spark-dx: ${dx}px;
          --spark-dy: ${dy}px;
          animation-duration: ${0.3 + Math.random() * 0.4}s;
        `;

        container!.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
      }
    }

    // --- Spawn a shooting star ---
    function spawnStar() {
      const id = nextId++;

      const goingRight = Math.random() > 0.5;
      const fromTop = Math.random() > 0.3;
      let x: number, y: number;
      if (fromTop) {
        x = goingRight ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5;
        y = -LOGO_SIZE;
      } else {
        x = goingRight ? -LOGO_SIZE : w + LOGO_SIZE;
        y = Math.random() * h * 0.4;
      }

      const baseAngleDeg = 30 + Math.random() * 30;
      const angleDeg = goingRight ? baseAngleDeg : 180 - baseAngleDeg;
      const angleRad = (angleDeg * Math.PI) / 180;
      const speed = 3 + Math.random() * 3;

      const el = createStarElement(false);

      flyingStars.push({
        id, x, y,
        vx: Math.cos(angleRad) * speed,
        vy: Math.sin(angleRad) * speed,
        angle: angleDeg,
        el,
      });
    }

    // --- Impact: sparks + convert to fallen physics body ---
    function impactStar(star: FlyingStar, glowing: boolean = false) {
      const impactX = Math.max(LOGO_SIZE / 2, Math.min(star.x, w - LOGO_SIZE / 2));
      const impactY = Math.min(star.y, h - LOGO_SIZE / 2);

      createSparks(impactX, impactY);
      star.el.remove();

      const idx = flyingStars.indexOf(star);
      if (idx !== -1) flyingStars.splice(idx, 1);

      const body = Matter.Bodies.rectangle(impactX, impactY, LOGO_SIZE, LOGO_SIZE, {
        restitution: 0.3,
        friction: 0.8,
        angle: (Math.random() - 0.5) * 1,
        density: 0.001,
      });
      Matter.Composite.add(engine.world, [body]);

      const el = createStarElement(true);
      if (glowing) el.classList.add("fallen-logo-glowing");
      fallenLogos.push({ id: star.id, body, el, glowing });
      capFallenLogos();
    }

    // --- Cap fallen logos ---
    function capFallenLogos() {
      while (fallenLogos.length > MAX_FALLEN) {
        const oldest = fallenLogos.shift()!;
        oldest.el.classList.add("fallen-logo-fading");
        const bodyToRemove = oldest.body;
        const elToRemove = oldest.el;
        setTimeout(() => {
          elToRemove.remove();
          Matter.Composite.remove(engine.world, bodyToRemove);
        }, 2000);
      }
    }

    // --- Split star into fragments (shot hit) ---
    function splitStar(star: FlyingStar) {
      createSparks(star.x, star.y);
      star.el.remove();

      const idx = flyingStars.indexOf(star);
      if (idx !== -1) flyingStars.splice(idx, 1);

      const fragmentCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
      for (let i = 0; i < fragmentCount; i++) {
        const body = Matter.Bodies.rectangle(
          star.x + (Math.random() - 0.5) * 10,
          star.y + (Math.random() - 0.5) * 10,
          FRAGMENT_SIZE, FRAGMENT_SIZE,
          {
            restitution: 0.4,
            friction: 0.6,
            angle: Math.random() * Math.PI * 2,
            density: 0.0005,
          }
        );
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 4,
          y: -2 + Math.random() * 2,
        });
        Matter.Composite.add(engine.world, [body]);

        const el = document.createElement("div");
        el.className = "fallen-logo fallen-logo-fragment";
        const logoContainer = document.createElement("div");
        logoContainer.innerHTML = rfSvg(FRAGMENT_SIZE);
        el.appendChild(logoContainer);
        container!.appendChild(el);

        fallenLogos.push({ id: nextId++, body, el, glowing: false });
      }
      capFallenLogos();
    }

    // --- Gnomes setup ---
    function createGnome(hatColor: string, startX: number, direction: number): Gnome {
      // Physics body — static, moved manually to push fallen logos
      const gnomeY = h - GNOME_H / 2;
      const body = Matter.Bodies.rectangle(startX, gnomeY, GNOME_W, GNOME_H, {
        isStatic: true,
        friction: 0.5,
        restitution: 0,
      });
      Matter.Composite.add(engine.world, [body]);

      // DOM element
      const el = document.createElement("div");
      el.className = "gnome";
      el.innerHTML = gnomeSvg(hatColor);
      container!.appendChild(el);

      return { x: startX, direction, body, el, frame: 0, bubbleEl: null, eating: false, eatFrame: 0, eatCooldown: 0, superSaiyan: false, superSaiyanFrame: 0, shootFrame: 0 };
    }

    // Show a speech bubble above a gnome
    function showBubble(gnome: Gnome, customMsg?: string, duration: number = BUBBLE_DURATION_MS, mega: boolean = false, shiny: boolean = false) {
      // Remove existing bubble if any
      if (gnome.bubbleEl) gnome.bubbleEl.remove();

      const msg = customMsg || GNOME_MESSAGES[Math.floor(Math.random() * GNOME_MESSAGES.length)];
      const bubble = document.createElement("div");
      const classes = ["gnome-bubble"];
      if (mega) classes.push("gnome-bubble-mega");
      if (shiny) classes.push("gnome-bubble-shiny");
      bubble.className = classes.join(" ");
      bubble.textContent = msg;
      container!.appendChild(bubble);
      gnome.bubbleEl = bubble;

      // Fade out and remove after duration
      setTimeout(() => {
        bubble.classList.add("gnome-bubble-fading");
        setTimeout(() => {
          bubble.remove();
          if (gnome.bubbleEl === bubble) gnome.bubbleEl = null;
        }, 1000);
      }, duration);
    }

    // --- Person setup (Pekka & René) ---
    function createPerson(name: Person['name'], svgFn: () => string, startX: number, direction: number): Person {
      const el = document.createElement("div");
      el.className = "gnome"; // reuse gnome positioning
      el.innerHTML = svgFn();
      container!.appendChild(el);
      return { name, x: startX, direction, el, frame: 0, bubbleEl: null };
    }

    function showPersonBubble(person: Person, text: string, duration: number = CONVO_BUBBLE_DURATION_MS) {
      if (person.bubbleEl) person.bubbleEl.remove();
      const bubble = document.createElement("div");
      bubble.className = `gnome-bubble person-bubble-${person.name}`;
      const displayName = { pekka: 'Pekka', rene: 'René', mikka: 'Mikka' }[person.name];
      bubble.innerHTML = `<span class="person-bubble-name">${displayName}:</span> ${text}`;
      container!.appendChild(bubble);
      person.bubbleEl = bubble;
      setTimeout(() => {
        bubble.classList.add("gnome-bubble-fading");
        setTimeout(() => {
          bubble.remove();
          if (person.bubbleEl === bubble) person.bubbleEl = null;
        }, 1000);
      }, duration);
    }

    // Two gnomes: red hat starts left, green hat starts right
    const gnomes: Gnome[] = [
      createGnome("#cc4444", w * 0.25, 1),
      createGnome("#4a8c3f", w * 0.75, -1),
    ];

    // Three persons: Pekka left, Mikka center, René right
    const persons: Person[] = [
      createPerson('pekka', pekkaSvg, w * 0.10, 1),
      createPerson('mikka', mikkaSvg, w * 0.50, -1),
      createPerson('rene', reneSvg, w * 0.90, -1),
    ];

    // --- Bubble timer ---
    let bubbleTimerId: ReturnType<typeof setTimeout>;
    let singing = false;

    function scheduleBubble() {
      const delay = (BUBBLE_MIN_MS + Math.random() * (BUBBLE_MAX_MS - BUBBLE_MIN_MS)) / timeBoost;
      bubbleTimerId = setTimeout(() => {
        if (!singing) {
          const gnome = gnomes[Math.floor(Math.random() * gnomes.length)];
          showBubble(gnome);
        }
        scheduleBubble();
      }, delay);
    }

    // First bubble sooner
    bubbleTimerId = setTimeout(() => {
      if (!singing) showBubble(gnomes[0]);
      scheduleBubble();
    }, (5000 + Math.random() * 5000) / timeBoost);

    // --- Song timer ---
    let songTimerId: ReturnType<typeof setTimeout>;
    const songTimeouts: ReturnType<typeof setTimeout>[] = [];
    let lastSongIdx = -1;

    function playSong() {
      // Don't sing while eating
      if (gnomes[0].eating || gnomes[1].eating) {
        songTimerId = setTimeout(playSong, 5000 / timeBoost);
        return;
      }

      singing = true;

      // Pick a song (avoid repeating the last one)
      let idx = Math.floor(Math.random() * SONGS.length);
      if (idx === lastSongIdx && SONGS.length > 1) idx = (idx + 1) % SONGS.length;
      lastSongIdx = idx;
      const song = SONGS[idx];

      // Schedule each line
      song.forEach((line, i) => {
        const tid = setTimeout(() => {
          showBubble(gnomes[line.gnome], line.text, 2000);
        }, i * SONG_LINE_MS);
        songTimeouts.push(tid);
      });

      // End of song
      const endTid = setTimeout(() => {
        singing = false;
        scheduleSong();
      }, song.length * SONG_LINE_MS + 1000);
      songTimeouts.push(endTid);
    }

    function scheduleSong() {
      songTimerId = setTimeout(playSong, SONG_INTERVAL_MS / timeBoost);
    }

    // First song after 30-60s
    songTimerId = setTimeout(playSong, (30000 + Math.random() * 30000) / timeBoost);

    // --- Person conversation timer ---
    const personConvoTimeouts: ReturnType<typeof setTimeout>[] = [];
    let lastConvoIdx = -1;

    function playConversation() {
      let idx = Math.floor(Math.random() * CONVERSATIONS.length);
      if (idx === lastConvoIdx && CONVERSATIONS.length > 1) idx = (idx + 1) % CONVERSATIONS.length;
      lastConvoIdx = idx;
      const convo = CONVERSATIONS[idx];

      convo.forEach((line, i) => {
        const tid = setTimeout(() => {
          const person = persons.find(p => p.name === line.speaker)!;
          showPersonBubble(person, line.text);
        }, (i * CONVO_LINE_MS) / timeBoost);
        personConvoTimeouts.push(tid);
      });

      const endTid = setTimeout(() => {
        scheduleConversation();
      }, (convo.length * CONVO_LINE_MS + 1000) / timeBoost);
      personConvoTimeouts.push(endTid);
    }

    function scheduleConversation() {
      const tid = setTimeout(playConversation, CONVO_INTERVAL_MS / timeBoost);
      personConvoTimeouts.push(tid);
    }

    // First conversation after 15-25s
    const firstConvoTid = setTimeout(playConversation, (15000 + Math.random() * 10000) / timeBoost);
    personConvoTimeouts.push(firstConvoTid);

    // --- Animation loop ---
    let frameId: number;
    function update() {
      // Update flying stars
      for (let i = flyingStars.length - 1; i >= 0; i--) {
        const star = flyingStars[i];
        star.x += star.vx;
        star.y += star.vy;

        star.el.style.transform = `translate(${star.x}px, ${star.y}px) rotate(${star.angle}deg)`;

        const hitRight = star.vx > 0 && star.x + LOGO_SIZE >= w - EDGE_MARGIN;
        const hitLeft = star.vx < 0 && star.x <= EDGE_MARGIN;
        const hitBottom = star.y + LOGO_SIZE >= h - EDGE_MARGIN;

        if (hitRight || hitLeft) {
          // Bounce off wall — reverse horizontal, add sparks
          star.vx = -star.vx;
          star.angle = 180 - star.angle;
          star.x = hitRight ? w - EDGE_MARGIN - LOGO_SIZE : EDGE_MARGIN + 1;
          createSparks(hitRight ? w - EDGE_MARGIN : EDGE_MARGIN, star.y);
        } else if (hitBottom) {
          impactStar(star, true);
        }
      }

      // Check if gnomes should sit down and eat pancakes
      const g0 = gnomes[0];
      const g1 = gnomes[1];
      const gnomeDistance = Math.abs(g0.x - g1.x);

      if (!g0.eating && !g1.eating && !g0.superSaiyan && !g1.superSaiyan && g0.eatCooldown <= 0 && g1.eatCooldown <= 0 && gnomeDistance < GNOME_MEET_DISTANCE) {
        // Sit down and eat pancakes!
        g0.eating = true;
        g1.eating = true;
        g0.eatFrame = 0;
        g1.eatFrame = 0;

        // Spawn pancake plate between them
        const midX = (g0.x + g1.x) / 2;
        const plate = document.createElement("div");
        plate.className = "gnome-pancake-plate";
        plate.textContent = "🥞";
        plate.style.left = `${midX}px`;
        plate.style.top = `${h - 20}px`;
        container!.appendChild(plate);
        setTimeout(() => plate.remove(), (PANCAKE_DURATION / FPS) * 1000 + 500);

        // Shiny pancake bubble on both gnomes
        const pancakeMessages = ["nom nom, wow pancakes from Kelby! 🥞✨", "mmm Kelby's pancakes! 🥞"];
        showBubble(g0, pancakeMessages[0], (PANCAKE_DURATION / FPS) * 1000, false, true);
        setTimeout(() => showBubble(g1, pancakeMessages[1], (PANCAKE_DURATION / FPS) * 800, false, true), 600);

        // Floating yum reactions
        const yums = ["😋", "🤤", "✨", "💛"];
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const yum = document.createElement("div");
            yum.className = "gnome-note";
            yum.textContent = yums[i];
            yum.style.left = `${midX + (Math.random() - 0.5) * 30}px`;
            yum.style.top = `${h - GNOME_H - 10}px`;
            container!.appendChild(yum);
            setTimeout(() => yum.remove(), 2000);
          }, i * 800);
        }
      }

      // Update gnomes
      for (const gnome of gnomes) {
        gnome.frame++;
        const gnomeY = h - GNOME_H / 2;
        const otherGnome = gnome === g0 ? g1 : g0;

        if (gnome.eating) {
          gnome.eatFrame++;

          // Sitting down — gnome lowers and stays still, slight munching bob
          const munchBob = Math.sin(gnome.eatFrame * 0.6) * 1.5;
          const sitOffset = 6; // lower to "sit"
          const gnomeVisualY = gnomeY - GNOME_H / 2 + sitOffset + munchBob;

          // Face each other while eating
          const faceDir = gnome === g0 ? (g1.x > g0.x ? 1 : -1) : (g0.x > g1.x ? 1 : -1);
          gnome.el.style.transform = `translate(${gnome.x - GNOME_W / 2}px, ${gnomeVisualY}px) scaleX(${faceDir})`;

          // Keep physics body in place
          Matter.Body.setPosition(gnome.body, { x: gnome.x, y: gnomeY });
          Matter.Body.setVelocity(gnome.body, { x: 0, y: 0 });

          // Position bubble — stagger if other gnome or person has a bubble nearby
          if (gnome.bubbleEl) {
            const bubbleY = gnomeVisualY - 30;
            let gnomeBubbleOffset = 0;
            if (otherGnome.bubbleEl && Math.abs(otherGnome.x - gnome.x) < 160 && gnome === g1) {
              gnomeBubbleOffset += otherGnome.bubbleEl.offsetHeight + 6;
            }
            for (const p of persons) {
              if (p.bubbleEl && Math.abs(p.x - gnome.x) < 160) {
                gnomeBubbleOffset += p.bubbleEl.offsetHeight + 6;
              }
            }
            gnome.bubbleEl.style.left = `${gnome.x}px`;
            gnome.bubbleEl.style.top = `${bubbleY - gnomeBubbleOffset}px`;
          }

          // End eating after duration
          if (gnome.eatFrame >= PANCAKE_DURATION) {
            gnome.eating = false;
            gnome.eatCooldown = PANCAKE_COOLDOWN;
            // Reverse direction after eating
            gnome.direction = gnome === g0 ? -1 : 1;
          }
        } else {
          if (gnome.eatCooldown > 0) gnome.eatCooldown--;

          // Super saiyan timer
          if (gnome.superSaiyan) {
            gnome.superSaiyanFrame++;
            if (gnome.superSaiyanFrame >= SUPER_SAIYAN_DURATION) {
              gnome.superSaiyan = false;
              gnome.el.classList.remove("gnome-super-saiyan");
            }
          }

          const speedMult = gnome.superSaiyan ? SUPER_SAIYAN_SPEED_MULT : 1;
          const scaleMult = gnome.superSaiyan ? SUPER_SAIYAN_SCALE : 1;
          gnome.x += GNOME_SPEED * gnome.direction * speedMult;

          // Turn around at edges
          if (gnome.x >= w - GNOME_MARGIN) {
            gnome.direction = -1;
          } else if (gnome.x <= GNOME_MARGIN) {
            gnome.direction = 1;
          }

          // Move physics body — this pushes fallen logos
          Matter.Body.setPosition(gnome.body, { x: gnome.x, y: gnomeY });
          Matter.Body.setVelocity(gnome.body, { x: GNOME_SPEED * gnome.direction * 2 * speedMult, y: 0 });

          // Super saiyan: explosive push on nearby fallen logos
          if (gnome.superSaiyan) {
            for (const logo of fallenLogos) {
              const { x: lx, y: ly } = logo.body.position;
              const dx = lx - gnome.x;
              const dy = ly - gnomeY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 60 && dist > 5) {
                const force = 0.003;
                Matter.Body.applyForce(logo.body, logo.body.position, {
                  x: (dx / dist) * force * gnome.direction,
                  y: -force * 0.5,
                });
              }
            }
          }

          // Pick up glowing logos → super saiyan
          if (!gnome.superSaiyan) {
            for (let li = fallenLogos.length - 1; li >= 0; li--) {
              const logo = fallenLogos[li];
              if (!logo.glowing) continue;
              const { x: lx, y: ly } = logo.body.position;
              const dx = gnome.x - lx;
              const dy = gnomeY - ly;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 35) {
                // Eat the glowing logo — go super saiyan!
                gnome.superSaiyan = true;
                gnome.superSaiyanFrame = 0;
                gnome.el.classList.add("gnome-super-saiyan");
                logo.el.remove();
                Matter.Composite.remove(engine.world, logo.body);
                fallenLogos.splice(li, 1);
                createSparks(lx, ly);
                break;
              }
            }
          }

          // Bobbing walk animation
          const bob = Math.sin(gnome.frame * 0.15) * (gnome.superSaiyan ? 4 : 2);
          const scaleX = gnome.direction >= 0 ? 1 : -1;
          const gnomeVisualY = gnomeY - (GNOME_H * scaleMult) / 2 + bob;

          gnome.el.style.transform = `translate(${gnome.x - (GNOME_W * scaleMult) / 2}px, ${gnomeVisualY}px) scale(${scaleX * scaleMult}, ${scaleMult})`;

          // Position bubble above gnome — stagger if other gnome or person has bubble nearby
          if (gnome.bubbleEl) {
            const bubbleY = gnomeVisualY - 30;
            let gnomeBubbleOffset = 0;
            if (otherGnome.bubbleEl && Math.abs(otherGnome.x - gnome.x) < 160 && gnome === g1) {
              gnomeBubbleOffset += otherGnome.bubbleEl.offsetHeight + 6;
            }
            for (const p of persons) {
              if (p.bubbleEl && Math.abs(p.x - gnome.x) < 160) {
                gnomeBubbleOffset += p.bubbleEl.offsetHeight + 6;
              }
            }
            gnome.bubbleEl.style.left = `${gnome.x}px`;
            gnome.bubbleEl.style.top = `${bubbleY - gnomeBubbleOffset}px`;
          }
        }
      }

      // --- Update persons (Pekka & René) ---
      for (const person of persons) {
        person.frame++;
        const personY = h - GNOME_H / 2;

        // Simple walk
        person.x += PERSON_SPEED * person.direction;

        // Turn around at edges
        if (person.x >= w - PERSON_MARGIN) {
          person.direction = -1;
        } else if (person.x <= PERSON_MARGIN) {
          person.direction = 1;
        }

        // Bobbing animation
        const bob = Math.sin(person.frame * 0.12) * 1.5;
        const scaleX = person.direction >= 0 ? 1 : -1;
        const personVisualY = personY - GNOME_H / 2 + bob;

        person.el.style.transform = `translate(${person.x - GNOME_W / 2}px, ${personVisualY}px) scaleX(${scaleX})`;

        // Position bubble above person, clamped to screen, staggered if overlapping
        if (person.bubbleEl) {
          const bw = person.bubbleEl.offsetWidth;
          const clampedX = Math.max(bw / 2 + 4, Math.min(person.x, w - bw / 2 - 4));
          // Stack above any nearby bubbles from other persons or gnomes
          let staggerOffset = 0;
          for (const other of persons) {
            if (other === person) break;
            if (other.bubbleEl && Math.abs(other.x - person.x) < 160) {
              staggerOffset += other.bubbleEl.offsetHeight + 6;
            }
          }
          for (const gnome of gnomes) {
            if (gnome.bubbleEl && Math.abs(gnome.x - person.x) < 160) {
              staggerOffset += gnome.bubbleEl.offsetHeight + 6;
            }
          }
          person.bubbleEl.style.left = `${clampedX}px`;
          person.bubbleEl.style.top = `${personVisualY - 30 - staggerOffset}px`;
        }
      }

      // --- Both gnomes shooting ---
      for (const shooter of gnomes) {
        if (shooter.eating || flyingStars.length === 0) continue;
        shooter.shootFrame++;
        if (shooter.shootFrame < SHOOT_INTERVAL) continue;
        shooter.shootFrame = 0;

        // Find closest flying star in bottom 40% of screen
        let closest: FlyingStar | null = null;
        let closestDist = Infinity;
        const gnomeTopY = h - GNOME_H;
        const shootZoneTop = h * 0.6; // only target stars below 60% from top
        for (const star of flyingStars) {
          if (star.y < shootZoneTop) continue;
          const dx = star.x - shooter.x;
          const dy = star.y - gnomeTopY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closest = star;
          }
        }

        if (!closest) continue;

        if (shooter.superSaiyan) {
          // Gold laser — instant hit, always connects
          const gnomeTopY2 = h - GNOME_H;
          const dx = closest.x - shooter.x;
          const dy = closest.y - gnomeTopY2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          // Create laser beam element
          const laser = document.createElement("div");
          laser.className = "gnome-laser";
          laser.style.left = `${shooter.x}px`;
          laser.style.top = `${gnomeTopY2}px`;
          laser.style.width = `${dist}px`;
          laser.style.transform = `rotate(${angle}rad)`;
          container!.appendChild(laser);
          setTimeout(() => laser.remove(), 300);

          // Instant hit — split the star
          splitStar(closest);
        } else {
          // Normal projectile
          const willHit = Math.random() < HIT_CHANCE;
          const gnomeTopY2 = h - GNOME_H;
          const dx = closest.x - shooter.x;
          const dy = closest.y - gnomeTopY2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let vx = (dx / dist) * PROJECTILE_SPEED;
          let vy = (dy / dist) * PROJECTILE_SPEED;

          if (!willHit) {
            const offsetAngle = ((Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 20) * Math.PI) / 180;
            const cos = Math.cos(offsetAngle);
            const sin = Math.sin(offsetAngle);
            const nvx = vx * cos - vy * sin;
            const nvy = vx * sin + vy * cos;
            vx = nvx;
            vy = nvy;
          }

          const angle = Math.atan2(vy, vx);
          const el = document.createElement("div");
          el.className = "gnome-projectile";
          container!.appendChild(el);

          projectiles.push({
            x: shooter.x,
            y: gnomeTopY2,
            vx, vy, angle,
            el,
            willHit,
            targetId: closest.id,
            age: 0,
          });
        }
      }

      // --- Update projectiles ---
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.age++;

        proj.el.style.transform = `translate(${proj.x - 2}px, ${proj.y - 2}px) rotate(${proj.angle}rad)`;

        let remove = false;

        if (proj.willHit) {
          const target = flyingStars.find(s => s.id === proj.targetId);
          if (target) {
            const dx = target.x - proj.x;
            const dy = target.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Direct homing — always steer toward target
            if (dist > 0) {
              proj.vx = (dx / dist) * PROJECTILE_SPEED;
              proj.vy = (dy / dist) * PROJECTILE_SPEED;
              proj.angle = Math.atan2(proj.vy, proj.vx);
            }

            if (dist < 20) {
              splitStar(target);
              remove = true;
            }
          } else {
            // Target already gone (hit edge)
            remove = true;
          }
        }

        // Remove if off-screen or too old
        if (proj.x < -20 || proj.x > w + 20 || proj.y < -20 || proj.y > h + 20 || proj.age > 120) {
          remove = true;
        }

        if (remove) {
          proj.el.remove();
          projectiles.splice(i, 1);
        }
      }

      // Step physics
      Matter.Engine.update(engine, 1000 / FPS);

      // Sync fallen logos
      for (const logo of fallenLogos) {
        const { x, y } = logo.body.position;
        const angle = logo.body.angle;
        logo.el.style.transform = `translate(${x - LOGO_SIZE / 2}px, ${y - LOGO_SIZE / 2}px) rotate(${angle}rad)`;
      }

      frameId = requestAnimationFrame(update);
    }
    frameId = requestAnimationFrame(update);

    // --- Spawn timer ---
    let spawnTimerId: ReturnType<typeof setTimeout>;

    function scheduleSpawn() {
      const delay = (SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS)) / timeBoost;
      spawnTimerId = setTimeout(() => {
        spawnStar();
        scheduleSpawn();
      }, delay);
    }

    spawnTimerId = setTimeout(() => {
      spawnStar();
      scheduleSpawn();
    }, (2000 + Math.random() * 3000) / timeBoost);

    // --- Handle resize ---
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      Matter.Body.setPosition(ground, { x: w / 2, y: h + wallThickness / 2 });
      Matter.Body.setPosition(rightWall, { x: w + wallThickness / 2, y: h / 2 });
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(spawnTimerId);
      clearTimeout(bubbleTimerId);
      clearTimeout(songTimerId);
      songTimeouts.forEach(clearTimeout);
      personConvoTimeouts.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
      Matter.Engine.clear(engine);
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    />
  );
}
