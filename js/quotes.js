const Quotes = (() => {
  const DECK_KEY = "sudoku-quote-deck";

  const AUTHOR_CIRCA = {
    "Marcus Aurelius": "c. 121–180",
    Seneca: "c. 4 BC–65 AD",
    Epictetus: "c. 50–135",
    Socrates: "c. 470–399 BC",
    Plato: "c. 428–348 BC",
    "Dalai Lama": "b. 1935",
    Buddha: "c. 563–483 BC",
    "Ram Dass": "1931–2019",
    "Lao Tzu": "c. 6th century BC",
    Confucius: "c. 551–479 BC",
    "Eleanor Roosevelt": "1884–1962",
    "Dean Inge": "1860–1954",
    "Mark Twain": "1835–1910",
    "Leonardo da Vinci": "1452–1519",
    "Thich Nhat Hanh": "1926–2022",
    Rumi: "1207–1273",
    "Mary Anne Radmacher": "b. 1955",
    "Deepak Chopra": "b. 1946",
    "Jon Kabat-Zinn": "b. 1944",
    "Caroline Myss": "b. 1952",
    "Ma Jaya Sati Bhagavati": "1940–2012",
    "Jean-Jacques Rousseau": "1712–1778",
    "Prasad Mahes": "c. contemporary",
    "Naval Ravikant": "b. 1974",
    "Paramahansa Yogananda": "1893–1952",
    "William Wordsworth": "1770–1850",
    "Anne Lamott": "b. 1954",
    "Oprah Winfrey": "b. 1954",
    "William James": "1842–1910",
    "Ralph Waldo Emerson": "1803–1882",
    "Johann Wolfgang von Goethe": "1749–1832",
    "Chinese proverb": "origin unknown",
    "Hermann Hesse": "1877–1962",
    "Sri Chinmoy": "1931–2007",
  };

  const LIST = [
    { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "It is not death that a man should fear, but never beginning to live.", author: "Marcus Aurelius" },
    { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
    { text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
    { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius" },
    { text: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius" },
    { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
    { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
    { text: "He who is brave is free.", author: "Seneca" },
    { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
    { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
    { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
    { text: "As is a tale, so is life: not how long it is, but how good it is, is what matters.", author: "Seneca" },
    { text: "Hang on to your youthful enthusiasms — you'll be able to use them better when you're older.", author: "Seneca" },
    { text: "True happiness is to enjoy the present, without anxious dependence upon the future.", author: "Seneca" },
    { text: "While we wait for life, life passes.", author: "Seneca" },
    { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
    { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
    { text: "No man is free who is not master of himself.", author: "Epictetus" },
    { text: "We cannot choose our external circumstances, but we can always choose how we respond to them.", author: "Epictetus" },
    { text: "Don't explain your philosophy. Embody it.", author: "Epictetus" },
    { text: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", author: "Epictetus" },
    { text: "Only the educated are free.", author: "Epictetus" },
    { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
    { text: "The key is to keep company only with people who uplift you, whose presence calls forth your best.", author: "Epictetus" },
    { text: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.", author: "Epictetus" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "Wonder is the beginning of wisdom.", author: "Socrates" },
    { text: "To find yourself, think for yourself.", author: "Socrates" },
    { text: "He who is not contented with what he has, would not be contented with what he would like to have.", author: "Socrates" },
    { text: "Be kind, for everyone you meet is fighting a hard battle.", author: "Plato" },
    { text: "Courage is knowing what not to fear.", author: "Plato" },
    { text: "The measure of a man is what he does with power.", author: "Plato" },
    { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "Be kind whenever possible. It is always possible.", author: "Dalai Lama" },
    { text: "Sleep is the best meditation.", author: "Dalai Lama" },
    { text: "Our prime purpose in this life is to help others. And if you can't help them, at least don't hurt them.", author: "Dalai Lama" },
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
    { text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.", author: "Buddha" },
    { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
    { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
    { text: "Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned.", author: "Buddha" },
    { text: "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go of things not meant for you.", author: "Buddha" },
    { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
    { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
    { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
    { text: "Knowing others is intelligence; knowing yourself is true wisdom.", author: "Lao Tzu" },
    { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "Silence is a source of great strength.", author: "Lao Tzu" },
    { text: "He who knows he has enough is rich.", author: "Lao Tzu" },
    { text: "Respond intelligently even to unintelligent treatment.", author: "Lao Tzu" },
    { text: "Act without expectation.", author: "Lao Tzu" },
    { text: "The soft overcomes the hard. The slow overcomes the fast.", author: "Lao Tzu" },
    { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "Wherever you go, go with all your heart.", author: "Confucius" },
    { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
    { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
    { text: "Yesterday is history, tomorrow is a mystery, today is a gift. That is why it is called the present.", author: "Eleanor Roosevelt" },
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
    { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
    { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
    { text: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.", author: "Marcus Aurelius" },
    { text: "The soul is dyed the color of its leisure thoughts.", author: "Dean Inge" },
    { text: "Let us live so that when we come to die even the undertaker will be sorry.", author: "Mark Twain" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
    { text: "Smile, breathe, and go slowly.", author: "Thich Nhat Hanh" },
    { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
    { text: "Walk as if you are kissing the Earth with your feet.", author: "Thich Nhat Hanh" },
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "What you seek is seeking you.", author: "Rumi" },
    { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi" },
    { text: "The quieter you become, the more you are able to hear.", author: "Rumi" },
    { text: "Do not feel lonely, the entire universe is inside you.", author: "Rumi" },
    { text: "Where there is ruin, there is hope for a treasure.", author: "Rumi" },
    { text: "Sell your cleverness and buy bewilderment.", author: "Rumi" },
    { text: "Be like a tree and let the dead leaves drop.", author: "Rumi" },
    { text: "The art of living is more like wrestling than dancing.", author: "Marcus Aurelius" },
    { text: "How much more grievous are the consequences of anger than the causes of it.", author: "Marcus Aurelius" },
    { text: "Look well into thyself; there is a source of strength which will always spring up if thou wilt always look.", author: "Marcus Aurelius" },
    { text: "Receive without pride, let go without attachment.", author: "Marcus Aurelius" },
    { text: "Think of yourself as dead. You have lived your life. Now take what's left and live it properly.", author: "Marcus Aurelius" },
    { text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
    { text: "Associate with people who are likely to improve you.", author: "Seneca" },
    { text: "Sometimes even to live is an act of courage.", author: "Seneca" },
    { text: "Life is long if you know how to use it.", author: "Seneca" },
    { text: "He suffers more than necessary, who suffers before it is necessary.", author: "Seneca" },
    { text: "Man is not disturbed by things, but by the views he takes of them.", author: "Epictetus" },
    { text: "Seek not the good in external things; seek it in yourselves.", author: "Epictetus" },
    { text: "Caretake this moment. Immerse yourself in its particulars.", author: "Mary Anne Radmacher" },
    { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
    { text: "The little things? The little moments? They aren't little.", author: "Jon Kabat-Zinn" },
    { text: "You can't stop the waves, but you can learn to surf.", author: "Jon Kabat-Zinn" },
    { text: "Paradise is not a place; it's a state of consciousness.", author: "Sri Chinmoy" },
    { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
    { text: "Learn to be calm and you will always be happy.", author: "Paramahansa Yogananda" },
    { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
    { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" },
    { text: "Nothing is worth more than this day.", author: "Johann Wolfgang von Goethe" },
    { text: "One must give up a lot to keep a little.", author: "Chinese proverb" },
    { text: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese proverb" },
    { text: "When the mind is calm, how quickly, how smoothly, how beautifully you will perceive everything.", author: "Paramahansa Yogananda" },
    { text: "Rest and be thankful.", author: "William Wordsworth" },
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" },
    { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss" },
    { text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
    { text: "Patience is bitter, but its fruit is sweet.", author: "Jean-Jacques Rousseau" },
    { text: "The mind is like water. When it's turbulent, it's difficult to see. When it's calm, everything becomes clear.", author: "Prasad Mahes" },
    { text: "Do every act of your life as though it were the very last act of your life.", author: "Marcus Aurelius" },
    { text: "Be present above all else.", author: "Naval Ravikant" },
    { text: "The obstacle is the way.", author: "Marcus Aurelius" },
    { text: "Choose not to be harmed — and you won't feel harmed. Don't feel harmed — and you haven't been.", author: "Marcus Aurelius" },
  ];

  function circaFor(entry) {
    return entry.circa || AUTHOR_CIRCA[entry.author] || "date unknown";
  }

  function formatAttribution(entry) {
    return `${entry.author} · ${circaFor(entry)}`;
  }

  function shuffleOrder(length) {
    const order = Array.from({ length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  function loadDeckState() {
    try {
      const raw = localStorage.getItem(DECK_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!Array.isArray(state.order) || state.order.length !== LIST.length) return null;
      if (typeof state.pos !== "number" || state.pos < 0 || state.pos >= LIST.length) return null;
      return state;
    } catch {
      return null;
    }
  }

  function saveDeckState(state) {
    try {
      localStorage.setItem(DECK_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }

  function nextQuote() {
    let state = loadDeckState();
    if (!state) {
      state = { order: shuffleOrder(LIST.length), pos: 0 };
    }

    const entry = LIST[state.order[state.pos]];
    state.pos += 1;
    if (state.pos >= LIST.length) {
      saveDeckState({ order: shuffleOrder(LIST.length), pos: 0 });
    } else {
      saveDeckState(state);
    }

    const circa = circaFor(entry);
    return { text: entry.text, author: entry.author, circa, attribution: formatAttribution(entry) };
  }

  return { nextQuote, count: LIST.length };
})();
