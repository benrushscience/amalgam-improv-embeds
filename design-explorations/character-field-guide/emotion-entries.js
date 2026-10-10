/* Emotion wheel alignment v2. Names, definitions, family order, and membership
   match the live Amalgam wheel reviewed 2026-10-09. See emotion-wheel-reference.json.
   Cues and three distinct scene examples per emotion are original improv suggestions.
   Retained emotions keep their existing IDs; new emotions start at emotion-31. */
window.characterEmotionFamilies = [
  {
    "id": "emotion-joy",
    "name": "Joy",
    "type": "emotion"
  },
  {
    "id": "emotion-surprise",
    "name": "Surprise",
    "type": "emotion"
  },
  {
    "id": "emotion-anger",
    "name": "Anger",
    "type": "emotion"
  },
  {
    "id": "emotion-fear",
    "name": "Fear",
    "type": "emotion"
  },
  {
    "id": "emotion-sadness",
    "name": "Sadness",
    "type": "emotion"
  },
  {
    "id": "emotion-disgust",
    "name": "Disgust",
    "type": "emotion"
  },
  {
    "id": "emotion-connection",
    "name": "Connection",
    "type": "emotion"
  },
  {
    "id": "emotion-self-conscious",
    "name": "Self-Conscious",
    "type": "emotion"
  }
];

