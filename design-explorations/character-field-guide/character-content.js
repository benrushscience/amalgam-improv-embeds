/* Character collection v1. Original examples inspired by the course's entry points.
   These are playable invitations, not personality diagnoses or fixed trait pairings. */
(() => {
  'use strict';
  const content = window.referenceContent;
  window.characterCollections = {
    physicality:{name:'Physicality', singular:'Physicality', question:'How they move', description:'Posture, movement, space, and imaginary objects. Start with a physical choice and discover who uses it.'},
    voice:{name:'Voice', singular:'Voice', question:'How they sound', description:'Pace, pitch, volume, rhythm, and phrasing. Change one quality while keeping your partner’s words in focus.'},
    behavior:{name:'Behaviors', singular:'Behavior', question:'What they repeat', description:'A recurring action or habit. Repeat it in response to new offers so the pattern can develop.'},
    emotion:{name:'Emotions', singular:'Emotion', question:'What they feel', description:'A feeling about someone or something right now. Let the relationship and new information affect its intensity.'},
    want:{name:'Wants', singular:'Want', question:'What they seek', description:'Something to obtain, change, or receive from another character in this scene. Try different ways of pursuing it.'},
    value:{name:'Values', singular:'Value', question:'What matters to them', description:'What a character considers important, such as fairness or family. A value can guide many different decisions.'},
    belief:{name:'Beliefs', singular:'Belief', question:'What they believe', description:'An idea accepted as true or right, such as “People can change.” It shapes how a character interprets an offer.'}
  };
  const counts = {};
  // Readable arguments keep each choice and its three independent scenes together.
  function add(type, familyName, name, meaning, cue, relatedIds, scenes) {
    counts[type] = (counts[type] || 0) + 1;
    const id = `${type}-${counts[type]}`;
    const family = `${type}-${familyName.toLowerCase().replace(/[^a-z]+/g,'-')}`;
    if (!content.families.some(item => item.id === family)) content.families.push({id:family,name:familyName,type});
    content.entries.push({id,type,family,name,meaning,cue,relatedIds,kind:window.characterCollections[type].singular});
    window.characterScenePrompts[id] = scenes.map(([setup,line]) => ({setup,line}));
  }

  // Physical choices can be made standing or seated, at a comfortable scale.
  add('physicality','Posture & shape','Lead with the chest','Let your chest initiate a comfortable turn or movement before the rest of you follows.','Try a small forward lift while seated or standing. Let the posture suggest a character without deciding their personality in advance.',['v12','emotion-5','want-3'],[
    ['At a community pool, you present your first swimming certificate to your older sibling. Let your chest lead the approach.','They put me in the deep end today. On purpose.'],
    ['In a tailor’s shop, you square your chest toward the mirror while your partner studies the wedding suit.','This is the version of me I want your parents to meet.'],
    ['Outside a space station, you turn chest-first toward the trainee about to make their first repair.','Watch me. We have practiced this exact move.']
  ]);
  add('physicality','Posture & shape','Fold inward','Bring your elbows closer and make your physical outline smaller.','Keep your breathing easy. Explore whether this shape comes from comfort, secrecy, concentration, or something else.',['v14','voice-3','emotion-6'],[
    ['At a surprise party, you tuck yourself behind a narrow curtain with your cousin.','If she sees one elbow, we have wasted forty balloons.'],
    ['On a night train, you curl around the parcel your sister asked you to deliver.','You can have my seat. The cake stays with me.'],
    ['In a ceramics class, you fold close around your work as the instructor passes.','Please look at the handle before you look at the rest.']
  ]);
  add('physicality','Movement & tempo','Move in slow motion','Take unhurried, continuous time with each physical action while the scene carries on.','Slow the movement, not your listening. Allow your partner’s offer to change what you are doing.',['voice-2','v15','emotion-8'],[
    ['At a breakfast counter, you lower a spoon into your tea while your roommate announces the bus has arrived.','I am very pleased for the bus.'],
    ['In an art gallery, you slowly unwrap a painting for an impatient buyer.','You have waited ten years. Give her another ten seconds.'],
    ['At a campsite, you deliberately untie a knot while your child pulls at the tent.','We are going to leave this rope with its dignity.']
  ]);
  add('physicality','Movement & tempo','Move in quick bursts','Alternate short, quick actions with distinct moments of stillness.','Use small movements in your own space. Notice what catches your attention and what makes you stop.',['voice-1','emotion-1','v10'],[
    ['In a flower shop, you dart between imaginary vases, then freeze when your apprentice asks about the wedding order.','The yellow ones. Wait. Which wedding?'],
    ['At a birdwatching hide, you turn rapidly toward each sound and stop to listen beside your friend.','There. No, there. This is the best silence I have ever heard.'],
    ['During a board game, you reach for several pieces before holding one perfectly still.','Nobody breathe. I have almost understood the rules.']
  ]);
  add('physicality','Space & attention','Stay rooted','Keep one chosen position while the scene changes around you.','Your attention, hands, and expression can move even when you stay in place. Find a reason to move if the scene offers one.',['v18','want-4','behavior-7'],[
    ['In an airport, you remain beside the arrivals sign while your son suggests getting lunch.','Your mother said she would find us here.'],
    ['At a neighborhood meeting, you stay at the microphone after the chair announces the next speaker.','I still have a question about the tree.'],
    ['In a rehearsal room, you hold your mark while the director rearranges every chair.','This is where he said goodbye. I would like to keep that.']
  ]);
  add('physicality','Space & attention','Make expansive gestures','Let gestures describe generous shapes and claim more of your own available space.','Keep the scale comfortable and respect your partner’s space. Try the same gesture for an ordinary and a momentous offer.',['voice-7','v5','emotion-1'],[
    ['At a kitchen table, you spread your hands to unveil plans for a tiny balcony garden to your spouse.','And here, between the drainpipe and your bicycle, the orchard.'],
    ['In a museum, you frame a small fossil with a grand sweep while training a new guide.','This pebble has had a much longer career than either of us.'],
    ['At a reunion, you open your arms to describe the size of your new apartment to a cousin.','There is room for a chair that nobody has to fold.']
  ]);
  add('physicality','Objects & activity','Carry something precious','Give an imaginary object a consistent size, weight, and special place in your attention.','Decide where the object rests and how you handle it. Let its importance emerge through your relationship.',['v20','behavior-8','want-4'],[
    ['At a bus stop, you cradle a jar of sourdough starter while your friend offers to hold your bags.','This one is technically my grandmother. Be gentle.'],
    ['Backstage, you hold a repaired paper crown while your child reaches for it.','The glue is dry. Your kingdom is ready.'],
    ['In an empty office, you carefully carry a desk plant to the colleague taking your job.','She leans toward whoever tells her the truth.']
  ]);
  add('physicality','Objects & activity','Share a physical task','Build the same imaginary activity with your partner, responding to its weight, rhythm, and changing demands.','Offer one clear action, then match what your partner establishes. The activity can continue underneath the conversation.',['v22','behavior-6','want-8'],[
    ['You and your neighbor fold a giant sheet in a laundromat, adjusting to one another’s pull.','I have lived upstairs for six years. This is the first thing we have agreed on.'],
    ['You and your captain row a small boat toward shore, keeping an uneven rhythm together.','If we are going to argue, can we argue on the same beat?'],
    ['You and your sibling assemble a crib, each holding a different end steady.','Dad always had parts left over. We can break that tradition.']
  ]);

  // Vocal variation uses delivery rather than borrowed identities or accents.
  add('voice','Pace & pauses','Rapid-fire','Let your thoughts arrive in a quick stream of clearly spoken words.','Choose a comfortable speed. Leave real openings for your partner instead of filling every silence.',['physicality-4','emotion-1','want-3'],[
    ['At a bakery, you explain your first order to the owner in one excited stream.','Two loaves, one cake, no candles—actually one candle, it is a very small promotion.'],
    ['In a detective’s office, you recount everything you noticed at your neighbor’s barbecue.','The apron changed, the dog left, and nobody touched the mustard.'],
    ['On a moving-day phone call, you try to explain the apartment to your incoming roommate.','Great light, lovely street, one tiny detail: we share the shower with a fern.']
  ]);
  add('voice','Pace & pauses','Deliberate pauses','Leave a little space before an answer or between important thoughts.','Listen through the pause. Let each silence have attention rather than planning an entire speech.',['physicality-3','v8','want-5'],[
    ['At a pawnshop, you consider the offer for your old trumpet. Pause before naming your price.','That is a fair price. For the case.'],
    ['In a staff meeting, your manager asks if the team enjoyed the retreat. Take a beat.','The lake was beautiful.'],
    ['In a greenhouse, your child asks whether the dead-looking seed will grow. Wait, then answer.','We have not met it yet.']
  ]);
  add('voice','Volume & pitch','An intimate volume','Speak as though the conversation belongs to the person beside you, while remaining audible.','Use an easy, supported speaking voice. Intimacy can come from attention and phrasing without a strained whisper.',['physicality-2','v21','want-2'],[
    ['At a crowded auction, you quietly confide your limit to the friend holding your paddle.','If I nod again, remind me that we also need groceries.'],
    ['In a spaceship kitchen, you share good news with the cook as if it is a precious secret.','They named the new moon after your soup.'],
    ['At a school reunion, you lower the scale of your voice when your former rival approaches.','I kept the note you left in my locker.']
  ]);
  add('voice','Volume & pitch','A lifted pitch','Explore a slightly higher part of your comfortable speaking range.','Let pitch be a sound choice, not an assumption about age, gender, or intelligence. Keep the sound easy.',['emotion-34','v3','want-1'],[
    ['At a reptile shop, you greet the enormous snake your partner wants to adopt with a lifted pitch.','Hello, potential roommate. We have some cupboard rules.'],
    ['During a radio interview, you describe finding a new star to the presenter.','It was hiding right beside the one everybody photographs.'],
    ['At a pottery sale, you defend your unusually shaped mug to a skeptical shopper.','It has room for every finger you currently own.']
  ]);
  add('voice','Rhythm & emphasis','A lilting rhythm','Allow your pitch to rise and fall in a repeating, musical pattern.','Use ordinary dialogue. Find a gentle rhythm that can change when your partner surprises you.',['v7','physicality-6','emotion-8'],[
    ['At a library counter, you announce an overdue charge to a regular patron with a lilting rhythm.','Three weeks, two holidays, and one very patient book.'],
    ['On a ferry, you reassure your brother about the approaching storm with a rise and fall in your voice.','A little wind, a little rain, a very large boat.'],
    ['At a gardening contest, you describe your lone tomato to the judge.','She took her time, she chose her spot, and here she is.']
  ]);
  add('voice','Rhythm & emphasis','Unexpected emphasis','Give an ordinary word more weight than the listener expects.','Choose one word to emphasize, then discover why it matters in this conversation.',['b8','behavior-5','emotion-34'],[
    ['At a family dinner, stress “Tuesday” when your father reveals his secret.','You bought a horse on a TUESDAY?'],
    ['In a hotel lobby, emphasize “second” while speaking to the manager.','This is the SECOND swan in my room.'],
    ['At a costume fitting, emphasize “my” while your friend examines a jacket.','That used to be MY pirate coat.']
  ]);
  add('voice','Words & articulation','Ceremoniously formal','Use complete, carefully chosen phrases for even the smallest exchange.','Keep the meaning clear. Notice what happens when formal language meets a familiar relationship.',['v18','behavior-1','want-3'],[
    ['In your kitchen, you formally address your roommate about the last biscuit.','I would like to submit a claim based on prior tea preparation.'],
    ['At a dog park, you introduce your puppy to a longtime friend with great ceremony.','May I present the newest member of our household, pending carpet review.'],
    ['In a repair shop, you thank the mechanic as though conferring an honor.','Your service to this bicycle will not be forgotten.']
  ]);
  add('voice','Words & articulation','Clipped phrases','Speak in short, distinct units with clear endings.','Keep hearing the full offer even when you answer briefly. A short line can still carry warmth or vulnerability.',['v10','physicality-5','want-7'],[
    ['At a campsite, you organize dinner with your cousin as rain begins.','Pan. Beans. Shelter. In that order.'],
    ['In a jewelry shop, you struggle to explain a gift to the clerk.','For my dad. First visit. Long story.'],
    ['At a school office, you tell the principal why you came back after graduation.','Found this. Your pen. Still works.']
  ]);

  // Behaviors are repeatable choices with room for a partner to influence the pattern.
  add('behavior','Order & control','Straighten everything','Repeatedly bring objects into an arrangement that feels right to you.','Start with one adjustment. Let the next correction respond to what your partner has just changed.',['v15','physicality-7','want-7'],[
    ['At a job interview, you align the interviewer’s imaginary pencils before answering.','I work well in a structured environment. We nearly have one.'],
    ['At a picnic, you move each sandwich into a neat row while your brother announces his engagement.','That is wonderful. Where will he sit in the sandwich system?'],
    ['On a pirate ship, you square up the treasure piles while the captain celebrates.','We can be lawless and still have categories.']
  ]);
  add('behavior','Order & control','Take over the plan','Respond to new situations by assigning tasks or proposing the next steps.','Give your partner something to accept, reshape, or challenge. Discover what happens when someone else has a plan.',['b9','v11','want-7'],[
    ['At a surprise baby shower, you begin assigning jobs before realizing the party is for you.','You handle drinks. You handle balloons. Who is supervising my surprise?'],
    ['In a stalled elevator, you appoint your neighbor as morale officer.','Tell us one reassuring fact about cables.'],
    ['At a campsite, you rearrange your friend’s stargazing schedule.','Moon first. Then wonder. We can fit silence in at nine.']
  ]);
  add('behavior','Connection & reassurance','Seek reassurance','Return to the other person for signs that you are welcome, useful, or doing enough.','Vary the request in response to the answer; let reassurance land before you need it again.',['want-1','emotion-2','b4'],[
    ['At a pottery class, you check with your tablemate after every change to your bowl.','Better? You would put actual soup in that?'],
    ['On a space mission, you ask your captain about the welcome banner you hung.','Was “Hello, possibly friendly beings” too cautious?'],
    ['At a family barbecue, you watch your uncle taste your marinade.','That was a good silence, right?']
  ]);
  add('behavior','Connection & reassurance','Celebrate every small win','Notice and openly applaud the other person’s ordinary accomplishments.','Make each celebration specific. Let your partner’s response affect how large or private the next one becomes.',['v12','emotion-1','want-8'],[
    ['In a driving lesson, you celebrate your friend adjusting the mirror.','You can see behind us! We already have twice the world!'],
    ['At a museum opening, you applaud the curator successfully removing a price sticker.','A flawless restoration. Before the doors even open.'],
    ['In a shared kitchen, you toast your roommate finally opening a stubborn jar.','To your courage, your grip, and our dinner.']
  ]);
  add('behavior','Words & attention','Echo their last words','Repeat a word or phrase your partner has just used, giving it fresh attention.','Echo selectively, then add a response. Let the repeated words change meaning rather than blocking the conversation.',['voice-6','emotion-34','v3'],[
    ['At a bank, the adviser describes your account as “unusual.” You repeat the word.','Unusual. Like a rare jewel, or like a smell?'],
    ['In a garden, your spouse says the shed is “mostly finished.”','Mostly finished. Which part is still weather?'],
    ['At a rehearsal, the director calls your entrance “unforgettable.”','Unforgettable. I would like that in writing before we discuss the window.']
  ]);
  add('behavior','Words & attention','Reveal too much','Offer more personal detail than the immediate question seems to require.','Make the detail fictional and specific. Notice whether your partner welcomes it or tries to return to the task.',['v21','b24','want-2'],[
    ['At a café, the barista asks your name for the cup.','Alex. Though my father only uses it when a ladder has broken.'],
    ['At a furniture shop, the salesperson asks whether you prefer a firm sofa.','I need one that says I am ready to host again after the accordion incident.'],
    ['At passport control, the officer asks the purpose of your visit.','Vacation. Also proving my sister wrong about how far I can travel alone.']
  ]);
  add('behavior','Attachment & ritual','Check one more time','Return to a detail you have already checked before allowing yourself to continue.','Make the check visible and repeatable. Explore what new information finally changes it.',['v14','b12','emotion-2'],[
    ['Outside your bakery, you test the imaginary lock again while your friend waits for you.','I know I locked it. I want the door to know I know.'],
    ['At a wedding rehearsal, you count the rings in your pocket while the couple practices vows.','Still two. This is going very well.'],
    ['In a greenhouse, you reread a seed label before your apprentice waters the tray.','Before we commit: are we growing lunch or a hedge?']
  ]);
  add('behavior','Attachment & ritual','Offer an object as comfort','Respond to another person’s uncertainty by handing them a familiar imaginary object.','Keep the object consistent. Explore what giving it away costs you and whether the other person wants it.',['physicality-7','v24','want-8'],[
    ['At a bus station, you offer your lucky spoon to a friend leaving town.','It has been to three interviews and only one bad soup.'],
    ['Backstage at a debate, you hand your nervous rival a tiny toy dinosaur.','Hold him under the lectern. He agrees with everyone.'],
    ['In an empty apartment, you give the new tenant a mug before handing over the keys.','The first night sounds less empty if you have tea.']
  ]);

  // Wants point toward an immediate change, with tactics left open to discovery.
  add('want','Belonging & connection','Get them to include me','Seek a place in the other person’s group, plan, or shared experience.','Choose a concrete invitation you want. Offer, ask, or make yourself useful, then respond to their answer.',['v22','behavior-3','emotion-2'],[
    ['At work, you see your colleagues organizing a trivia team without you.','I know every capital and I can drive. Is there one chair left?'],
    ['In a royal kitchen, you ask the head baker to let you join the feast preparations.','Give me the ugly potatoes. I will make them banquet-worthy.'],
    ['At a park, you approach neighbors rehearsing a dance for the block party.','I have been practicing from my window. Could I try the back row?']
  ]);
  add('want','Belonging & connection','Get them to stay','Try to keep this person here for a little longer.','Make the reason personal. Change your approach if they are still leaving; give them room to answer.',['v21','voice-3','emotion-4'],[
    ['At your front door, your brother picks up his suitcase after a brief visit.','The kettle has just boiled. Miss one train with me.'],
    ['In a closing diner, you ask the owner to wait while you finish a difficult story.','I have almost reached the part I needed to tell someone.'],
    ['At a rehearsal, your scene partner says they are quitting the show.','Do our first scene with me once more before you decide.']
  ]);
  add('want','Recognition & influence','Get them to take me seriously','Seek acknowledgment that your contribution or concern deserves real attention.','Choose what you want the other person to hear or do. Try a tactic beyond announcing that you deserve respect.',['v12','physicality-1','voice-7'],[
    ['In a family garage, your father dismisses your repair idea.','Hand me the wrench for five minutes. Then tell me I do not understand the engine.'],
    ['At a town meeting, the chair keeps calling your proposal a hobby.','Please put the flood map on the screen before you call it a garden project again.'],
    ['On a pirate ship, the captain laughs at your weather forecast.','Look at the rope. It was dry when I started talking.']
  ]);
  add('want','Protection & security','Keep them safe','Try to prevent a specific harm to someone who matters to you.','Know what you are protecting them from. Discover how much control they will accept and whether your fear fits the situation.',['v14','v24','physicality-7'],[
    ['At an icy bus stop, you try to persuade your neighbor to accept a ride.','You can hate my music for ten minutes. Please get in.'],
    ['In a castle kitchen, you stop your apprentice carrying a heavy pot alone.','Your promotion does not require a burn. Take this end with me.'],
    ['At a science fair, your child reaches toward the sparking invention.','I want to see it work too. Let us unplug it before we touch that wire.']
  ]);
  add('want','Recognition & influence','Get them to change their mind','Pursue a different decision from someone who already has a position.','Find what matters to them and try an appeal. Their refusal is a new offer, not a reason to repeat your speech.',['v11','b8','voice-2'],[
    ['At a music shop, your bandmate wants to sell the old keyboard.','Play the first song we wrote before you put a price on it.'],
    ['At a family dinner, your mother insists on hosting every holiday again.','Let me burn the potatoes this year. You have earned a seat.'],
    ['In a research station, the commander wants to abandon the garden experiment.','Taste the lettuce. Then tell me it is only taking up space.']
  ]);
  add('want','Repair & forgiveness','Get them to forgive me','Seek a way forward after you have hurt or disappointed the other person.','Make the harm concrete. Offer repair and hear their answer rather than deciding that forgiveness has happened.',['v21','b24','emotion-6'],[
    ['At your sister’s apartment, you return the dress you borrowed and damaged.','I told you it was a loose thread. I should have told you about the gate.'],
    ['In a radio booth, you apologize to your cohost for taking credit for their story.','I have written a correction. I want you to read it before we go on air.'],
    ['At a community garden, you face the neighbor whose plants you accidentally removed.','I cannot put the old ones back. Can you show me where to start again?']
  ]);
  add('want','Control & freedom','Get my way','Seek agreement to the particular outcome you have already chosen.','Name a specific result. Try persuasion, bargaining, or an appeal to the relationship instead of treating refusal as impossible.',['v11','b9','behavior-2'],[
    ['At a family holiday meeting, you want everyone to choose your mountain cabin.','I will cook every breakfast if we go somewhere without a revolving restaurant.'],
    ['In a costume workshop, you insist that your dragon needs pockets.','I understand the historical objections. Where will I keep the keys?'],
    ['At a neighborhood film club, you pitch the same movie for the third month.','This time I have brought the director. He can stay for questions.']
  ]);
  add('want','Care & contribution','Make their day easier','Seek a concrete improvement in the other person’s immediate experience.','Offer something specific and check whether it helps. Discover what they need rather than assigning it to them.',['v24','behavior-8','physicality-8'],[
    ['At a crowded café, your coworker is juggling orders and a broken till.','I can take the queue or wash the cups. Which would help more?'],
    ['In a hospital waiting room, you sit beside your tired aunt.','I brought your charger. Do you want company or ten quiet minutes?'],
    ['At a moving van, your friend stares at the last enormous box.','You tell me where it goes. I will find the other end.']
  ]);
  // Append curated expansions after the original choices to keep existing entry URLs stable.
  for (const choice of window.characterAdditions || []) add(...choice);

  // The emotion wheel owns this collection's taxonomy; preserve its family and entry order.
  content.families.push(...window.characterEmotionFamilies);
  for (const {scenes, ...entry} of window.characterEmotions) {
    content.entries.push({...entry, kind:window.characterCollections.emotion.singular});
    window.characterScenePrompts[entry.id] = scenes;
  }
})();
