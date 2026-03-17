export const getPreWrittenMessages = (occasion: string, customOccasion?: string): Record<string, Record<string, string[]>> => {
  const displayOccasion = occasion === 'Custom' && customOccasion ? customOccasion : occasion;
  const messages: Record<string, Record<string, Record<string, string[]>>> = {
    'Birthday': {
      Friend: {
        Funny: [
          "Happy birthday! I'm so glad we're going to grow old together, and that you have a head start.",
          "Another year older, but definitely not any wiser. Happy birthday!",
          "I was going to get you a great present, but then I remembered you already have me. Happy birthday!"
        ],
        Heartfelt: [
          "Happy birthday to my absolute best friend. I don't know what I would do without you.",
          "Wishing you a day filled with love, laughter, and all the things that make you smile. You deserve the world.",
          "Thank you for always being there for me. I hope your birthday is as amazing as you are."
        ],
        Simple: [
          "Wishing you a very happy birthday!",
          "Hope you have a fantastic day celebrating.",
          "Cheers to another trip around the sun!"
        ]
      },
      Family: {
        Funny: [
          "Happy birthday! I smile because you're my family. I laugh because there's nothing you can do about it.",
          "You're my favorite family member (don't tell the others). Happy birthday!",
          "Happy birthday! Thanks for always sharing your genes with me."
        ],
        Heartfelt: [
          "Family is everything, and I'm so grateful you're part of mine. Happy birthday!",
          "Wishing the happiest of birthdays to someone who means the world to our family.",
          "Thank you for your endless love and support. Have a wonderful birthday!"
        ],
        Simple: [
          "Happy birthday! Sending you lots of love today.",
          "Hope your birthday is filled with joy and family.",
          "Wishing you a wonderful year ahead."
        ]
      },
      Colleague: {
        Funny: [
          "Happy birthday! Let's pretend to work hard today in your honor.",
          "Wishing you a happy birthday and a day with zero urgent emails.",
          "Happy birthday! I got you the best gift: I won't schedule any meetings with you today."
        ],
        Heartfelt: [
          "It's a pleasure working with you. Wishing you a fantastic birthday and a great year ahead.",
          "Happy birthday! Your hard work and dedication are truly inspiring to all of us.",
          "Thank you for being such a great teammate. Have a wonderful birthday!"
        ],
        Simple: [
          "Happy birthday! Hope you have a great day.",
          "Wishing you a happy birthday and a successful year.",
          "Best wishes on your birthday!"
        ]
      }
    },
    'Anniversary': {
      Partner: {
        Funny: [
          "I love you more than I did yesterday. Yesterday you really annoyed me.",
          "Happy anniversary! I'm still not sick of you.",
          "Congratulations on surviving another year with me."
        ],
        Heartfelt: [
          "Happy anniversary to my soulmate. Here's to a lifetime of love and happiness.",
          "Every year with you is better than the last. I love you more than ever.",
          "Thank you for being my partner in everything. Happy anniversary."
        ],
        Simple: [
          "Happy anniversary! I love you.",
          "Cheers to another year together.",
          "Wishing us a very happy anniversary."
        ]
      },
      Friends: {
        Funny: [
          "Happy anniversary! It's amazing you two haven't killed each other yet.",
          "Congratulations on another year of successful cohabitation.",
          "Happy anniversary to my favorite couple to third-wheel with."
        ],
        Heartfelt: [
          "Happy anniversary to a truly beautiful couple. Your love is inspiring.",
          "Wishing you both a wonderful anniversary and many more years of happiness.",
          "May your love continue to grow stronger each year. Happy anniversary!"
        ],
        Simple: [
          "Happy anniversary to you both!",
          "Wishing you a wonderful anniversary.",
          "Cheers to your special day!"
        ]
      }
    },
    'Graduation': {
      Graduate: {
        Funny: [
          "Happy Graduation! Now the real suffering begins.",
          "Congratulations on getting through the easiest part of life.",
          "You did it! Now please go get a job so you can buy me things."
        ],
        Heartfelt: [
          "I am so incredibly proud of you and all that you've accomplished. The world is yours!",
          "Congratulations on your graduation! Your hard work and dedication have truly paid off.",
          "Watching you achieve this milestone fills my heart with joy. I can't wait to see what you do next."
        ],
        Simple: [
          "Congratulations on your graduation!",
          "So proud of you! Happy Graduation.",
          "Wishing you the best on your next adventure."
        ]
      }
    },
    'Wedding': {
      Couple: {
        Funny: [
          "Congratulations! Your wedding means I have an excuse to dress up and drink free champagne.",
          "It's too late to back out now! Just kidding, congratulations!",
          "Wishing you a lifetime of love, laughter, and agreeing on what to watch on Netflix."
        ],
        Heartfelt: [
          "Wishing you a lifetime of love and happiness. Your love story is truly beautiful.",
          "May your wedding day be the beginning of a long, happy life together.",
          "Congratulations on finding your forever person. I'm so happy for you both."
        ],
        Simple: [
          "Congratulations on your wedding!",
          "Wishing you both a lifetime of happiness.",
          "Cheers to the happy couple!"
        ]
      }
    },
    'New Baby': {
      Parents: {
        Funny: [
          "Welcome to the world of no sleep! Congratulations on the new baby.",
          "So happy for you! Let me know when you need a babysitter (in a few years).",
          "Congratulations! You made a tiny human."
        ],
        Heartfelt: [
          "Welcome to the world, little one! Sending so much love to your growing family.",
          "Congratulations on the arrival of your beautiful baby. May your home be filled with joy.",
          "I am overjoyed for you both. This baby is so lucky to have you as parents."
        ],
        Simple: [
          "Congratulations on your new baby!",
          "Welcome to the world, little one.",
          "So happy for your growing family."
        ]
      }
    },
    'Valentine\'s': {
      Partner: {
        Funny: [
          "Happy Valentine's Day! I love you more than chocolate (and that's saying a lot).",
          "You're my favorite person to do nothing with.",
          "I'm so glad you're my emergency contact."
        ],
        Heartfelt: [
          "Happy Valentine's Day to my true love. Every day with you is a gift.",
          "You make my heart skip a beat. I love you more than words can say.",
          "Thank you for filling my life with so much love and joy. Happy Valentine's Day."
        ],
        Simple: [
          "Happy Valentine's Day! I love you.",
          "Be my Valentine?",
          "Sending you all my love today."
        ]
      }
    },
    'I Love You': {
      Partner: {
        Funny: [
          "I love you more than pizza. And that's saying a lot.",
          "You're my favorite thing to do. I mean, person to be with.",
          "I love you even when I'm hungry."
        ],
        Heartfelt: [
          "Every day with you is a wonderful addition to my life's journey. I love you.",
          "You are my today and all of my tomorrows. I love you more than words can say.",
          "Thank you for being you, and for being mine. I love you endlessly."
        ],
        Simple: [
          "I love you so much.",
          "You mean the world to me.",
          "Just wanted to say I love you."
        ]
      },
      Family: {
        Funny: [
          "I love you, even though you drive me crazy sometimes.",
          "You're lucky I love you, because you're a lot to handle.",
          "I love you! (Please don't ask to borrow money)."
        ],
        Heartfelt: [
          "I'm so incredibly lucky to have you in my family. I love you.",
          "No matter how much time passes, my love for you only grows stronger.",
          "Thank you for always being my safe place. I love you."
        ],
        Simple: [
          "Love you always.",
          "Sending you so much love today.",
          "Just a reminder that I love you."
        ]
      },
      Friend: {
        Funny: [
          "I love you! We'll be friends forever because you already know too much.",
          "I love you more than I love being right. (And I really love being right).",
          "You're the only person I'd share my snacks with. Love ya!"
        ],
        Heartfelt: [
          "I just wanted to remind you how much I love and appreciate our friendship.",
          "You're more than a friend, you're chosen family. I love you.",
          "Life is just better with you in it. Love you so much."
        ],
        Simple: [
          "Love you, friend!",
          "So grateful for you. Love ya!",
          "Sending you lots of love."
        ]
      }
    },
    'Mother\'s Day': {
      Mother: {
        Funny: [
          "Happy Mother's Day! Thanks for not leaving me in a shopping cart.",
          "I love how we don't even need to say out loud that I'm your favorite child.",
          "Happy Mother's Day to someone who deserves a medal for putting up with me."
        ],
        Heartfelt: [
          "Happy Mother's Day to the most amazing woman I know. Thank you for everything.",
          "I am who I am because of you. I love you so much, Mom.",
          "Thank you for your endless love, patience, and support. Happy Mother's Day!"
        ],
        Simple: [
          "Happy Mother's Day! I love you.",
          "Wishing you a wonderful Mother's Day.",
          "Thank you for being a great mom."
        ]
      }
    },
    'Father\'s Day': {
      Father: {
        Funny: [
          "Happy Father's Day! You're the best dad I've ever had.",
          "Thanks for killing all those spiders. Happy Father's Day!",
          "I hope your Father's Day is as fun as your life was before you had kids."
        ],
        Heartfelt: [
          "Happy Father's Day to my hero and role model. I love you, Dad.",
          "Thank you for always believing in me and supporting my dreams.",
          "I'm so grateful for your guidance and love. Happy Father's Day!"
        ],
        Simple: [
          "Happy Father's Day! I love you.",
          "Wishing you a great Father's Day.",
          "Thanks for everything, Dad."
        ]
      }
    },
    'Christmas': {
      Everyone: {
        Funny: [
          "Merry Christmas! I hope you like the present you told me to buy for you.",
          "May your family be functional and all your batteries be included.",
          "Merry Christmas! Let's eat until we can't move."
        ],
        Heartfelt: [
          "Wishing you a magical Christmas filled with love, joy, and peace.",
          "May the spirit of Christmas warm your heart all year round.",
          "Sending you my warmest wishes for a beautiful holiday season."
        ],
        Simple: [
          "Merry Christmas!",
          "Happy Holidays!",
          "Wishing you a joyful Christmas season."
        ]
      }
    },
    'Thank You': {
      Everyone: {
        Funny: [
          "Thank you! I'd buy you a pony, but I'm broke.",
          "You're the best! (And I'm not just saying that because you helped me).",
          "Thanks a million! (Or whatever the current exchange rate is)."
        ],
        Heartfelt: [
          "I cannot thank you enough for your kindness and support. It means the world to me.",
          "Your generosity has touched my heart. Thank you so much.",
          "I am incredibly grateful for everything you've done. Thank you from the bottom of my heart."
        ],
        Simple: [
          "Thank you so much!",
          "I really appreciate it.",
          "Thanks for everything."
        ]
      }
    },
    'Congratulations': {
      Everyone: {
        Funny: [
          "Congratulations! I always knew you were slightly above average.",
          "You did it! Now, when are we celebrating?",
          "Congrats! I'm so happy for you that I almost forgot to be jealous."
        ],
        Heartfelt: [
          "I am so thrilled for you! You have worked so hard for this and truly deserve it.",
          "Congratulations on this amazing achievement. I couldn't be prouder.",
          "Wishing you continued success and happiness. Congratulations!"
        ],
        Simple: [
          "Congratulations!",
          "So happy for you!",
          "Well done!"
        ]
      }
    },
    'Best Wishes': {
      Everyone: {
        Funny: [
          "Best wishes! Don't mess it up.",
          "Good luck! You're going to need it. (Just kidding!)",
          "Sending you good vibes and crossed fingers."
        ],
        Heartfelt: [
          "Wishing you all the best on this new journey. I believe in you!",
          "May success and happiness follow you wherever you go.",
          "Sending you my warmest wishes for a bright and beautiful future."
        ],
        Simple: [
          "Best wishes!",
          "Good luck with everything.",
          "Wishing you the best."
        ]
      }
    },
    'Exam Wishes': {
      Student: {
        Funny: [
          "Good luck! Remember, C's get degrees.",
          "May the curve be ever in your favor.",
          "Don't stress! (Easy for me to say, I'm not taking the exam)."
        ],
        Heartfelt: [
          "You have studied so hard for this. Believe in yourself and do your best!",
          "Sending you positive energy and clear thoughts for your exam.",
          "I know you're going to ace this. Good luck!"
        ],
        Simple: [
          "Good luck on your exam!",
          "You've got this!",
          "Wishing you the best of luck."
        ]
      }
    },
    'Condolences': {
      Everyone: {
        Heartfelt: [
          "I am so deeply sorry for your loss. My thoughts are with you and your family.",
          "Words cannot express how sorry I am. Please know that I am here for you.",
          "Sending you love, strength, and my deepest sympathies during this difficult time."
        ],
        Simple: [
          "With deepest sympathy.",
          "Thinking of you during this difficult time.",
          "So sorry for your loss."
        ]
      }
    },
    'Get Well Soon': {
      Everyone: {
        Funny: [
          "Get well soon! I'm tired of doing your share of the work.",
          "I hope you feel better soon, mostly so you can stop complaining.",
          "Laughter is the best medicine, so I'm here to make fun of you."
        ],
        Heartfelt: [
          "Sending you healing thoughts and wishing you a speedy recovery.",
          "I'm so sorry you're not feeling well. Please let me know if there's anything I can do.",
          "Take all the time you need to rest and heal. Thinking of you."
        ],
        Simple: [
          "Get well soon!",
          "Wishing you a speedy recovery.",
          "Hope you feel better soon."
        ]
      }
    },
    'Sympathy': {
      Everyone: {
        Heartfelt: [
          "I am so sorry you are going through this. I am keeping you in my thoughts.",
          "Sending you strength and comfort during this challenging time.",
          "Please know that you are not alone. I am here to support you in any way I can."
        ],
        Simple: [
          "Thinking of you.",
          "Sending you my support.",
          "With heartfelt sympathy."
        ]
      }
    }
  };

  const genericFallback = {
    Friend: {
      Funny: [
        `Happy ${displayOccasion}! Let's celebrate until we forget what we're celebrating.`,
        `Wishing you a ${displayOccasion} that's almost as awesome as I am.`,
        `Happy ${displayOccasion}! I'm just here for the cake.`
      ],
      Heartfelt: [
        `Wishing you a truly wonderful ${displayOccasion}. You deserve all the happiness in the world.`,
        `I'm so grateful to have you in my life. Happy ${displayOccasion}!`,
        `May this ${displayOccasion} bring you joy, peace, and beautiful memories.`
      ],
      Simple: [
        `Happy ${displayOccasion}!`,
        `Wishing you the best on this ${displayOccasion}.`,
        `Hope you have a great ${displayOccasion}!`
      ]
    },
    Family: {
      Funny: [
        `Happy ${displayOccasion}! We might be crazy, but at least we have each other.`,
        `Wishing you a happy ${displayOccasion} from your favorite family member.`,
        `Happy ${displayOccasion}! Let's try to get through today without any family drama.`
      ],
      Heartfelt: [
        `Sending you so much love on this special ${displayOccasion}. Family is everything.`,
        `Wishing you a beautiful ${displayOccasion}. I'm so lucky to call you family.`,
        `May this ${displayOccasion} be filled with love and laughter for our family.`
      ],
      Simple: [
        `Happy ${displayOccasion} to you!`,
        `Sending love on this ${displayOccasion}.`,
        `Wishing you a wonderful ${displayOccasion}.`
      ]
    },
    Colleague: {
      Funny: [
        `Happy ${displayOccasion}! Let's celebrate by taking a very long lunch break.`,
        `Wishing you a happy ${displayOccasion} and a day free of meetings.`,
        `Happy ${displayOccasion}! May your coffee be strong and your day be short.`
      ],
      Heartfelt: [
        `Wishing you a wonderful ${displayOccasion}. It's a pleasure working with you.`,
        `Happy ${displayOccasion}! Thank you for being such a great part of the team.`,
        `May this ${displayOccasion} bring you success and happiness.`
      ],
      Simple: [
        `Happy ${displayOccasion}!`,
        `Best wishes on this ${displayOccasion}.`,
        `Hope you have a great ${displayOccasion}!`
      ]
    }
  };

  return messages[occasion] || genericFallback;
};