// Each emotion keeps its definition, playable cue, connections, and examples together.
window.characterEmotions = [
  {
    "id": "emotion-10",
    "type": "emotion",
    "family": "emotion-joy",
    "name": "Contentment",
    "meaning": "A calm sense of satisfaction with the way things are right now.",
    "cue": "Find something sufficient in the scene. Explore how you respond when your partner wants more.",
    "relatedIds": [
      "v7",
      "b29"
    ],
    "scenes": [
      {
        "setup": "At a lakeside bench, your friend proposes three more stops before sunset.",
        "line": "We could also finish this sandwich right here."
      },
      {
        "setup": "In a small kitchen, your spouse apologizes for a plain anniversary dinner.",
        "line": "You remembered the soup. I have everything I came for."
      },
      {
        "setup": "In a repair shed, your apprentice asks when you plan to expand.",
        "line": "I can hear every clock from this chair. I like that."
      }
    ]
  },
  {
    "id": "emotion-25",
    "type": "emotion",
    "family": "emotion-joy",
    "name": "Amusement",
    "meaning": "Pleasure sparked by something funny, playful, absurd, or entertaining.",
    "cue": "Let the discovery be particular. Keep the relationship alive instead of laughing at every offer indiscriminately.",
    "relatedIds": [
      "v7",
      "behavior-11"
    ],
    "scenes": [
      {
        "setup": "At a town meeting, you notice the stern chairperson’s squeaking shoes.",
        "line": "I am listening. Your shoes keep seconding the motion."
      },
      {
        "setup": "In a garden, your partner solemnly names each slug before relocating it.",
        "line": "Does Gerald know he is being promoted to the far flowerbed?"
      },
      {
        "setup": "At an airport, your friend wears every souvenir hat at once to avoid baggage fees.",
        "line": "You have become the destination."
      }
    ]
  },
  {
    "id": "emotion-1",
    "type": "emotion",
    "family": "emotion-joy",
    "name": "Delight",
    "meaning": "A vivid burst of pleasure in response to something especially enjoyable, charming, or pleasing.",
    "cue": "Find a specific source of delight. Try a small response first and let each new detail deepen it.",
    "relatedIds": [
      "v7",
      "voice-1",
      "behavior-4"
    ],
    "scenes": [
      {
        "setup": "At a thrift shop, your friend finds the exact lunchbox you had as a child.",
        "line": "Open it. Please tell me the little astronaut is still inside."
      },
      {
        "setup": "On a research boat, your colleague spots the animal you have searched for all season.",
        "line": "It came back. You were right to keep the engine off."
      },
      {
        "setup": "At home, your teenager serves you the first meal they cooked alone.",
        "line": "You remembered the lemon. I never even told you about the lemon."
      }
    ]
  },
  {
    "id": "emotion-31",
    "type": "emotion",
    "family": "emotion-joy",
    "name": "Excitement",
    "meaning": "High-energy positive anticipation or engagement with something appealing.",
    "cue": "Choose something appealing that is happening or about to happen. Let the anticipation affect how eagerly you share it with your partner.",
    "relatedIds": [
      "voice-1",
      "physicality-4",
      "want-3"
    ],
    "scenes": [
      {
        "setup": "At a community radio station, your cohost points to the countdown before your first broadcast.",
        "line": "Ten seconds! Someone could be making breakfast to us in ten seconds!"
      },
      {
        "setup": "In a costume shop, your friend brings out the first fitting of your parade outfit.",
        "line": "It has wings. Please tell me we are allowed to try the wings right now."
      },
      {
        "setup": "At a train platform, your daughter hands you tickets for the trip you have been planning together.",
        "line": "We are really going. I packed the map in three different bags."
      }
    ]
  },
  {
    "id": "emotion-8",
    "type": "emotion",
    "family": "emotion-joy",
    "name": "Relief",
    "meaning": "Pleasure and release that follow the ending, reduction, or avoidance of something stressful or threatening.",
    "cue": "Establish what you thought might happen. Let the new information affect your next action and your relationship.",
    "relatedIds": [
      "v14",
      "voice-5",
      "physicality-3"
    ],
    "scenes": [
      {
        "setup": "At a repair counter, the technician returns the camera containing your wedding photos.",
        "line": "You found them? Even the blurry one of my dad?"
      },
      {
        "setup": "In a rehearsal room, your director says your forgotten entrance worked beautifully.",
        "line": "So we are calling that a pause. I can live with a pause."
      },
      {
        "setup": "At a railway platform, your friend arrives holding the pet carrier you misplaced.",
        "line": "There you both are. I have apologized to every cat in this station."
      }
    ]
  },
  {
    "id": "emotion-9",
    "type": "emotion",
    "family": "emotion-joy",
    "name": "Hope",
    "meaning": "A positive orientation toward a desired future outcome that still contains some uncertainty.",
    "cue": "Choose what might happen and why it matters. Let each offer encourage or complicate the possibility.",
    "relatedIds": [
      "b6",
      "want-5"
    ],
    "scenes": [
      {
        "setup": "At a station, you wait with your sister for the first train after a long closure.",
        "line": "If this one runs, Mum can visit without asking anyone for a lift."
      },
      {
        "setup": "In a greenhouse, you show your partner a tiny green shoot in a neglected pot.",
        "line": "Look. We did not miss our chance."
      },
      {
        "setup": "At an audition, you hear the director ask to see your scene again.",
        "line": "From the beginning? Yes. I remember every word this time."
      }
    ]
  },
  {
    "id": "emotion-32",
    "type": "emotion",
    "family": "emotion-surprise",
    "name": "Interest",
    "meaning": "Engaged attention toward something experienced as novel, meaningful, or worth exploring.",
    "cue": "Notice one unexpected detail and follow it with a specific question or action. Let your partner show you something you did not know.",
    "relatedIds": [
      "v3",
      "voice-2",
      "behavior-5"
    ],
    "scenes": [
      {
        "setup": "At a repair café, a volunteer opens your broken clock and reveals an unfamiliar mechanism.",
        "line": "Wait—what does that tiny wheel do? Can you show me before you close it?"
      },
      {
        "setup": "In a community garden, your neighbor grows beans in a pattern you have never seen.",
        "line": "You planted them in a spiral. Does that change how they grow?"
      },
      {
        "setup": "During a hotel night shift, a guest asks whether anyone remembers the building's old ballroom.",
        "line": "I thought that door was a cupboard. What used to happen in there?"
      }
    ]
  },
  {
    "id": "emotion-33",
    "type": "emotion",
    "family": "emotion-surprise",
    "name": "Astonishment",
    "meaning": "Strong surprise caused by something far outside what you expected.",
    "cue": "Establish what you expected, then let the new fact overturn it. Give yourself a moment before trying to explain it away.",
    "relatedIds": [
      "voice-6",
      "physicality-4"
    ],
    "scenes": [
      {
        "setup": "At a village raffle, the organizer tells you that your ticket won the actual building.",
        "line": "I thought 'win the hall' meant we could hire it for a birthday."
      },
      {
        "setup": "In your grandmother's kitchen, she casually translates a radio broadcast in a language you never knew she spoke.",
        "line": "You understood all of that? We have been using a phrasebook together for twenty years."
      },
      {
        "setup": "At a laboratory, your assistant reveals that yesterday's tiny seedling has grown through the ceiling.",
        "line": "That was in a yogurt pot when I went home."
      }
    ]
  },
  {
    "id": "emotion-34",
    "type": "emotion",
    "family": "emotion-surprise",
    "name": "Amazement",
    "meaning": "Surprise mixed with wonder, admiration, or the sense that something is remarkable.",
    "cue": "Find something remarkable in the offer. Let admiration or wonder accompany the surprise, and invite your partner to notice it too.",
    "relatedIds": [
      "v3",
      "voice-4",
      "physicality-6"
    ],
    "scenes": [
      {
        "setup": "At a puppet workshop, the maker brings a wooden bird to life with a tiny movement of their hand.",
        "line": "I know those are strings, and I still want to open the window for it."
      },
      {
        "setup": "On a rooftop, your neighbor lets you see Saturn through a telescope for the first time.",
        "line": "The rings are really there. You can see them from next to our water tank."
      },
      {
        "setup": "In a bakery, your apprentice unveils a sugar sculpture of your childhood home.",
        "line": "You even made the crooked step. How did you get that much of my life onto a cake?"
      }
    ]
  },
  {
    "id": "emotion-35",
    "type": "emotion",
    "family": "emotion-surprise",
    "name": "Startlement",
    "meaning": "A brief automatic jolt of attention caused by a sudden unexpected event.",
    "cue": "React briefly to a sudden sound or discovery, then let the next offer determine what the jolt becomes. A small response is enough.",
    "relatedIds": [
      "physicality-4",
      "voice-6"
    ],
    "scenes": [
      {
        "setup": "While you inventory a quiet toy shop with a coworker, a mechanical parrot suddenly speaks.",
        "line": "Oh! That one has batteries. I was about to introduce myself."
      },
      {
        "setup": "At your desk, your partner unexpectedly appears in the doorway while you are absorbed in a letter.",
        "line": "Ah! I didn't hear you come in. How long have you been there?"
      },
      {
        "setup": "In a greenhouse, a watering system clicks on just as you and a trainee pass beneath it.",
        "line": "Whoa! Right. The twelve o'clock rain. I should have mentioned that."
      }
    ]
  },
  {
    "id": "emotion-36",
    "type": "emotion",
    "family": "emotion-surprise",
    "name": "Shock",
    "meaning": "Intense surprise that temporarily makes an event difficult to fully process.",
    "cue": "Choose a revelation your character cannot immediately take in. Let a simple question, repetition, or unfinished action show the delay in understanding.",
    "relatedIds": [
      "voice-2",
      "physicality-5"
    ],
    "scenes": [
      {
        "setup": "At your family shop, your brother reveals that he sold the business that morning.",
        "line": "You sold it? I am still wearing the apron. Who am I opening for tomorrow?"
      },
      {
        "setup": "At an awards dinner, the host tells you that the anonymous donor who saved your project is your estranged father.",
        "line": "My father? You said he was in the room. Which table?"
      },
      {
        "setup": "In a spaceship control room, your navigator shows you that the return journey took eighty years back home.",
        "line": "Eighty years. But I told my sister to leave the porch light on."
      }
    ]
  },
  {
    "id": "emotion-30",
    "type": "emotion",
    "family": "emotion-surprise",
    "name": "Confusion",
    "meaning": "Uncertainty that arises when information, events, or expectations do not fit together clearly.",
    "cue": "Identify the precise mismatch. Ask or act on it so your partner has a way to help or complicate matters.",
    "relatedIds": [
      "v3",
      "voice-21"
    ],
    "scenes": [
      {
        "setup": "At a hotel desk, the clerk gives you a key labeled “yesterday.”",
        "line": "Is that a room, or have I missed something very large?"
      },
      {
        "setup": "In a family kitchen, your brother introduces someone as both his boss and his student.",
        "line": "Who marks whose homework?"
      },
      {
        "setup": "At a rehearsal, your director says your exit should feel like an entrance.",
        "line": "Should I leave the room or arrive somewhere else in it?"
      }
    ]
  },
  {
    "id": "emotion-37",
    "type": "emotion",
    "family": "emotion-anger",
    "name": "Annoyance",
    "meaning": "Relatively mild anger caused by something bothersome, repetitive, or inconvenient.",
    "cue": "Pick a small, specific irritation. Keep the response proportionate enough that the rest of the relationship can still be present.",
    "relatedIds": [
      "voice-8",
      "behavior-2"
    ],
    "scenes": [
      {
        "setup": "At a library desk, your coworker clicks a pen every time you begin counting returns.",
        "line": "Could the pen take a break until I reach twenty?"
      },
      {
        "setup": "In a shared kitchen, your roommate puts another empty carton back in the refrigerator.",
        "line": "This is the third container of imaginary milk this week."
      },
      {
        "setup": "On a guided walking tour, your friend keeps stepping in front of you to photograph the same plaque.",
        "line": "I would love to see the historic building as well as the back of your phone."
      }
    ]
  },
  {
    "id": "emotion-3",
    "type": "emotion",
    "family": "emotion-anger",
    "name": "Frustration",
    "meaning": "Anger or agitation that develops when progress toward a goal is blocked.",
    "cue": "Name what you are trying to accomplish. Let the feeling show through attempts, not only a louder voice.",
    "relatedIds": [
      "v10",
      "voice-8",
      "want-5"
    ],
    "scenes": [
      {
        "setup": "In a music lesson, your teacher asks you to try the same passage for the tenth time.",
        "line": "I can hear it in my head. My fingers are attending a different lesson."
      },
      {
        "setup": "At a council office, a clerk hands you another form to save the local tree.",
        "line": "The tree will have grown its own paperwork by the time we finish."
      },
      {
        "setup": "In a shared kitchen, your roommate puts another dirty cup in the sink you just cleared.",
        "line": "I want to see the bottom once. Just once, together."
      }
    ]
  },
  {
    "id": "emotion-18",
    "type": "emotion",
    "family": "emotion-anger",
    "name": "Resentment",
    "meaning": "Persistent anger associated with feeling unfairly treated, overlooked, burdened, or wronged.",
    "cue": "Know what you believe you have given up. Let it emerge through the present task rather than a complete history lesson.",
    "relatedIds": [
      "b18",
      "behavior-13"
    ],
    "scenes": [
      {
        "setup": "At a holiday dinner, you wash dishes while your brother announces how relaxing the visit has been.",
        "line": "I am glad one of us has seen the sofa."
      },
      {
        "setup": "In a shared office, your colleague gets applause for a plan you prepared.",
        "line": "The spreadsheet seems to have lost its author on the way to the screen."
      },
      {
        "setup": "At a campsite, your friend complains about the tent you carried all day.",
        "line": "We can discuss its flaws after you carry one."
      }
    ]
  },
  {
    "id": "emotion-22",
    "type": "emotion",
    "family": "emotion-anger",
    "name": "Indignation",
    "meaning": "Anger specifically triggered by something perceived as unfair, unethical, or unjust.",
    "cue": "Specify the principle being violated. Let the scene test whether your interpretation is shared.",
    "relatedIds": [
      "v26",
      "b19"
    ],
    "scenes": [
      {
        "setup": "At a competition, you learn the judge has entered their own cake.",
        "line": "Then who is judging the judge’s frosting?"
      },
      {
        "setup": "In a queue, a familiar local celebrity walks past everyone waiting.",
        "line": "The rest of us have somewhere to be too."
      },
      {
        "setup": "At a library meeting, you discover the proposed quiet rule applies only to children.",
        "line": "Adults can also learn to whisper. I have witnessed it."
      }
    ]
  },
  {
    "id": "emotion-38",
    "type": "emotion",
    "family": "emotion-anger",
    "name": "Outrage",
    "meaning": "Intense anger in response to a serious perceived violation, injustice, or unacceptable action.",
    "cue": "Choose a serious violation that your character cannot accept. Direct the anger toward a demand or response rather than volume alone.",
    "relatedIds": [
      "v25",
      "voice-8",
      "want-5"
    ],
    "scenes": [
      {
        "setup": "At a town meeting, the developer admits that the promised public playground will become a private car park.",
        "line": "Those families raised money for swings. You cannot put a gate across their donations."
      },
      {
        "setup": "In a restaurant office, you discover that the owner has kept the staff's tips all summer.",
        "line": "They worked those double shifts. Put every dollar back before you ask them to serve another table."
      },
      {
        "setup": "At a rescue shelter, a sponsor asks you to stage a distressed animal for an advertisement.",
        "line": "You want us to frighten an animal we just made safe so your logo looks generous?"
      }
    ]
  },
  {
    "id": "emotion-39",
    "type": "emotion",
    "family": "emotion-anger",
    "name": "Fury",
    "meaning": "Extremely intense anger accompanied by powerful emotional and physical activation.",
    "cue": "Make the provocation and your immediate demand clear. Play intense anger with controlled movement and a comfortable voice; intensity need not mean shouting.",
    "relatedIds": [
      "physicality-5",
      "voice-8",
      "want-7"
    ],
    "scenes": [
      {
        "setup": "Backstage, your collaborator admits they deliberately destroyed the only recording of your final performance together.",
        "line": "You were angry with me, so you erased the work of everybody in that room?"
      },
      {
        "setup": "At a moving warehouse, the manager says your clearly labeled family keepsakes were sold after repeated assurances they were safe.",
        "line": "You called me yesterday and said you were looking straight at those boxes. Get the buyer on the phone."
      },
      {
        "setup": "In a council chamber, a rival jokes about the forged complaint that cost your family its home.",
        "line": "Look at me when you say it was a joke. We are still living out of suitcases."
      }
    ]
  },
  {
    "id": "emotion-40",
    "type": "emotion",
    "family": "emotion-fear",
    "name": "Unease",
    "meaning": "A mild sense that something may be wrong or unsafe even when the source is not fully clear.",
    "cue": "Notice one detail that seems slightly wrong without deciding what it proves. Let your partner's response sharpen or settle the feeling.",
    "relatedIds": [
      "v14",
      "behavior-7"
    ],
    "scenes": [
      {
        "setup": "At a holiday cottage, you notice every clock has stopped at the same time while the host shows you around.",
        "line": "Do the clocks usually do that together?"
      },
      {
        "setup": "During your first shift in a shop, the manager closes the blinds whenever a particular car passes.",
        "line": "Is there a reason we keep doing that?"
      },
      {
        "setup": "At a reunion dinner, your old friend avoids every question about the person who organized it.",
        "line": "You keep changing the subject when I say her name. Did I miss something?"
      }
    ]
  },
  {
    "id": "emotion-41",
    "type": "emotion",
    "family": "emotion-fear",
    "name": "Nervousness",
    "meaning": "Restless or activated concern about an upcoming challenge, evaluation, or uncertain event.",
    "cue": "Choose an upcoming moment that matters and whose outcome is uncertain. Let preparation, small mistakes, or requests for reassurance carry the feeling.",
    "relatedIds": [
      "voice-1",
      "physicality-4",
      "want-3"
    ],
    "scenes": [
      {
        "setup": "Outside a courtroom, you rehearse the first sentence of your testimony with your sister.",
        "line": "Do I say my full name even if they have just said my full name?"
      },
      {
        "setup": "In a restaurant cloakroom, you ask your date for a moment before meeting their parents.",
        "line": "Your dad knows I am the person from the ladder story, right?"
      },
      {
        "setup": "At a school concert, you wait beside your music teacher for your first solo.",
        "line": "Could you give me the first note once more? Quietly. Maybe twice."
      }
    ]
  },
  {
    "id": "emotion-2",
    "type": "emotion",
    "family": "emotion-fear",
    "name": "Apprehension",
    "meaning": "Concern or hesitation about something unpleasant that may happen.",
    "cue": "Decide what you fear losing in this situation. Let reassurance or evidence alter the feeling.",
    "relatedIds": [
      "v14",
      "behavior-7",
      "want-4"
    ],
    "scenes": [
      {
        "setup": "At an airport gate, your friend announces that your first flight is boarding.",
        "line": "When you said the plane was small, how small did you mean?"
      },
      {
        "setup": "Outside your old school, a former classmate asks you to enter the reunion together.",
        "line": "What if they still call me Captain Glue?"
      },
      {
        "setup": "At a restaurant, your partner slides a sealed envelope across the table.",
        "line": "Before I open this, are we still ordering dessert?"
      }
    ]
  },
  {
    "id": "emotion-42",
    "type": "emotion",
    "family": "emotion-fear",
    "name": "Dread",
    "meaning": "Strong anticipatory fear accompanied by an expectation of something deeply unpleasant.",
    "cue": "Name the unpleasant event you expect and cannot stop anticipating. Let your choices reveal how you delay, prepare for, or seek company through it.",
    "relatedIds": [
      "voice-2",
      "physicality-2",
      "want-4"
    ],
    "scenes": [
      {
        "setup": "In an office lift, you and your colleague approach the meeting where layoffs will be announced.",
        "line": "I know what those envelopes mean. I watched them put one at every chair."
      },
      {
        "setup": "Outside your parents' house, you hold the pieces of the heirloom your brother asked you to repair.",
        "line": "Once we ring that bell, I have to tell her there isn't a vase in this box anymore."
      },
      {
        "setup": "In a rehearsal hall, you wait for the director who always singles you out during notes.",
        "line": "He has put my chair in the middle again. I was hoping today would be different."
      }
    ]
  },
  {
    "id": "emotion-43",
    "type": "emotion",
    "family": "emotion-fear",
    "name": "Alarm",
    "meaning": "A rapid, activated fear response to a possible immediate threat.",
    "cue": "Spot a possible immediate threat and act on it. Direct your attention toward what your partner can do next.",
    "relatedIds": [
      "physicality-4",
      "voice-8",
      "want-4"
    ],
    "scenes": [
      {
        "setup": "At a seaside café, you see the rope on your friend's moored boat slip free.",
        "line": "Your boat—the rope is loose. Catch that end!"
      },
      {
        "setup": "In a workshop, you notice smoke escaping from behind your apprentice's bench.",
        "line": "Step away from the bench. Can you see where the smoke starts?"
      },
      {
        "setup": "At a museum, a child's backpack catches the stand beneath an enormous vase.",
        "line": "Stop there! Let me hold the stand before you move."
      }
    ]
  },
  {
    "id": "emotion-44",
    "type": "emotion",
    "family": "emotion-fear",
    "name": "Terror",
    "meaning": "Overwhelming fear in response to an extreme or immediate perceived threat.",
    "cue": "Make the perceived danger immediate and specific. Focus on a simple need from your partner; a quiet voice and still body can carry intense fear.",
    "relatedIds": [
      "voice-3",
      "physicality-5",
      "want-4"
    ],
    "scenes": [
      {
        "setup": "Inside an imaginary submarine, you and the engineer hear the hull begin to buckle.",
        "line": "Tell me which handle. Please, just tell me which handle."
      },
      {
        "setup": "In a mountain shelter, you and your guide watch an avalanche approach the only door.",
        "line": "There isn't another way out, is there? Stay with me."
      },
      {
        "setup": "On a fantasy expedition, you and your partner hide as a dragon's eye appears at your window.",
        "line": "It can see us. Don't let go of my hand."
      }
    ]
  },
  {
    "id": "emotion-4",
    "type": "emotion",
    "family": "emotion-sadness",
    "name": "Disappointment",
    "meaning": "Sadness that follows when reality falls short of what you hoped for or expected.",
    "cue": "Make the hope specific. Stay available to the person who is here, even while something is missing.",
    "relatedIds": [
      "v21",
      "voice-2",
      "want-2"
    ],
    "scenes": [
      {
        "setup": "At a train station, your sibling explains that your father could not make the visit.",
        "line": "I brought the chessboard. I thought we might finish that game."
      },
      {
        "setup": "At a science fair, your partner shows you the participation ribbon.",
        "line": "They did not ask how the submarine worked?"
      },
      {
        "setup": "At a campsite, your friend reveals the telescope is missing a lens.",
        "line": "I told my daughter I would show her Saturn tonight."
      }
    ]
  },
  {
    "id": "emotion-14",
    "type": "emotion",
    "family": "emotion-sadness",
    "name": "Loneliness",
    "meaning": "Emotional pain associated with feeling insufficiently connected, understood, or accompanied.",
    "cue": "Decide what kind of contact is missing. Give your partner an opening rather than assuming they cannot reach you.",
    "relatedIds": [
      "v21",
      "want-1"
    ],
    "scenes": [
      {
        "setup": "At a crowded work party, you ask the coat attendant about their evening.",
        "line": "Everyone upstairs knows my job title. What is your name?"
      },
      {
        "setup": "In a new apartment, you keep the mover talking after the last box arrives.",
        "line": "Do people on this street say hello to each other?"
      },
      {
        "setup": "At a café, you tell the owner you have learned the opening hours by heart.",
        "line": "It is nice to know somebody will be here at seven."
      }
    ]
  },
  {
    "id": "emotion-45",
    "type": "emotion",
    "family": "emotion-sadness",
    "name": "Melancholy",
    "meaning": "A quiet, reflective, or lingering sadness that may not have one immediate or easily identified cause.",
    "cue": "Let a quiet sadness color an ordinary moment without needing a complete explanation. Stay attentive to the person sharing it.",
    "relatedIds": [
      "voice-2",
      "physicality-3"
    ],
    "scenes": [
      {
        "setup": "On an autumn ferry, your friend asks why you have gone quiet while watching the shoreline.",
        "line": "Nothing happened. Something about the lights coming on makes me feel far away."
      },
      {
        "setup": "In a café at closing time, the owner asks whether you enjoyed your day off.",
        "line": "I did. I just wish I knew why it already feels like something I miss."
      },
      {
        "setup": "While repainting a spare room with your spouse, you pause over a patch of faded wallpaper.",
        "line": "Let's leave that corner for a minute. I don't quite know why."
      }
    ]
  },
  {
    "id": "emotion-46",
    "type": "emotion",
    "family": "emotion-sadness",
    "name": "Sorrow",
    "meaning": "Deep sadness associated with misfortune, hurt, loss, or circumstances you wish were different.",
    "cue": "Choose a painful circumstance you wish could be different. Let your sadness reach toward the other person rather than requiring them to fix it.",
    "relatedIds": [
      "v21",
      "voice-3",
      "want-8"
    ],
    "scenes": [
      {
        "setup": "In a hospital corridor, your brother tells you he will miss his daughter's wedding while recovering.",
        "line": "I know how long you practiced that dance with her."
      },
      {
        "setup": "At an orchard after a storm, you stand beside the grower surveying the fallen trees.",
        "line": "You planted that row when we started school. I'm so sorry to see it like this."
      },
      {
        "setup": "At a station, your friend explains that caring for their parents means leaving the town they love.",
        "line": "You finally felt at home here. I wish going back didn't cost you so much."
      }
    ]
  },
  {
    "id": "emotion-13",
    "type": "emotion",
    "family": "emotion-sadness",
    "name": "Grief",
    "meaning": "Deep sadness and adjustment associated with losing a person, relationship, role, place, possibility, or other valued part of life.",
    "cue": "Choose a particular missing detail. Play the relationship to the loss rather than trying to demonstrate a correct amount of sadness.",
    "relatedIds": [
      "v20",
      "physicality-7"
    ],
    "scenes": [
      {
        "setup": "In an old workshop, you and your sister sort your late father’s tools.",
        "line": "He labeled the broken ones too. He always thought there would be time."
      },
      {
        "setup": "At a closing theater, your colleague asks you to switch off the lobby light.",
        "line": "Can we leave it on until we have finished talking?"
      },
      {
        "setup": "In a garden, your neighbor asks where the old apple tree stood.",
        "line": "Here. The shade used to reach the kitchen by lunch."
      }
    ]
  },
  {
    "id": "emotion-47",
    "type": "emotion",
    "family": "emotion-sadness",
    "name": "Despair",
    "meaning": "Intense sadness accompanied by the feeling that a painful situation may not improve.",
    "cue": "Let the character feel that their attempts cannot change the situation. Treat that as their present feeling, leaving room for your partner to affect it.",
    "relatedIds": [
      "voice-2",
      "physicality-2",
      "want-5"
    ],
    "scenes": [
      {
        "setup": "At a flooded shop, your business partner brings another repair estimate after the third flood this year.",
        "line": "We keep rebuilding the same counter. I can't picture it staying dry anymore."
      },
      {
        "setup": "In a spaceship greenhouse, your colleague shows you the last failed tray of seeds.",
        "line": "I have tried every packet. I don't know how to tell the crew there still isn't anything growing."
      },
      {
        "setup": "At a village hall, your neighbor brings another rejected appeal to save the local bus service.",
        "line": "We filled their forms, went to their meetings, found the money. I don't see a door left to knock on."
      }
    ]
  },
  {
    "id": "emotion-48",
    "type": "emotion",
    "family": "emotion-disgust",
    "name": "Distaste",
    "meaning": "A relatively mild dislike or aversion toward something experienced as unpleasant.",
    "cue": "Choose something mildly unpleasant. Let a small hesitation or tactful objection distinguish the feeling from stronger rejection.",
    "relatedIds": [
      "voice-2",
      "behavior-5"
    ],
    "scenes": [
      {
        "setup": "At a tasting counter, your friend offers you a second spoonful of their new licorice custard.",
        "line": "One spoonful has given me a very complete impression, thank you."
      },
      {
        "setup": "In a hotel lobby, the decorator proudly demonstrates a perfume dispenser beside every chair.",
        "line": "Could we try the room with slightly less gardenia?"
      },
      {
        "setup": "At a costume fitting, your partner asks what you think of the shiny imitation-fur collar.",
        "line": "It feels rather like being hugged by a damp carpet."
      }
    ]
  },
  {
    "id": "emotion-49",
    "type": "emotion",
    "family": "emotion-disgust",
    "name": "Aversion",
    "meaning": "A strong inclination to avoid or withdraw from something experienced as unpleasant.",
    "cue": "Identify what you want to avoid and show the effort to keep your distance. Let the other character offer a reason to stay involved.",
    "relatedIds": [
      "physicality-2",
      "want-4"
    ],
    "scenes": [
      {
        "setup": "At a seafood stall, your companion asks you to reach into a tub of live eels for their purchase.",
        "line": "I will carry every other bag. You are carrying the one that moves."
      },
      {
        "setup": "At a conference, your colleague steers you toward a networking game you have disliked before.",
        "line": "I'll help set out the chairs, but please don't put me in the compliment circle."
      },
      {
        "setup": "In a school art room, a teacher offers you a tray of sticky modeling paste.",
        "line": "Can I cut the paper shapes instead? I can't bear that stuff on my fingers."
      }
    ]
  },
  {
    "id": "emotion-50",
    "type": "emotion",
    "family": "emotion-disgust",
    "name": "Revulsion",
    "meaning": "An intense, often visceral form of disgust that produces a strong desire to recoil.",
    "cue": "Choose a specific source of visceral disgust. An imagined recoil or interrupted action can show it without elaborate physical effects.",
    "relatedIds": [
      "physicality-4",
      "voice-6"
    ],
    "scenes": [
      {
        "setup": "At a holiday rental, you and the host open a refrigerator that has been unplugged for weeks.",
        "line": "Close it. Please close it before you explain the deposit."
      },
      {
        "setup": "In an antique shop, the dealer reveals that the decorative jar contains preserved parasites.",
        "line": "I was holding that against my cheek to see the pattern."
      },
      {
        "setup": "At a bakery, your coworker lifts a flour sack and finds insects moving underneath it.",
        "line": "That entire patch is moving. Put the scoop down."
      }
    ]
  },
  {
    "id": "emotion-51",
    "type": "emotion",
    "family": "emotion-disgust",
    "name": "Contempt",
    "meaning": "A dismissive feeling that a person, behavior, or attitude is unworthy of respect.",
    "cue": "Choose the behavior your character looks down on. Let the dismissiveness be their viewpoint, and remain open to a response that challenges it.",
    "relatedIds": [
      "voice-2",
      "behavior-5"
    ],
    "scenes": [
      {
        "setup": "At an art opening, a collector tells you they judge paintings only by resale price.",
        "line": "You could save yourself the gallery visit and just frame the receipt."
      },
      {
        "setup": "In a campaign office, a candidate rehearses pretending to remember a volunteer's name.",
        "line": "You've had six months to learn it. Perhaps that could be tomorrow's policy."
      },
      {
        "setup": "At a shared workbench, a rival claims expertise while asking you how to switch on the equipment.",
        "line": "The big green button. It features prominently in the first lesson."
      }
    ]
  },
  {
    "id": "emotion-52",
    "type": "emotion",
    "family": "emotion-disgust",
    "name": "Moral Disgust",
    "meaning": "Strong aversion toward behavior perceived as profoundly unethical, degrading, or corrupt.",
    "cue": "Find an action your character regards as deeply corrupt or degrading. Show the urge to reject involvement, distinct from simply wanting to win an argument.",
    "relatedIds": [
      "v25",
      "v24",
      "want-5"
    ],
    "scenes": [
      {
        "setup": "At a charity gala, the organizer admits that the beneficiary stories were invented to sell expensive tables.",
        "line": "You put suffering on the place cards because it matched the theme. Take my name off this."
      },
      {
        "setup": "In a housing office, a coworker proposes charging desperate applicants to move their files to the top.",
        "line": "They are sleeping in cars, and you see a queue we can sell?"
      },
      {
        "setup": "At a school fundraiser, a sponsor offers money only if struggling children are filmed thanking them on cue.",
        "line": "Their difficulty isn't a performance you bought. We will find another sponsor."
      }
    ]
  },
  {
    "id": "emotion-53",
    "type": "emotion",
    "family": "emotion-disgust",
    "name": "Loathing",
    "meaning": "Intense and often sustained disgust or hatred toward a person, behavior, object, or idea.",
    "cue": "Choose a deeply established source of rejection. Let the strength and history of the feeling shape a specific refusal or boundary in the scene.",
    "relatedIds": [
      "voice-8",
      "physicality-5"
    ],
    "scenes": [
      {
        "setup": "At a reunion, your former manager asks you to join the company whose humiliation rituals you endured for years.",
        "line": "I still hear that bell when someone makes a mistake. I won't walk through that door again."
      },
      {
        "setup": "In a collector's showroom, a dealer offers you a trophy from the cruel animal contests you campaigned to end.",
        "line": "I don't want to own a prettier piece of it. I want that whole practice gone."
      },
      {
        "setup": "At a family meeting, your cousin suggests reviving the annual contest where relatives ridicule one another.",
        "line": "I hated it at twelve, I hate it now, and I won't teach our children to enjoy it."
      }
    ]
  },
  {
    "id": "emotion-11",
    "type": "emotion",
    "family": "emotion-connection",
    "name": "Affection",
    "meaning": "Warm fondness and positive regard for someone or something familiar and valued.",
    "cue": "Choose something specific you cherish about them. Let it affect how you receive even an ordinary offer.",
    "relatedIds": [
      "v21",
      "want-2"
    ],
    "scenes": [
      {
        "setup": "At a bus stop, your partner again produces the wrong timetable.",
        "line": "You have carried that one through three changes of government."
      },
      {
        "setup": "In a rehearsal room, your old scene partner uses their familiar warm-up sound.",
        "line": "There it is. Now it feels like a show."
      },
      {
        "setup": "At a family kitchen table, your brother carefully cuts the crusts off his toast.",
        "line": "You still do the corners first. I missed that."
      }
    ]
  },
  {
    "id": "emotion-29",
    "type": "emotion",
    "family": "emotion-connection",
    "name": "Tenderness",
    "meaning": "Gentle warmth and care toward someone perceived as precious, vulnerable, or deserving of softness.",
    "cue": "Choose the detail that softens your attention. Let care be specific rather than treating the other person as helpless.",
    "relatedIds": [
      "v24",
      "physicality-28"
    ],
    "scenes": [
      {
        "setup": "At a repair shop, you show the owner a worn toy belonging to your grown son.",
        "line": "Leave the crooked smile if you can. That is the part he loved."
      },
      {
        "setup": "In a rehearsal room, your partner struggles to share a personal monologue.",
        "line": "We have time. Start with the line you like most."
      },
      {
        "setup": "At a bus stop, your father keeps practicing the route to your new home.",
        "line": "We can take it together today. You can lead."
      }
    ]
  },
  {
    "id": "emotion-54",
    "type": "emotion",
    "family": "emotion-connection",
    "name": "Compassion",
    "meaning": "Concern for another person's difficulty accompanied by a desire for their suffering to lessen.",
    "cue": "Notice another character's difficulty and offer concrete care. Listen for what would help rather than assuming you already know.",
    "relatedIds": [
      "v24",
      "behavior-8",
      "want-8"
    ],
    "scenes": [
      {
        "setup": "At a bus station, a stranger is struggling to read a cancellation notice while comforting a tired child.",
        "line": "I can check the next departure while you sit with her, if that would help."
      },
      {
        "setup": "In a rehearsal studio, your partner admits they have forgotten the steps after a difficult week.",
        "line": "We can start slowly. You don't have to pretend it's an ordinary day."
      },
      {
        "setup": "At a repair shop, your apprentice expects to be dismissed after breaking a customer's lamp.",
        "line": "I can see how frightened you are. Come sit down and we'll work out how to put it right."
      }
    ]
  },
  {
    "id": "emotion-55",
    "type": "emotion",
    "family": "emotion-connection",
    "name": "Admiration",
    "meaning": "Warm appreciation for qualities, abilities, choices, or achievements you consider valuable.",
    "cue": "Choose a quality or action you appreciate in the other person. Be specific about what you noticed and why it matters to you.",
    "relatedIds": [
      "v8",
      "v12",
      "want-3"
    ],
    "scenes": [
      {
        "setup": "At a climbing gym, your friend patiently helps a beginner return safely to the floor.",
        "line": "You made getting down feel like an achievement. I wish I'd had you on my first day."
      },
      {
        "setup": "In a council office, your colleague admits a costly mistake before anyone else discovers it.",
        "line": "You could have let the paperwork hide that. I respect you for standing up."
      },
      {
        "setup": "At a tailor's bench, you watch your aunt turn a damaged coat into a beautifully fitted jacket.",
        "line": "You saw that shape before you even picked up the scissors. How do you do that?"
      }
    ]
  },
  {
    "id": "emotion-12",
    "type": "emotion",
    "family": "emotion-connection",
    "name": "Gratitude",
    "meaning": "Warm appreciation for something beneficial, meaningful, or generous that you have received or recognized.",
    "cue": "Name the specific gift or action and its effect. Let the other person decide how to receive your thanks.",
    "relatedIds": [
      "v24",
      "behavior-23"
    ],
    "scenes": [
      {
        "setup": "At your front door, your neighbor returns a repaired coat before winter.",
        "line": "You fixed the inside pocket too. I never even asked."
      },
      {
        "setup": "In a classroom, you visit the teacher who encouraged your first poem.",
        "line": "I kept the page with your note on it."
      },
      {
        "setup": "At a train platform, your friend arrives early just to see you off.",
        "line": "You could have stayed in bed. I know how much that means."
      }
    ]
  },
  {
    "id": "emotion-56",
    "type": "emotion",
    "family": "emotion-connection",
    "name": "Love",
    "meaning": "Deep care, attachment, and valuing of another person, group, place, activity, or meaningful part of life.",
    "cue": "Choose what you deeply value about this bond. Let care emerge in how you attend to the person, including when you want different things.",
    "relatedIds": [
      "v21",
      "v20",
      "want-2"
    ],
    "scenes": [
      {
        "setup": "In a small kitchen, your spouse worries that a new job would mean starting over in another city.",
        "line": "I like this kitchen. I love you. Let's look at the map together."
      },
      {
        "setup": "At a station, your adult child apologizes for needing to come home after a failed venture.",
        "line": "You don't need a success story to come through our door."
      },
      {
        "setup": "Backstage after your oldest friend's final concert, they ask what you will do without the weekly rehearsals.",
        "line": "Come on Thursdays anyway. You were never just the person with the violin."
      }
    ]
  },
  {
    "id": "emotion-57",
    "type": "emotion",
    "family": "emotion-self-conscious",
    "name": "Awkwardness",
    "meaning": "Social discomfort that arises when expectations about what to say or do feel unclear.",
    "cue": "Choose a social situation with unclear expectations. Let an uncertain greeting, pause, or honest question give your partner something to resolve.",
    "relatedIds": [
      "voice-2",
      "physicality-2"
    ],
    "scenes": [
      {
        "setup": "At a work party, you discover your new supervisor is the person whose parking you complained about that morning.",
        "line": "Hello again. I see we've both found a space now."
      },
      {
        "setup": "At a formal dinner, you and the host reach for an unfamiliar ceremonial serving spoon.",
        "line": "Am I helping, or have I just interrupted a tradition?"
      },
      {
        "setup": "At a friend's front door, you arrive dressed for a costume party and find everyone in ordinary clothes.",
        "line": "Before I take off the antennae, is there another party upstairs?"
      }
    ]
  },
  {
    "id": "emotion-6",
    "type": "emotion",
    "family": "emotion-self-conscious",
    "name": "Embarrassment",
    "meaning": "Discomfort following a social mistake, awkward exposure, or moment in which you believe you appeared foolish.",
    "cue": "Decide whose opinion matters in the moment. Let their reaction make the feeling grow or ease.",
    "relatedIds": [
      "v12",
      "physicality-2",
      "want-6"
    ],
    "scenes": [
      {
        "setup": "In a café, your date realizes you rehearsed your greeting with the barista.",
        "line": "He was supposed to be on his break by now."
      },
      {
        "setup": "At a staff meeting, your manager opens the slideshow containing your holiday karaoke photo.",
        "line": "That is not the graph, but it was a strong quarter."
      },
      {
        "setup": "In a library, your old teacher hears you bragging that you never needed school.",
        "line": "Except the reading part. Obviously that has been useful."
      }
    ]
  },
  {
    "id": "emotion-19",
    "type": "emotion",
    "family": "emotion-self-conscious",
    "name": "Guilt",
    "meaning": "Distress about something you believe you did, failed to do, or contributed to that violated your values.",
    "cue": "Choose what you did and whom it affected. Let the feeling push toward admission, repair, or an attempt to avoid it.",
    "relatedIds": [
      "want-6",
      "b24"
    ],
    "scenes": [
      {
        "setup": "At a school fair, you face the child whose raffle ticket you misplaced.",
        "line": "I put it in the wrong box. You trusted me with it."
      },
      {
        "setup": "In a greenhouse, you confess to your neighbor that you forgot their plants.",
        "line": "I remembered the key every day. I did not remember the watering."
      },
      {
        "setup": "At a café, you admit sharing something your friend told you privately.",
        "line": "I wanted to sound informed. It was not mine to tell."
      }
    ]
  },
  {
    "id": "emotion-20",
    "type": "emotion",
    "family": "emotion-self-conscious",
    "name": "Shame",
    "meaning": "Painful self-evaluation in which a mistake, exposure, or perceived shortcoming feels connected to your worth or identity.",
    "cue": "Choose whose judgment matters. Let their actual response affect your interpretation rather than treating your fear as certainty.",
    "relatedIds": [
      "emotion-6",
      "behavior-18"
    ],
    "scenes": [
      {
        "setup": "At a bank, you meet a former classmate while asking for help with overdue bills.",
        "line": "I thought I would have a better story if we ever ran into each other."
      },
      {
        "setup": "In a rehearsal, your mentor hears you mock a beginner’s mistake.",
        "line": "That sounded worse out loud. I learned that mistake from you."
      },
      {
        "setup": "At a family table, your child discovers you never finished the course you bragged about.",
        "line": "I wanted you to think I had already done the hard part."
      }
    ]
  },
  {
    "id": "emotion-58",
    "type": "emotion",
    "family": "emotion-self-conscious",
    "name": "Humiliation",
    "meaning": "Pain associated with feeling publicly lowered, degraded, powerless, or stripped of dignity.",
    "cue": "Choose whose public judgment has hurt your character's dignity. Let them respond or seek support without requiring the scene partner to continue the degradation.",
    "relatedIds": [
      "v12",
      "voice-3",
      "want-6"
    ],
    "scenes": [
      {
        "setup": "After a staff meeting, you confront the manager who projected your private mistake for everyone to laugh at.",
        "line": "You could have spoken to me at my desk. You made me stand there while they laughed."
      },
      {
        "setup": "Outside a restaurant, you speak to your date after the host loudly mocked your inability to pay.",
        "line": "I could have explained the card quietly. Now everybody in there knows my name."
      },
      {
        "setup": "In a dance studio, you talk to the instructor after they used your audition as a public example of failure.",
        "line": "I came here to learn. I didn't know that meant becoming the joke they take home."
      }
    ]
  },
  {
    "id": "emotion-5",
    "type": "emotion",
    "family": "emotion-self-conscious",
    "name": "Pride",
    "meaning": "Positive self-evaluation connected to an achievement, quality, effort, identity, or group affiliation you value.",
    "cue": "Choose whose achievement matters. Explore quiet satisfaction as well as a public celebration.",
    "relatedIds": [
      "v8",
      "physicality-1",
      "want-3"
    ],
    "scenes": [
      {
        "setup": "At a bike workshop, your apprentice finishes their first repair without help.",
        "line": "I am going to ride this one home."
      },
      {
        "setup": "At a courthouse, your sister shows you the papers for her new business.",
        "line": "They spelled your name right. On your own door."
      },
      {
        "setup": "In a community garden, your neighbor tastes the first tomato you grew.",
        "line": "Last year I could not keep a cactus alive. Take another slice."
      }
    ]
  }
];
